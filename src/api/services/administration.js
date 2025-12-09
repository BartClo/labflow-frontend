/**
 * Administration Service
 * 
 * Handles user and role management operations
 */

import apiClient from '../client';

export const administrationService = {
  // ========================
  // USUARIO ENDPOINTS
  // ========================

  /**
   * Search users by texto (nombre, apellido, correo, username)
   * GET /api/usuarios/buscar?texto=search_text
   */
  searchUsers: async (texto) => {
    try {
      const response = await apiClient.get('/usuarios/buscar', {
        params: { texto }
      });
      return response.data;
    } catch (error) {
      console.error('Administration: Error searching users:', error);
      throw error;
    }
  },

  /**
   * Get all users
   * GET /api/usuarios
   */
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Administration: Error getting all users:', error);
      throw error;
    }
  },

  /**
   * Get active users only
   * GET /api/usuarios/activos
   */
  getActiveUsers: async () => {
    try {
      const response = await apiClient.get('/usuarios/activos');
      return response.data;
    } catch (error) {
      console.error('Administration: Error getting active users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * GET /api/usuarios/:id
   */
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Administration: Error getting user by ID:', error);
      throw error;
    }
  },

  /**
   * Create new user
   * POST /api/usuarios
   */
  createUser: async (userData) => {
    try {
      console.log('Datos enviados al backend:', JSON.stringify(userData, null, 2));
      const response = await apiClient.post('/usuarios', userData);
      return response.data;
    } catch (error) {
      console.error('Administration: Error creating user:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      throw error;
    }
  },

  /**
   * Update user
   * PUT /api/usuarios/:id
   */
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Administration: Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete user
   * DELETE /api/usuarios/:id
   */
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Administration: Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Register user connection
   * POST /api/usuarios/:id/registrar-conexion
   */
  registerUserConnection: async (id) => {
    try {
      const response = await apiClient.post(`/usuarios/${id}/registrar-conexion`);
      return response.data;
    } catch (error) {
      console.error('Administration: Error registering user connection:', error);
      throw error;
    }
  },

  // ========================
  // ROL ENDPOINTS
  // ========================

  /**
   * Search roles by texto
   * GET /api/roles/buscar?texto=search_text
   */
  searchRoles: async (texto) => {
    try {
      const response = await apiClient.get('/roles/buscar', {
        params: { texto }
      });
      return response.data;
    } catch (error) {
      console.error('Administration: Error searching roles:', error);
      throw error;
    }
  },

  /**
   * Get all roles
   * GET /api/roles
   */
  getAllRoles: async () => {
    try {
      const response = await apiClient.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Administration: Error getting all roles:', error);
      throw error;
    }
  },

  /**
   * Get role by ID
   * GET /api/roles/:id
   */
  getRoleById: async (id) => {
    try {
      const response = await apiClient.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Administration: Error getting role by ID:', error);
      throw error;
    }
  },

  /**
   * Create new role
   * POST /api/roles
   */
  createRole: async (roleData) => {
    try {
      const response = await apiClient.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Administration: Error creating role:', error);
      throw error;
    }
  },

  /**
   * Update role
   * PUT /api/roles/:id
   */
  updateRole: async (id, roleData) => {
    try {
      const response = await apiClient.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Administration: Error updating role:', error);
      throw error;
    }
  },

  /**
   * Delete role
   * DELETE /api/roles/:id
   */
  deleteRole: async (id) => {
    try {
      const response = await apiClient.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Administration: Error deleting role:', error);
      throw error;
    }
  },

  // ========================
  // ESTADÍSTICAS ENDPOINTS
  // ========================

  /**
   * Get user statistics
   * GET /api/usuarios/estadisticas
   * Returns: { totalUsuarios, usuariosActivos, administradores, trabajadores }
   */
  getUserStatistics: async () => {
    try {
      const response = await apiClient.get('/usuarios/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Administration: Error getting user statistics:', error);
      throw error;
    }
  },
};

export default administrationService;
