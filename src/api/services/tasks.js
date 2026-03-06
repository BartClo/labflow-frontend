/**
 * Tasks Service (Tareas)
 * 
 * Handles all task-related API operations
 * Tasks are MuestraAnalisis entities - the relationship between samples and analyses
 */

import apiClient from '../client';

/**
 * Transform backend task data to frontend format
 */
const transformBackendToFrontend = (backendTask) => {
  if (!backendTask) return null;
  
  return {
    id: backendTask.id_muestra_analisis || backendTask.idMuestraAnalisis,
    sample_number: backendTask.numero_muestra || backendTask.numeroMuestra,
    barcode: backendTask.codigo_barras || backendTask.codigoBarras,
    analysis_name: backendTask.nombre_analisis || backendTask.nombreAnalisis,
    analysis_code: backendTask.codigo_analisis || backendTask.codigoAnalisis,
    date_added: backendTask.fecha_agregado || backendTask.fechaAgregado,
    priority: (backendTask.prioridad || 'MEDIA').toLowerCase(),
    client: backendTask.cliente ? {
      id: backendTask.cliente.id_cliente || backendTask.cliente.idCliente,
      name: backendTask.cliente.nombre,
      rut: backendTask.cliente.rut,
      email: backendTask.cliente.email
    } : null,
    complies_with_standard: backendTask.cumple_norma || backendTask.cumpleNorma,
    min_standard_limit: backendTask.limite_minimo_normativa || backendTask.limiteMinimoNormativa,
    max_standard_limit: backendTask.limite_maximo_normativa || backendTask.limiteMaximoNormativa
  };
};

export const tasksService = {
  /**
   * Get pending tasks without work order
   * @param {UUID} analysisId - Optional analysis ID to filter by
   */
  getPendingTasks: async (analysisId = null) => {
    try {
      const params = analysisId ? { analisisId: analysisId } : {};
      console.log('🔍 Fetching pending tasks with params:', params);
      
      const response = await apiClient.get('/tareas/pendientes', { params });
      console.log('📦 Pending tasks response:', response.data);
      
      const tasks = Array.isArray(response.data) ? response.data : [];
      return tasks.map(transformBackendToFrontend);
    } catch (error) {
      console.error('❌ Error fetching pending tasks:', error);
      return [];
    }
  },

  /**
   * Get count of pending tasks grouped by analysis
   */
  getPendingTasksByAnalysis: async () => {
    try {
      const response = await apiClient.get('/tareas/pendientes-por-analisis');
      console.log('📊 Pending tasks by analysis:', response.data);
      return response.data || {};
    } catch (error) {
      console.error('❌ Error fetching pending tasks by analysis:', error);
      return {};
    }
  },

  /**
   * Search task by barcode
   * @param {string} barcode - QR/barcode to search
   */
  searchByBarcode: async (barcode) => {
    try {
      const response = await apiClient.get('/tareas/search', { params: { codigo: barcode } });
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error('❌ Error searching task by barcode:', error);
      return null;
    }
  },

  /**
   * Update task result
   * @param {UUID} taskId - Task ID
   * @param {Object} resultData - Result data with parameters
   */
  updateResult: async (taskId, resultData) => {
    try {
      console.warn('[DEBUG] PUT /tareas/' + taskId + '/resultado payload:', JSON.stringify(resultData));
      const response = await apiClient.put(`/tareas/${taskId}/resultado`, resultData);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating task result:', error?.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Validate a task (change status from COMPLETADO to VALIDADO)
   * @param {UUID} taskId - Task ID
   */
  validateTask: async (taskId) => {
    try {
      const response = await apiClient.patch(`/tareas/${taskId}/validar`);
      return response.data;
    } catch (error) {
      console.error('❌ Error validating task:', error);
      throw error;
    }
  }
  ,

  /**
   * Validate a barcode against a work order and return task info including limits
   * @param {UUID} ordenId
   * @param {string} codigoBarras
   */
  validarCodigoBarrasEnOT: async (ordenId, codigoBarras) => {
    try {
      const response = await apiClient.get('/tareas/validar-barcode', { params: { ordenId, codigoBarras } });
      return response.data;
    } catch (error) {
      console.error('❌ Error validating barcode:', error);
      throw error;
    }
  },

  /**
   * Guarda un resultado sencillo (un solo valor) para una tarea
   * payload: { id_muestra_analisis, codigo_barras, valor_medido, observaciones }
   */
  guardarResultado: async (payload) => {
    try {
      const response = await apiClient.post('/tareas/guardar-resultado', payload);
      return response.data;
    } catch (error) {
      console.error('❌ Error saving result:', error);
      throw error;
    }
  }

  ,

  /**
   * Rechazar una tarea (MuestraAnalisis) usando su id_muestra_analisis
   * @param {UUID} tareaId - id_muestra_analisis
   */
  rechazarTarea: async (tareaId) => {
    try {
      const response = await apiClient.post(`/tareas/${tareaId}/rechazar`);
      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting task:', error);
      throw error;
    }
  },

  /**
   * Rechazar una muestra por su id_muestra (Muestra entity)
   * @param {UUID} muestraId
   */
  rechazarMuestra: async (muestraId) => {
    try {
      const response = await apiClient.post(`/muestras/${muestraId}/rechazar`);
      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting sample:', error);
      throw error;
    }
  }
};

export default tasksService;
