/**
 * API services for supplies (insumos) management
 * 
 * This module provides functions to interact with the supplies endpoints
 */

import { apiClient } from '../client';

/**
 * Get all supplies from the API
 * @returns {Promise} Promise that resolves to the list of supplies
 */
export const getSupplies = async () => {
  try {
    const response = await apiClient.get('/insumos');
    return response.data;
  } catch (error) {
    console.error('Error fetching supplies:', error);
    throw error;
  }
};

/**
 * Get supply by ID
 * @param {string|number} id - Supply ID
 * @returns {Promise} Promise that resolves to the supply data
 */
export const getSupplyById = async (id) => {
  try {
    const response = await apiClient.get(`/insumos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching supply ${id}:`, error);
    throw error;
  }
};

/**
 * Search supplies by name
 * @param {string} query - Search query
 * @returns {Promise} Promise that resolves to the filtered list of supplies
 */
export const searchSupplies = async (query) => {
  try {
    const response = await apiClient.get('/insumos', {
      params: { search: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching supplies:', error);
    throw error;
  }
};

/**
 * Create a new supply
 * @param {Object} supplyData - Supply data
 * @returns {Promise} Promise that resolves to the created supply
 */
export const createSupply = async (supplyData) => {
  try {
    const response = await apiClient.post('/insumos', supplyData);
    return response.data;
  } catch (error) {
    console.error('Error creating supply:', error);
    throw error;
  }
};