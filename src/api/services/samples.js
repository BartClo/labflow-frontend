/**
 * Samples Service
 * 
 * Handles all sample-related API operations
 */

import apiClient from '../client';

export const samplesService = {
  /**
   * Get all samples
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/muestras', { params });
    return response.data;
  },

  /**
   * Get a single sample by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/samples/${id}`);
    return response.data;
  },

  /**
   * Create a new sample
   */
  create: async (sampleData) => {
    const response = await apiClient.post('/samples', sampleData);
    return response.data;
  },

  /**
   * Update an existing sample
   */
  update: async (id, sampleData) => {
    const response = await apiClient.put(`/samples/${id}`, sampleData);
    return response.data;
  },

  /**
   * Delete a sample
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/samples/${id}`);
    return response.data;
  },

  /**
   * Get samples by client ID
   */
  getByClientId: async (clientId) => {
    const response = await apiClient.get(`/samples/client/${clientId}`);
    return response.data;
  },

  /**
   * Get samples by work order ID
   */
  getByWorkOrderId: async (workOrderId) => {
    const response = await apiClient.get(`/samples/work-order/${workOrderId}`);
    return response.data;
  },

  /**
   * Update sample status
   */
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/samples/${id}/status`, { status });
    return response.data;
  },
};

export default samplesService;
// Backwards-compatible alias
samplesService.list = samplesService.getAll;
