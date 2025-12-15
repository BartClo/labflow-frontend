/**
 * Utility functions for parsing and formatting permissions
 */

// Mapping of permission codes to user-friendly Spanish labels
const PERMISSION_LABELS = {
  'MANAGE_USERS': 'Gestión de Usuarios',
  'MANAGE_ROLES': 'Gestión de Roles', 
  'MANAGE_CLIENTES': 'Gestión de Clientes',
  'MANAGE_ANALISIS': 'Gestión de Análisis',
  'MANAGE_PLANTILLAS': 'Gestión de Plantillas',
  'MANAGE_MUESTRAS': 'Gestión de Muestras',
  'VIEW_REPORTS': 'Ver Reportes',
  'MANAGE_SYSTEM': 'Gestión del Sistema',
  // Add more permissions as needed
  'VIEW_USERS': 'Ver Usuarios',
  'CREATE_REPORTS': 'Crear Reportes',
  'EDIT_REPORTS': 'Editar Reportes',
  'DELETE_REPORTS': 'Eliminar Reportes'
};

/**
 * Parse a permission code to a user-friendly Spanish label
 * @param {string} permissionCode - The permission code (e.g., 'MANAGE_USERS')
 * @returns {string} The formatted label in Spanish
 */
export const parsePermission = (permissionCode) => {
  if (!permissionCode || typeof permissionCode !== 'string') {
    return 'Permiso desconocido';
  }
  
  return PERMISSION_LABELS[permissionCode] || permissionCode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Parse an array of permission codes to user-friendly Spanish labels
 * @param {string[]} permissions - Array of permission codes
 * @returns {string[]} Array of formatted labels in Spanish
 */
export const parsePermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    return [];
  }
  
  return permissions.map(permission => parsePermission(permission));
};

/**
 * Get all available permissions with their labels
 * @returns {Array} Array of objects with id and label properties
 */
export const getAvailablePermissions = () => {
  return Object.entries(PERMISSION_LABELS).map(([id, label]) => ({
    id,
    label
  }));
};

/**
 * Check if a permission code exists
 * @param {string} permissionCode - The permission code to check
 * @returns {boolean} True if the permission exists
 */
export const isValidPermission = (permissionCode) => {
  return Object.prototype.hasOwnProperty.call(PERMISSION_LABELS, permissionCode);
};

/**
 * Format a permission code for display (fallback formatting)
 * @param {string} permissionCode - The permission code
 * @returns {string} Formatted permission name
 */
export const formatPermissionCode = (permissionCode) => {
  if (!permissionCode) return '';
  
  return permissionCode
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, letter => letter.toUpperCase());
};