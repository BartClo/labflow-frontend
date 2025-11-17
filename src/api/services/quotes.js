/**
 * Quotes Service
 * 
 * Handles all quote-related API operations
 */

import apiClient from '../client';

export const quotesService = {
  /**
   * Get all quotes
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/quotes', { params });
    return response.data;
  },

  /**
   * Get a single quote by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/quotes/${id}`);
    return response.data;
  },

  /**
   * Create a new quote
   */
  create: async (quoteData) => {
    const response = await apiClient.post('/quotes', quoteData);
    return response.data;
  },

  /**
   * Update an existing quote
   */
  update: async (id, quoteData) => {
    const response = await apiClient.put(`/quotes/${id}`, quoteData);
    return response.data;
  },

  /**
   * Delete a quote
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/quotes/${id}`);
    return response.data;
  },

  /**
   * Get quotes by client ID
   */
  getByClientId: async (clientId) => {
    const response = await apiClient.get(`/quotes/client/${clientId}`);
    return response.data;
  },

  /**
   * Update quote status
   */
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/quotes/${id}/status`, { status });
    return response.data;
  },

  /**
   * Convert quote to work order
   */
  convertToWorkOrder: async (id) => {
    const response = await apiClient.post(`/quotes/${id}/convert`);
    return response.data;
  },
};

export default quotesService;
// Backwards-compatible alias
quotesService.list = quotesService.getAll;
