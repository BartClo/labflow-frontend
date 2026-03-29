

import apiClient from '../client';

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (email, password) => {
    try {


      const response = await apiClient.post('/usuarios/login', {
        email: email,
        password: password
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }

      const user = data.user;

      // Store authentication data
      const authData = {
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          username: user.username,
          telefono: user.telefono,
          direccion: user.direccion,
          fechaNacimiento: user.fechaNacimiento,
          rol: user.rol,
          rol_nombre: user.rol?.nombre || user.rol_nombre || '',
          activo: user.activo
        },
        token: `mock-token-${user.id}`
      };

      sessionStorage.setItem('token', authData.token);
      sessionStorage.setItem('user', JSON.stringify(authData.user));



      return authData;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Error al conectar con el servidor');
    }
  },

  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await apiClient.post('/usuarios', userData);
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async () => {
    try {
      // For now, just clear local storage
      // In the future, you can call a logout endpoint
      // await apiClient.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  },

  /**
   * Get current user information
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/password-reset', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/password-reset/confirm', {
      token,
      password: newPassword,
    });
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  },

  /**
   * Get stored user data
   */
  getStoredUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
