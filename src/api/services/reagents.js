/**
 * API services for reagents (reactivos) management
 * 
 * This module provides functions to interact with the reagents endpoints
 */

import { apiClient } from '../client';

/**
 * Get all reagents from the API
 * @returns {Promise} Promise that resolves to the list of reagents
 */
export const getReagents = async () => {
  try {
    const response = await apiClient.get('/reactivos');
    return response.data;
  } catch (error) {
    console.error('Error fetching reagents:', error);
    throw error;
  }
};

/**
 * Get reagent by ID
 * @param {string|number} id - Reagent ID
 * @returns {Promise} Promise that resolves to the reagent data
 */
export const getReagentById = async (id) => {
  try {
    const response = await apiClient.get(`/reactivos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reagent ${id}:`, error);
    throw error;
  }
};

/**
 * Search reagents by name
 * @param {string} query - Search query
 * @returns {Promise} Promise that resolves to the filtered list of reagents
 */
export const searchReagents = async (query) => {
  try {
    const response = await apiClient.get('/reactivos', {
      params: { search: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching reagents:', error);
    throw error;
  }
};

/**
 * Create a new reagent
 * @param {Object} reagentData - Reagent data
 * @returns {Promise} Promise that resolves to the created reagent
 */
export const createReagent = async (reagentData) => {
  try {
    const response = await apiClient.post('/reactivos', reagentData);
    return response.data;
  } catch (error) {
    console.error('Error creating reagent:', error);
    throw error;
  }
};