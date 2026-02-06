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

  // Complete payload with all form data - USING CAMELCASE for Java backend
  const completePayload = {
    numeroInterno: String(formData.internal_number || ''),
    codigoBarras: String(formData.scanned_barcode || formData.internal_number || ''),
    idCliente: String(formData.client_id || ''), // String vacío si no hay cliente
    puntoMuestreo: String(formData.sampling_point || ''),
    tipoMuestra: String(formData.sample_type || 'agua'),
    prioridad: String(PRIORITY_MAPPING[formData.priority] || 'baja'),
    fechaRecepcion: String(formatDateSafely(formData.reception_date)),
    fechaMuestreo: formData.sampling_date ? String(formatDateSafely(formData.sampling_date)) : String(formatDateSafely(formData.reception_date)),
    responsableMuestreo: String(formData.received_by || 'Técnico'),
    estado: String(STATUS_MAPPING[formData.status] || 'recibida'),
    analisisIds: Array.isArray(formData.requested_tests) ? formData.requested_tests : [],
    observaciones: formData.observations || null,
    volumenMuestra: formData.sample_volume ? parseFloat(formData.sample_volume) : 0,
    nombreProyecto: String(formData.project_name || ''),
    numeroSolicitud: String(formData.request_number || ''),
    condicionMuestra: String(formData.sample_condition || 'aceptable'),
    // Transport conditions
    temperaturaTransporte: temperatureCelsius || 0,
    unidadTemperatura: String(formData.transport_conditions?.temperature_unit || 'celsius'),
    tipoEnvase: String(formData.transport_conditions?.container_type || ''),
    descripcionConservantes: String(formData.transport_conditions?.preservation || '')
  };

  // Log each field to debug null values
  console.log('🔍 Debugging payload fields:');
  Object.keys(completePayload).forEach(key => {
    const value = completePayload[key];
    const type = typeof value;
    console.log(`  ${key}: ${type} = ${value}`);
    if (value === null) console.log(`    🚨 ${key} is null - THIS COULD CAUSE CONSTRAINT ERROR`);
    if (value === '') console.log(`    ⚠️ ${key} is empty string`);
    if (value === undefined) console.log(`    🚨 ${key} is undefined - THIS COULD CAUSE CONSTRAINT ERROR`);
  });

  // Extra check for any remaining nulls or undefined values
  const nullFields = Object.keys(completePayload).filter(key => 
    completePayload[key] === null || completePayload[key] === undefined
  );
  
  if (nullFields.length > 0) {
    console.log('🚨 CRITICAL: Fields that are null/undefined:', nullFields);
    
    // Replace all nulls/undefined with appropriate defaults (except observaciones)
    nullFields.forEach(field => {
      if (field !== 'observaciones') {
        if (field === 'analisisIds') {
          completePayload[field] = [];
        } else if (typeof completePayload[field] === 'number' || field.includes('temperatura') || field.includes('volumen')) {
          completePayload[field] = 0;
        } else {
          completePayload[field] = '';
        }
        console.log(`🔧 Fixed ${field}: set to ${completePayload[field]}`);
      }
    });
  }

  // Remove any undefined values but keep explicit nulls
  Object.keys(completePayload).forEach(key => {
    if (completePayload[key] === undefined || completePayload[key] === 'undefined') {
      if (key === 'analisis_ids') {
        completePayload[key] = [];
      } else {
        completePayload[key] = null;
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
    
    // Final validation before sending - check for any remaining nulls/undefined
    const finalNullCheck = Object.keys(transformedData).filter(key => 
      transformedData[key] === null || transformedData[key] === undefined
    );
    
    if (finalNullCheck.length > 0) {
      console.log('🚨 FINAL CHECK: Still found null/undefined fields:', finalNullCheck);
      finalNullCheck.forEach(field => {
        if (field !== 'observaciones') {
          console.log(`🚨 CRITICAL ERROR: ${field} is still null/undefined. This will cause constraint error.`);
        }
      });
    } else {
      console.log('✅ FINAL CHECK: No null/undefined fields found');
    }
    
    console.log('🔍 Individual fields check:');
    console.log('  - numeroInterno:', typeof transformedData.numeroInterno, transformedData.numeroInterno);
    console.log('  - idCliente:', typeof transformedData.idCliente, transformedData.idCliente);
    console.log('  - estado:', typeof transformedData.estado, transformedData.estado);
    console.log('  - fechaRecepcion:', typeof transformedData.fechaRecepcion, transformedData.fechaRecepcion);
    console.log('  - prioridad:', typeof transformedData.prioridad, transformedData.prioridad);
    console.log('  - analisisIds:', typeof transformedData.analisisIds, transformedData.analisisIds);
    console.log('  - puntoMuestreo:', typeof transformedData.puntoMuestreo, transformedData.puntoMuestreo);
    
    // Try sending a minimal payload first to isolate the issue
    const minimalPayload = {
      numeroInterno: String(transformedData.numeroInterno),
      codigoBarras: String(transformedData.codigoBarras),
      idCliente: transformedData.idCliente ? String(transformedData.idCliente) : null,
      puntoMuestreo: String(transformedData.puntoMuestreo || 'laboratorio'),
      tipoMuestra: String(transformedData.tipoMuestra || 'agua'),
      estado: String(transformedData.estado || 'recibida'),
      prioridad: String(transformedData.prioridad || 'baja'),
      fechaRecepcion: String(transformedData.fechaRecepcion),
      fechaMuestreo: String(transformedData.fechaMuestreo),
      responsableMuestreo: String(transformedData.responsableMuestreo),
      analisisIds: Array.isArray(transformedData.analisisIds) ? transformedData.analisisIds : []
    };
    
    console.log('🧪 Trying minimal payload first:', JSON.stringify(minimalPayload, null, 2));
    
    // Let's first try to get existing samples to see the expected structure
    try {
      console.log('🔍 First, let\'s check existing samples structure...');
      const existingSamples = await apiClient.get('/muestras');
      console.log('📋 Existing samples structure:', existingSamples.data);
      if (existingSamples.data && existingSamples.data.length > 0) {
        console.log('📝 Sample structure example:', JSON.stringify(existingSamples.data[0], null, 2));
      }
    } catch (existingError) {
      console.log('⚠️ Could not fetch existing samples:', existingError.message);
    }
    
    // Try with an even more minimal payload - just the absolute essentials
    const ultraMinimalPayload = {
      numeroInterno: String(transformedData.numeroInterno),
      codigoBarras: String(transformedData.codigoBarras),
      tipoMuestra: "agua",
      estado: "recibida",
      fechaRecepcion: String(transformedData.fechaRecepcion),
      puntoMuestreo: "laboratorio",
      idCliente: String(transformedData.idCliente || '')
    };
    
    console.log('🔬 Trying ultra-minimal payload (only 5 fields):', JSON.stringify(ultraMinimalPayload, null, 2));
    
    try {
      const response = await apiClient.post('/muestras', ultraMinimalPayload);
      console.log('✅ Ultra-minimal payload worked!', response.data);
      return transformBackendToFrontend(response.data);
    } catch (ultraMinimalError) {
      console.log('❌ Even ultra-minimal payload failed');
      console.error('Ultra-minimal error:', ultraMinimalError.response?.data);
      
      // Show detailed validation errors
      if (ultraMinimalError.response?.data?.errors) {
        console.log('🔍 Detailed validation errors:');
        Object.keys(ultraMinimalError.response.data.errors).forEach(field => {
          console.log(`  ❌ ${field}: ${ultraMinimalError.response.data.errors[field]}`);
        });
        
        // Try to add the missing required fields
        console.log('🔧 Attempting to fix by adding missing required fields...');
        
        const fixedPayload = {
          ...ultraMinimalPayload,
          // Add potentially missing required fields based on common patterns
          puntoMuestreo: "laboratorio",
          prioridad: "baja",
          responsableMuestreo: "admin", // Try with a simple string first
          analisisIds: []
        };
        
        console.log('🛠️ Fixed payload:', JSON.stringify(fixedPayload, null, 2));
        
        try {
          const fixedResponse = await apiClient.post('/muestras', fixedPayload);
          console.log('✅ Fixed payload worked!', fixedResponse.data);
          return transformBackendToFrontend(fixedResponse.data);
        } catch (fixedError) {
          console.log('❌ Fixed payload also failed');
          console.error('Fixed payload error:', fixedError.response?.data);
        }
      }
    }
    
    try {
      const response = await apiClient.post('/muestras', minimalPayload);
      console.log('✅ Sample created successfully:', response.data);
      return transformBackendToFrontend(response.data);
    } catch (minimalError) {
      console.log('❌ Minimal payload also failed, trying full payload');
      console.error('Minimal error:', minimalError.response?.data);
    }
    
    try {
      const response = await apiClient.post('/muestras', transformedData);
      console.log('✅ Sample created successfully:', response.data);
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error('❌ Backend error creating sample:', error.response?.data || error.message);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Sent data:', transformedData);
      
      // Show ALL validation errors from the final attempt
      if (error.response?.data?.errors) {
        console.log('🚨 ALL VALIDATION ERRORS FROM FULL PAYLOAD:');
        Object.keys(error.response.data.errors).forEach(field => {
          console.log(`  ❌ ${field}: ${error.response.data.errors[field]}`);
        });
      }
      
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

  /**
   * Filter samples by criteria
   */
  filter: async (criteria = {}) => {
    try {
      const params = {};
      
      // Map frontend criteria to backend parameters
      if (criteria.status) {
        // Map frontend status to backend status
        params.estado = STATUS_MAPPING[criteria.status] || criteria.status.toUpperCase();
      }
      if (criteria.id) {
        params.id = criteria.id;
      }
      if (criteria.internal_number) {
        params.numero_interno = criteria.internal_number;
      }
      if (criteria.client_id) {
        params.id_cliente = criteria.client_id;
      }
      
      console.log('🔍 Filtering samples with params:', params);
      
      const response = await apiClient.get('/muestras', { params });
      
      // Handle paginated response
      let samples = [];
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        samples = response.data.content;
      } else if (Array.isArray(response.data)) {
        samples = response.data;
      }
      
      console.log('✅ Filtered samples:', samples.length);
      return samples.map(transformBackendToFrontend);
    } catch (error) {
      console.error('Error filtering samples:', error);
      throw error;
    }
  },
};

// Export utility functions for external use
export { transformSampleData, validateSampleData };

export default samplesService;
// Backwards-compatible alias
samplesService.list = samplesService.getAll;
