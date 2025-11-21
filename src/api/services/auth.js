/**
 * Authentication Service
 * 
 * Handles user authentication, registration, and session management
 */

import apiClient from '../client';

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (email, password) => {
    try {
      console.log('AuthService: Starting login for:', email);
      
      // For testing without backend, you can uncomment this block:
      // if (email === 'admin@admin.cl' && password === 'admin123') {
      //   const authData = {
      //     user: {
      //       id: '1',
      //       nombre: 'Admin',
      //       apellido: 'Usuario',
      //       email: 'admin@admin.cl',
      //       username: 'admin123',
      //       telefono: '912345678',
      //       direccion: 'direccion',
      //       fechaNacimiento: '2004-11-21',
      //       rol: { nombre: 'Administrador' },
      //       activo: true
      //     },
      //     token: 'mock-token-1'
      //   };
      //   localStorage.setItem('authToken', authData.token);
      //   localStorage.setItem('user', JSON.stringify(authData.user));
      //   console.log('AuthService: Mock login successful');
      //   return authData;
      // }
      
      // Get all users from the backend
      const response = await apiClient.get('/usuarios');
      console.log('AuthService: Got users response:', response.data);
      const users = response.data;
      
      // Debug: Let's see the exact structure of the first user
      if (users.length > 0) {
        console.log('AuthService: First user structure:', JSON.stringify(users[0], null, 2));
      }
      
      // Find user with matching email (password validation disabled for now)
      const user = users.find(u => {
        console.log('AuthService: Checking user:', {
          email: u.email, 
          inputEmail: email,
          activo: u.activo,
          emailMatch: u.email === email,
          activoMatch: u.activo === true
        });
        
        // Only validate email and active status for now
        return u.email === email && u.activo === true;
      });
      
      console.log('AuthService: Found user:', user);
      
      if (!user) {
        throw new Error('Credenciales incorrectas');
      }
      
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
          rol: user.rol, // This contains the role information
          activo: user.activo
        },
        token: `mock-token-${user.id}` // Generate a mock token for now
      };
      
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      console.log('AuthService: Login successful, stored data:', authData);
      
      return authData;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      if (error.message === 'Credenciales incorrectas') {
        throw error;
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
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
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
      localStorage.setItem('authToken', response.data.token);
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
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get stored user data
   */
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
