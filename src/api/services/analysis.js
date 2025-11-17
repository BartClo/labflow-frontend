/**
 * Analysis Service
 * 
 * Handles all analysis and analysis template-related API operations
 */

import apiClient from '../client';

export const analysisService = {
  /**
   * Get all analyses
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/analyses', { params });
    return response.data;
  },

  /**
   * Get a single analysis by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/analyses/${id}`);
    return response.data;
  },

  /**
   * Create a new analysis
   */
  create: async (analysisData) => {
    const response = await apiClient.post('/analyses', analysisData);
    return response.data;
  },

  /**
   * Update an existing analysis
   */
  update: async (id, analysisData) => {
    const response = await apiClient.put(`/analyses/${id}`, analysisData);
    return response.data;
  },

  /**
   * Delete an analysis
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/analyses/${id}`);
    return response.data;
  },

  /**
   * Get analyses by sample ID
   */
  getBySampleId: async (sampleId) => {
    const response = await apiClient.get(`/analyses/sample/${sampleId}`);
    return response.data;
  },
};

export const analysisTemplatesService = {
  /**
   * Get all analysis templates
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/analysis-templates', { params });
    return response.data;
  },

  /**
   * Get a single analysis template by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/analysis-templates/${id}`);
    return response.data;
  },

  /**
   * Create a new analysis template
   */
  create: async (templateData) => {
    const response = await apiClient.post('/analysis-templates', templateData);
    return response.data;
  },

  /**
   * Update an existing analysis template
   */
  update: async (id, templateData) => {
    const response = await apiClient.put(`/analysis-templates/${id}`, templateData);
    return response.data;
  },

  /**
   * Delete an analysis template
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/analysis-templates/${id}`);
    return response.data;
  },

  /**
   * Duplicate an analysis template
   */
  duplicate: async (id) => {
    const response = await apiClient.post(`/analysis-templates/${id}/duplicate`);
    return response.data;
  },
};

export default { analysisService, analysisTemplatesService };
