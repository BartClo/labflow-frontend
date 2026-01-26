/**
 * Samples Service
 * 
 * Handles all sample-related API operations
 */

import apiClient from '../client';
import { PRIORITY_MAPPING, STATUS_MAPPING, VOLUME_UNITS } from '../constants/samples';

// Utility function for debugging objects
const debugLog = (label, obj) => {
  console.log(`${label}:`);
  console.log(JSON.stringify(obj, null, 2));
};

/**
 * Transform form data to backend format
 */
const transformSampleData = (formData) => {
  // Convert temperature to Celsius if needed
  let temperatureCelsius = null;
  if (formData.transport_conditions?.temperature) {
    const temp = parseFloat(formData.transport_conditions.temperature);
    if (!isNaN(temp)) {
      if (formData.transport_conditions.temperature_unit === 'fahrenheit') {
        // Convert Fahrenheit to Celsius: (°F - 32) × 5/9
        temperatureCelsius = (temp - 32) * (5/9);
      } else {
        // Already in Celsius
        temperatureCelsius = temp;
      }
    }
  }

  // Safe date formatting for Java LocalDateTime (without timezone)
  const formatDateSafely = (dateInput) => {
    if (!dateInput) {
      // Return current date in LocalDateTime format (without Z)
      return new Date().toISOString().slice(0, 19);
    }
    
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date provided:', dateInput, 'using current date');
        return new Date().toISOString().slice(0, 19);
      }
      // Convert to LocalDateTime format: remove 'Z' and milliseconds precision
      return date.toISOString().slice(0, 19);
    } catch (error) {
      console.warn('Error parsing date:', dateInput, error, 'using current date');
      return new Date().toISOString().slice(0, 19);
    }
  };

  // Complete payload with all form data
  const completePayload = {
    numero_interno: String(formData.internal_number || ''),
    codigo_barras: String(formData.scanned_barcode || formData.internal_number || ''),
    id_cliente: String(formData.client_id || ''),
    punto_muestreo: String(formData.sampling_point || ''),
    tipo_muestra: String(formData.sample_type || 'agua'),
    prioridad: String(PRIORITY_MAPPING[formData.priority] || 'BAJA'),
    fecha_recepcion: String(formatDateSafely(formData.reception_date)),
    fecha_muestreo: formData.sampling_date ? String(formatDateSafely(formData.sampling_date)) : null,
    responsable_muestreo: String(formData.received_by || 'Técnico'),
    estado: String(STATUS_MAPPING[formData.status] || 'RECIBIDA'),
    analisis_ids: Array.isArray(formData.requested_tests) ? formData.requested_tests : [],
    observaciones: formData.observations || '',
    volumen_muestra: formData.sample_volume ? String(formData.sample_volume) : null,
    nombre_proyecto: formData.project_name || '',
    numero_solicitud: formData.request_number || '',
    condicion_muestra: formData.sample_condition || 'aceptable',
    // Transport conditions
    temperatura_transporte: temperatureCelsius,
    unidad_temperatura: formData.transport_conditions?.temperature_unit || 'celsius',
    tipo_envase: formData.transport_conditions?.container_type || '',
    descripcion_conservantes: formData.transport_conditions?.preservation || ''
  };

  // Remove any undefined or null values to prevent JSON parsing errors
  Object.keys(completePayload).forEach(key => {
    if (completePayload[key] === undefined || completePayload[key] === null || completePayload[key] === 'undefined') {
      if (key === 'analisis_ids') {
        completePayload[key] = [];
      } else if (key === 'fecha_muestreo' || key === 'volumen_muestra' || key === 'temperatura_transporte') {
        // Keep null for optional fields
        completePayload[key] = null;
      } else {
        completePayload[key] = '';
      }
    }
  });

  console.log('🎯 Sending complete payload:', completePayload);
  return completePayload;
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

  // Validate temperature with unit conversion
  if (formData.transport_conditions?.temperature) {
    const temp = parseFloat(formData.transport_conditions.temperature);
    if (isNaN(temp)) {
      errors.push('Temperatura de transporte debe ser un número válido');
    } else {
      let tempCelsius = temp;
      if (formData.transport_conditions.temperature_unit === 'fahrenheit') {
        tempCelsius = (temp - 32) * (5/9);
      }
      
      if (tempCelsius < -100 || tempCelsius > 100) {
        const unit = formData.transport_conditions.temperature_unit === 'fahrenheit' ? '°F' : '°C';
        const minTemp = formData.transport_conditions.temperature_unit === 'fahrenheit' ? -148 : -100;
        const maxTemp = formData.transport_conditions.temperature_unit === 'fahrenheit' ? 212 : 100;
        errors.push(`Temperatura de transporte debe estar entre ${minTemp}${unit} y ${maxTemp}${unit}`);
      }
    }
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

/**
 * Transform backend data to frontend format
 */
const transformBackendToFrontend = (backendSample) => {
  if (!backendSample) return null;
  
  // Log the raw backend data to understand the structure
  debugLog('🔍 Raw backend sample data', backendSample);
  debugLog('🔍 Cliente object', backendSample.cliente);
  
  const transformedSample = {
    id: backendSample.id_muestra || backendSample.id,
    internal_number: backendSample.numeroInterno || backendSample.numero_interno,
    scanned_barcode: backendSample.codigoBarras || backendSample.codigo_barras,
    client_id: backendSample.cliente?.id_cliente || backendSample.idCliente || backendSample.id_cliente,
    client_name: backendSample.cliente?.nombre || backendSample.nombreCliente || backendSample.cliente?.name || 'Cliente no especificado',
    sampling_point: backendSample.puntoMuestreo || backendSample.punto_muestreo,
    sample_type: backendSample.tipoMuestra || backendSample.tipo_muestra || 'otros',
    priority: backendSample.prioridad?.toLowerCase() || 'normal',
    status: backendSample.estado?.toLowerCase() || 'recibida',
    reception_date: backendSample.fechaRecepcion || backendSample.fecha_recepcion,
    sampling_date: backendSample.fechaMuestreo || backendSample.fecha_muestreo,
    completion_date: backendSample.fechaFinalizacion || backendSample.fecha_finalizacion,
    received_by: backendSample.responsableMuestreo || backendSample.responsable_muestreo,
    sample_condition: backendSample.condicionMuestra || backendSample.condicion_muestra || 'aceptable',
    requested_tests: Array.isArray(backendSample.analisis) ? 
      backendSample.analisis.map(analisis => analisis.id_analisis || analisis.id) : 
      (backendSample.analisisIds || backendSample.analisis_ids || []),
    analysis_details: Array.isArray(backendSample.analisis) ? 
      backendSample.analisis.map(analisis => ({
        id: analisis.id_analisis || analisis.id,
        name: analisis.nombre_analisis || analisis.nombre,
        status: analisis.estado_analisis || analisis.estado
      })) : [],
    observations: backendSample.observaciones || '',
    transport_conditions: {
      temperature: backendSample.temperatura_transporte || backendSample.temperaturaTransporte || 
                   backendSample.condicionesTransporte?.temperatura || 
                   backendSample.condiciones_transporte?.temperature,
      temperature_unit: backendSample.unidad_temperatura || backendSample.unidadTemperatura || 
                        backendSample.condicionesTransporte?.unidadTemperatura || 
                        backendSample.condiciones_transporte?.temperature_unit || 'celsius',
      container_type: backendSample.tipo_envase || backendSample.tipoEnvase || backendSample.tipo_contenedor || 
                      backendSample.tipoContenedor || backendSample.condicionesTransporte?.tipoContenedor || 
                      backendSample.condiciones_transporte?.container_type,
      preservation: backendSample.descripcion_conservantes || backendSample.descripcionConservantes ||
                    backendSample.preservacion || backendSample.condicionesTransporte?.preservacion || 
                    backendSample.condiciones_transporte?.preservation
    },
    project_name: backendSample.nombreProyecto || backendSample.nombre_proyecto || backendSample.project_name,
    request_number: backendSample.numeroSolicitud || backendSample.numero_solicitud || backendSample.request_number,
    sample_volume: backendSample.volumenMuestra || backendSample.volumen_muestra || backendSample.sample_volume,
    template_used: backendSample.plantillaUtilizada || backendSample.plantilla_utilizada || backendSample.template_used,
    reception_photo_url: backendSample.fotoRecepcionUrl || backendSample.foto_recepcion_url,
    reception_pdf_url: backendSample.pdfRecepcionUrl || backendSample.pdf_recepcion_url,
    // Add other fields as needed
    created_at: backendSample.createdAt || backendSample.created_at,
    updated_at: backendSample.updatedAt || backendSample.updated_at
  };
  
  debugLog('🔄 Transformed sample data', {
    id: transformedSample.id,
    client_id: transformedSample.client_id,
    client_name: transformedSample.client_name,
    cliente_debug: {
      original_cliente: backendSample.cliente,
      cliente_id_cliente: backendSample.cliente?.id_cliente,
      direct_idCliente: backendSample.idCliente,
      id_cliente: backendSample.id_cliente
    },
    transport_conditions: transformedSample.transport_conditions,
    transport_debug: {
      temperatura_transporte: backendSample.temperatura_transporte,
      tipo_envase: backendSample.tipo_envase,
      descripcion_conservantes: backendSample.descripcion_conservantes
    },
    analisis_debug: {
      original_analisis: backendSample.analisis || [],
      analisis_count: Array.isArray(backendSample.analisis) ? backendSample.analisis.length : 0
    },
    requested_tests: transformedSample.requested_tests,
    observations: transformedSample.observations
  });
  
  return transformedSample;
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
      let samples = [];
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        samples = response.data.content;
      } else if (Array.isArray(response.data)) {
        samples = response.data;
      }
      
      // Transform backend data to frontend format
      return samples.map(transformBackendToFrontend);
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
      
      // If it's paginated response, transform the content
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        return {
          ...response.data,
          content: response.data.content.map(transformBackendToFrontend)
        };
      }
      
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
    return transformBackendToFrontend(response.data);
  },

  /**
   * Create a new sample
   */
  create: async (sampleData) => {
    console.log('🚀 Creating sample with form data:', sampleData);
    
    // Validate data before sending
    const validation = validateSampleData(sampleData);
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }

    const transformedData = transformSampleData(sampleData);
    console.log('🔄 Transformed data for backend:', JSON.stringify(transformedData, null, 2));
    console.log('🔍 Individual fields check:');
    console.log('  - numero_interno:', typeof transformedData.numero_interno, transformedData.numero_interno);
    console.log('  - fecha_recepcion:', typeof transformedData.fecha_recepcion, transformedData.fecha_recepcion);
    console.log('  - prioridad:', typeof transformedData.prioridad, transformedData.prioridad);
    console.log('  - analisis_ids:', typeof transformedData.analisis_ids, transformedData.analisis_ids);
    console.log('  - estado:', typeof transformedData.estado, transformedData.estado);
    
    try {
      const response = await apiClient.post('/muestras', transformedData);
      console.log('✅ Sample created successfully:', response.data);
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error('❌ Backend error creating sample:', error.response?.data || error.message);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Sent data:', transformedData);
      throw error;
    }
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
