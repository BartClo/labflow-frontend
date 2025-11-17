/**
 * Work Orders Service
 * 
 * Handles all work order-related API operations
 */

import apiClient from '../client';

export const workOrdersService = {
  /**
   * Get all work orders
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/work-orders', { params });
    return response.data;
  },

  /**
   * Get a single work order by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/work-orders/${id}`);
    return response.data;
  },

  /**
   * Create a new work order
   */
  create: async (workOrderData) => {
    const response = await apiClient.post('/work-orders', workOrderData);
    return response.data;
  },

  /**
   * Update an existing work order
   */
  update: async (id, workOrderData) => {
    const response = await apiClient.put(`/work-orders/${id}`, workOrderData);
    return response.data;
  },

  /**
   * Delete a work order
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/work-orders/${id}`);
    return response.data;
  },

  /**
   * Get work orders by client ID
   */
  getByClientId: async (clientId) => {
    const response = await apiClient.get(`/work-orders/client/${clientId}`);
    return response.data;
  },

  /**
   * Update work order status
   */
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/work-orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get work order statistics
   */
  getStats: async () => {
    const response = await apiClient.get('/work-orders/stats');
    return response.data;
  },
};

export default workOrdersService;
