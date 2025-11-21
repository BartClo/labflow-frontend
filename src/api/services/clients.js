/**
 * Clients Service
 * 
 * Handles all client-related API operations
 */

import apiClient from '../client';

export const clientsService = {
  /**
   * Get all clients
   */
  getAll: async (params = {}) => {
    // Support legacy call signatures where a string sort key may be passed
    const paramsObj = typeof params === 'string' ? { sort: params } : params || {};
    const response = await apiClient.get('/clientes', { params: paramsObj });
    // Map backend DTO fields to frontend model
    return (response.data || []).map(mapClientDTOToModel);
  },

  /**
   * Get a single client by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/clientes/${id}`);
    return mapClientDTOToModel(response.data);
  },

  /**
   * Create a new client
   */
  create: async (clientData) => {
    const response = await apiClient.post('/clientes', clientData);
    return mapClientDTOToModel(response.data);
  },

  /**
   * Update an existing client
   */
  update: async (id, clientData) => {
    const response = await apiClient.put(`/clientes/${id}`, clientData);
    return mapClientDTOToModel(response.data);
  },

  /**
   * Delete a client
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/clientes/${id}`);
    return response.data;
  },

  /**
   * Search clients
   */
  search: async (query) => {
    const response = await apiClient.get('/clientes/buscar', {
      params: { nombre: query },
    });
    return (response.data || []).map(mapClientDTOToModel);
  },
};

export default clientsService;

// Backwards-compatible aliases used by some components
// e.g. `Client.list()` in legacy code
clientsService.list = clientsService.getAll;

function mapClientDTOToModel(dto) {
  if (!dto) return dto;
  return {
    id: dto.idCliente || dto.id || null,
    name: dto.nombreCliente || dto.name || '',
    company: dto.empresa || dto.company || '',
    email: dto.email || '',
    phone: dto.telefono || dto.phone || '',
    address: dto.direccion || dto.address || '',
    contact_person: dto.personaContacto || dto.contact_person || '',
    client_type: dto.tipoCliente || dto.client_type || '',
    status: dto.activo ? 'activo' : 'inactivo',
    // Keep additional raw fields if present for future use
    raw: dto,
  };
}



// {
//   "nombreCliente": "Juan Pérez",
//   "nombre": "Juan Pérez",
//   "empresa": "Empresa ABC S.A.",
//   "email": "contacto@empresaabc.com",
//   "telefono": "+56 9 1234 5678",
//   "direccion": "Av. Principal 123, Santiago",
//   "personaContacto": "María González",
//   "tipoCliente": "Empresa",
//   "activo": true
// }