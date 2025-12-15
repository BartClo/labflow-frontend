/**
 * API services for equipment management
 * 
 * This module provides functions to interact with the equipment endpoints
 */

import { apiClient } from '../client';

/**
 * Get all equipment from the API
 * @returns {Promise} Promise that resolves to the list of equipment
 */
export const getEquipment = async () => {
  try {
    const response = await apiClient.get('/equipos');
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

/**
 * Get equipment by ID
 * @param {string|number} id - Equipment ID
 * @returns {Promise} Promise that resolves to the equipment data
 */
export const getEquipmentById = async (id) => {
  try {
    const response = await apiClient.get(`/equipos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching equipment ${id}:`, error);
    throw error;
  }
};

/**
 * Search equipment by name
 * @param {string} query - Search query
 * @returns {Promise} Promise that resolves to the filtered list of equipment
 */
export const searchEquipment = async (query) => {
  try {
    const response = await apiClient.get('/equipos', {
      params: { search: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching equipment:', error);
    throw error;
  }
};