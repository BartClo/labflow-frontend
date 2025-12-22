/**
 * Samples Service
 * 
 * Handles all sample-related API operations
 */

import apiClient from '../client';
import { PRIORITY_MAPPING, STATUS_MAPPING, VOLUME_UNITS } from '../constants/samples';

/**
 * Transform form data to backend format
 */
const transformSampleData = (formData) => {
  return {
    numero_interno: formData.internal_number,
    codigo_barras: formData.scanned_barcode || formData.internal_number, // Use internal_number as fallback
    id_cliente: formData.client_id,
    punto_muestreo: formData.sampling_point,
    tipo_muestra: formData.sample_type,
    prioridad: PRIORITY_MAPPING[formData.priority] || 'MEDIA',
    fecha_muestreo: formData.sampling_date ? new Date(formData.sampling_date).toISOString() : new Date().toISOString(),
    fecha_recepcion: formData.reception_date ? new Date(formData.reception_date).toISOString() : new Date().toISOString(),
    responsable_muestreo: formData.sampler_name || formData.received_by,
    temperatura_transporte: formData.transport_conditions?.temperature ? parseFloat(formData.transport_conditions.temperature) : null,
    condiciones_transporte: formData.transport_conditions?.preservation || '',
    tipo_envase: formData.transport_conditions?.container_type || '',
    conservantes_utilizados: !!formData.transport_conditions?.preservation,
    descripcion_conservantes: formData.transport_conditions?.preservation || '',
    observaciones: formData.observations || '',
    estado: STATUS_MAPPING[formData.status] || 'RECIBIDA',
    analisis_ids: formData.requested_tests || [],
    info_cliente: formData.client_info || '',
    metodo_analisis: formData.analysis_method || '',
    volumen_muestra: formData.sample_volume ? parseFloat(formData.sample_volume) : 0,
    unidad_volumen: formData.volume_unit || VOLUME_UNITS.ML
  };
};

/**
 * Map frontend priority to backend format
 * @deprecated Use PRIORITY_MAPPING from constants instead
 */
const mapPriorityToBackend = (priority) => {
  return PRIORITY_MAPPING[priority] || 'MEDIA';
};

/**
 * Map frontend status to backend format
 * @deprecated Use STATUS_MAPPING from constants instead
 */
const mapStatusToBackend = (status) => {
  return STATUS_MAPPING[status] || 'RECIBIDA';
};

/**
 * Validate sample data before sending to backend
 */
const validateSampleData = (formData) => {
  const errors = [];

  if (!formData.internal_number) {
    errors.push('Número interno es requerido');
  }

  if (!formData.client_id) {
    errors.push('Cliente es requerido');
  }

  if (!formData.sampling_point) {
    errors.push('Punto de muestreo es requerido');
  }

  if (!formData.sample_type) {
    errors.push('Tipo de muestra es requerido');
  }

  if (!formData.reception_date) {
    errors.push('Fecha de recepción es requerida');
  }

  if (formData.transport_conditions?.temperature && 
      (isNaN(formData.transport_conditions.temperature) || 
       formData.transport_conditions.temperature < -100 || 
       formData.transport_conditions.temperature > 100)) {
    errors.push('Temperatura de transporte debe estar entre -100°C y 100°C');
  }

  if (formData.sample_volume && 
      (isNaN(formData.sample_volume) || 
       formData.sample_volume <= 0)) {
    errors.push('Volumen de muestra debe ser un número positivo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const samplesService = {
  /**
   * Get all samples
   */
  getAll: async (params = {}) => {
    try {
      // Si no hay parámetros, hacer una llamada simple
      const response = Object.keys(params).length === 0 
        ? await apiClient.get('/muestras')
        : await apiClient.get('/muestras', { params });
        
      // Handle paginated response - extract content array
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      // Handle direct array response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Fallback to empty array
      return [];
    } catch (error) {
      console.error('Error in samples getAll:', error);
      throw error;
    }
  },

  /**
   * Get all samples with pagination info
   */
  getAllWithPagination: async (params = {}) => {
    try {
      console.log('Fetching samples with pagination, params:', params);
      
      const response = Object.keys(params).length === 0 
        ? await apiClient.get('/muestras')
        : await apiClient.get('/muestras', { params });
        
      console.log('Samples response with pagination:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in samples getAllWithPagination:', error);
      throw error;
    }
  },

  /**
   * Get a single sample by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/muestras/${id}`);
    return response.data;
  },

  /**
   * Create a new sample
   */
  create: async (sampleData) => {
    // Validate data before sending
    const validation = validateSampleData(sampleData);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }

    const transformedData = transformSampleData(sampleData);
    const response = await apiClient.post('/muestras', transformedData);
    return response.data;
  },

  /**
   * Create a new sample from template
   */
  createFromTemplate: async (sampleData, templateId) => {
    // Validate data before sending
    const validation = validateSampleData(sampleData);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }

    const transformedData = transformSampleData(sampleData);
    // If creating from template, we might need to fetch template analyses
    if (templateId && !transformedData.analisis_ids.length) {
      // This would need to be implemented based on how templates work
      // For now, we'll assume the frontend handles this
    }
    const response = await apiClient.post('/muestras', transformedData);
    return response.data;
  },

  /**
   * Update an existing sample
   */
  update: async (id, sampleData) => {
    const transformedData = transformSampleData(sampleData);
    const response = await apiClient.put(`/muestras/${id}`, transformedData);
    return response.data;
  },

  /**
   * Delete a sample
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/muestras/${id}`);
    return response.data;
  },

  /**
   * Get samples by client ID
   */
  getByClientId: async (clientId) => {
    const response = await apiClient.get(`/muestras/client/${clientId}`);
    return response.data;
  },

  /**
   * Get samples by work order ID
   */
  getByWorkOrderId: async (workOrderId) => {
    const response = await apiClient.get(`/muestras/work-order/${workOrderId}`);
    return response.data;
  },

  /**
   * Update sample status
   */
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/muestras/${id}/status`, { status });
    return response.data;
  },
};

// Export utility functions for external use
export { transformSampleData, validateSampleData };

export default samplesService;
// Backwards-compatible alias
samplesService.list = samplesService.getAll;
