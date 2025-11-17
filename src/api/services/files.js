/**
 * Files Service
 * 
 * Handles file upload, download, and management operations
 */

import apiClient from '../client';

export const filesService = {
  /**
   * Upload a file
   */
  upload: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    Object.keys(metadata).forEach((key) => {
      formData.append(key, metadata[key]);
    });

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload multiple files
   */
  uploadMultiple: async (files, metadata = {}) => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Add metadata
    Object.keys(metadata).forEach((key) => {
      formData.append(key, metadata[key]);
    });

    const response = await apiClient.post('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get file information
   */
  getInfo: async (fileId) => {
    const response = await apiClient.get(`/files/${fileId}`);
    return response.data;
  },

  /**
   * Download a file
   */
  download: async (fileId) => {
    const response = await apiClient.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Delete a file
   */
  delete: async (fileId) => {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  },

  /**
   * Get a signed URL for a file
   */
  getSignedUrl: async (fileId, expiresIn = 3600) => {
    const response = await apiClient.get(`/files/${fileId}/signed-url`, {
      params: { expiresIn },
    });
    return response.data;
  },

  /**
   * Get files by entity (sample, work order, etc.)
   */
  getByEntity: async (entityType, entityId) => {
    const response = await apiClient.get(`/files/${entityType}/${entityId}`);
    return response.data;
  },
};

export default filesService;
