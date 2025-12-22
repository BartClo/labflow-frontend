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
    try {
      console.log('🌐 Making API call to /analisis with params:', params);
      const response = await apiClient.get('/analisis', { params });
      console.log('📦 Raw analyses response:', response.data);
      
      // Handle paginated response - extract content array if present
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        console.log('📋 Extracted analyses from paginated response:', response.data.content);
        return response.data.content;
      }
      
      // Handle direct array response
      if (Array.isArray(response.data)) {
        console.log('📋 Direct array response:', response.data);
        return response.data;
      }
      
      // Fallback to empty array
      console.log('⚠️ Unexpected response format, returning empty array');
      return [];
    } catch (error) {
      console.error('❌ Error fetching analyses:', error);
      throw error;
    }
  },

  /**
   * Get all active analyses
   */
  getActive: async () => {
    const response = await apiClient.get('/analisis/activos');
    return response.data;
  },

  /**
   * Get a single analysis by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/analisis/${id}`);
    return response.data;
  },

  /**
   * Get analysis by code
   */
  getByCode: async (codigo) => {
    const response = await apiClient.get(`/analisis/codigo/${codigo}`);
    return response.data;
  },

  /**
   * Search analyses by category
   */
  getByCategory: async (categoria) => {
    const response = await apiClient.get(`/analisis/categoria/${categoria}`);
    return response.data;
  },

  /**
   * Search analyses by name
   */
  searchByName: async (nombre) => {
    const response = await apiClient.get('/analisis/buscar', { 
      params: { nombre } 
    });
    return response.data;
  },

  /**
   * Create a new analysis
   */
  create: async (analysisData) => {
    const response = await apiClient.post('/analisis', analysisData);
    return response.data;
  },

  /**
   * Update an existing analysis
   */
  update: async (id, analysisData) => {
    const response = await apiClient.put(`/analisis/${id}`, analysisData);
    return response.data;
  },

  /**
   * Change analysis status
   */
  changeStatus: async (id, estado) => {
    const response = await apiClient.patch(`/analisis/${id}/estado`, null, {
      params: { estado }
    });
    return response.data;
  },

  /**
   * Delete an analysis
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/analisis/${id}`);
    return response.data;
  },

};

export const analysisTemplatesService = {
  /**
   * Get all analysis templates (plantillas)
   */
  getAll: async (params = {}) => {
    try {
      console.log('🌐 Making API call to /plantillas with params:', params);
      const response = await apiClient.get('/plantillas', { params });
      console.log('📦 Raw templates response:', response.data);
      
      // Handle paginated response - extract content array if present
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        console.log('📋 Extracted templates from paginated response:', response.data.content);
        return response.data.content;
      }
      
      // Handle direct array response
      if (Array.isArray(response.data)) {
        console.log('📋 Direct array templates response:', response.data);
        return response.data;
      }
      
      // Fallback to empty array
      console.log('⚠️ Unexpected templates response format, returning empty array');
      return [];
    } catch (error) {
      console.error('❌ Error fetching analysis templates:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  /**
   * Get a single analysis template by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/plantillas/${id}`);
    return response.data;
  },

  /**
   * Create a new analysis template
   */
  create: async (templateData) => {
    const response = await apiClient.post('/plantillas', templateData);
    return response.data;
  },

  /**
   * Update an existing analysis template
   */
  update: async (id, templateData) => {
    const response = await apiClient.put(`/plantillas/${id}`, templateData);
    return response.data;
  },

  /**
   * Delete an analysis template
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/plantillas/${id}`);
    return response.data;
  },
};

// Add backward compatibility aliases
analysisService.list = analysisService.getAll;
analysisTemplatesService.list = analysisTemplatesService.getAll;

export default { analysisService, analysisTemplatesService };
