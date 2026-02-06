/**
 * Work Orders Service
 * 
 * Handles all work order-related API operations
 * Connected to backend /api/ordenes endpoints
 */

import apiClient from '../client';

/**
 * Transform backend order data to frontend format
 */
const transformBackendToFrontend = (backendOrder) => {
  if (!backendOrder) return null;
  
  return {
    id: backendOrder.id_orden_trabajo || backendOrder.idOrdenTrabajo,
    ot_number: backendOrder.codigo_ot || backendOrder.codigoOT,
    status: backendOrder.estado?.toLowerCase() || 'generada',
    created_date: backendOrder.fecha_creacion || backendOrder.fechaCreacion,
    generated_at: backendOrder.fecha_creacion || backendOrder.fechaCreacion,
    completion_date: backendOrder.fecha_finalizacion || backendOrder.fechaFinalizacion,
    assigned_technician: backendOrder.tecnico_asignado?.nombre || backendOrder.tecnicoAsignado?.nombre,
    technician_id: backendOrder.tecnico_asignado?.id_usuario || backendOrder.tecnicoAsignado?.idUsuario,
    tasks: backendOrder.tareas || [],
    total_tasks: backendOrder.total_tareas || backendOrder.totalTareas || 0,
    pending_tasks: backendOrder.tareas_pendientes || backendOrder.tareasPendientes || 0,
    completed_tasks: backendOrder.tareas_completadas || backendOrder.tareasCompletadas || 0,
    sample_count: backendOrder.total_tareas || backendOrder.totalTareas || 0,
    // Compute analysis info from tasks if available
    test_parameter: backendOrder.tareas?.[0]?.nombre_analisis || backendOrder.tareas?.[0]?.nombreAnalisis || 'Varios análisis',
    priority: computePriority(backendOrder.tareas)
  };
};

/**
 * Compute priority based on tasks
 */
const computePriority = (tasks) => {
  if (!tasks || tasks.length === 0) return 'normal';
  
  const priorities = tasks.map(t => (t.prioridad || 'MEDIA').toLowerCase());
  if (priorities.includes('alta') || priorities.includes('critica')) return 'critica';
  if (priorities.includes('media') || priorities.includes('urgente')) return 'urgente';
  return 'normal';
};

export const workOrdersService = {
  /**
   * Get all work orders
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/ordenes', { params });
      console.log('📦 Raw work orders response:', response.data);
      
      // Transform each order
      const orders = Array.isArray(response.data) ? response.data : [];
      return orders.map(transformBackendToFrontend);
    } catch (error) {
      console.error('❌ Error fetching work orders:', error);
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  },

  /**
   * Get a single work order by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/ordenes/${id}`);
    return transformBackendToFrontend(response.data);
  },

  /**
   * Create a new work order
   * @param {Object} workOrderData - { tarea_ids: UUID[], tecnico_asignado_id: UUID }
   */
  create: async (workOrderData) => {
    console.log('🚀 Creating work order with data:', workOrderData);
    
    // Transform to backend format
    const backendData = {
      tarea_ids: workOrderData.tarea_ids || workOrderData.tareaIds,
      tecnico_asignado_id: workOrderData.tecnico_asignado_id || workOrderData.tecnicoAsignadoId
    };
    
    console.log('📤 Sending to backend:', backendData);
    const response = await apiClient.post('/ordenes', backendData);
    console.log('✅ Work order created:', response.data);
    return transformBackendToFrontend(response.data);
  },

  /**
   * Update work order status
   * @param {UUID} id - Order ID
   * @param {string} status - New status (PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA)
   */
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/ordenes/${id}/estado`, null, {
      params: { estado: status.toUpperCase() }
    });
    return transformBackendToFrontend(response.data);
  },

  /**
   * Get work orders by technician ID
   */
  getByTechnicianId: async (technicianId) => {
    const response = await apiClient.get(`/ordenes/tecnico/${technicianId}`);
    const orders = Array.isArray(response.data) ? response.data : [];
    return orders.map(transformBackendToFrontend);
  },

  /**
   * List work orders (alias for getAll)
   */
  list: async (ordering = null) => {
    return workOrdersService.getAll({ ordering });
  },

  // Legacy methods for backward compatibility
  update: async (id, workOrderData) => {
    console.warn('⚠️ workOrdersService.update is not implemented in backend');
    return null;
  },

  /**
   * Delete a work order
   * @param {UUID} id - Order ID to delete
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    console.log('🗑️ Deleting work order:', id);
    await apiClient.delete(`/ordenes/${id}`);
    console.log('✅ Work order deleted successfully');
  },

  getByClientId: async (clientId) => {
    console.warn('⚠️ workOrdersService.getByClientId is not implemented in backend');
    return [];
  },

  getStats: async () => {
    console.warn('⚠️ workOrdersService.getStats is not implemented in backend');
    return {};
  },
};

export default workOrdersService;
