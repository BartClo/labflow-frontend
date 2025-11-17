/**
 * Workflows Service
 * 
 * Handles all workflow and workflow step-related API operations
 */

import apiClient from '../client';

export const workflowsService = {
  /**
   * Get all workflow steps
   */
  getAllSteps: async (params = {}) => {
    const response = await apiClient.get('/workflow-steps', { params });
    return response.data;
  },

  /**
   * Get a single workflow step by ID
   */
  getStepById: async (id) => {
    const response = await apiClient.get(`/workflow-steps/${id}`);
    return response.data;
  },

  /**
   * Create a new workflow step
   */
  createStep: async (stepData) => {
    const response = await apiClient.post('/workflow-steps', stepData);
    return response.data;
  },

  /**
   * Update an existing workflow step
   */
  updateStep: async (id, stepData) => {
    const response = await apiClient.put(`/workflow-steps/${id}`, stepData);
    return response.data;
  },

  /**
   * Delete a workflow step
   */
  deleteStep: async (id) => {
    const response = await apiClient.delete(`/workflow-steps/${id}`);
    return response.data;
  },

  /**
   * Get workflow steps by sample ID
   */
  getStepsBySampleId: async (sampleId) => {
    const response = await apiClient.get(`/workflow-steps/sample/${sampleId}`);
    return response.data;
  },

  /**
   * Get workflow steps by work order ID
   */
  getStepsByWorkOrderId: async (workOrderId) => {
    const response = await apiClient.get(`/workflow-steps/work-order/${workOrderId}`);
    return response.data;
  },

  /**
   * Update workflow step status
   */
  updateStepStatus: async (id, status, notes = '') => {
    const response = await apiClient.patch(`/workflow-steps/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  /**
   * Complete a workflow step
   */
  completeStep: async (id, data = {}) => {
    const response = await apiClient.post(`/workflow-steps/${id}/complete`, data);
    return response.data;
  },

  /**
   * Get workflow timeline for a sample
   */
  getTimeline: async (sampleId) => {
    const response = await apiClient.get(`/workflows/timeline/${sampleId}`);
    return response.data;
  },
};

export default workflowsService;
