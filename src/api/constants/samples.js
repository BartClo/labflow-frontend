/**
 * Sample Constants
 * 
 * Contains constants for sample-related operations
 * Must match backend enum values (case-insensitive, backend converts to uppercase)
 */

// Backend accepts: BAJA, MEDIA, ALTA (uppercase in DB)
export const SAMPLE_PRIORITIES = {
  BAJA: 'baja',
  MEDIA: 'media', 
  ALTA: 'alta'
};

// Backend accepts: RECIBIDA, EN_PROCESO, ANALIZADA, COMPLETADA, RECHAZADA
export const SAMPLE_STATUSES = {
  RECIBIDA: 'recibida',
  EN_PROCESO: 'en_proceso',
  ANALIZADA: 'analizada',
  COMPLETADA: 'completada',
  RECHAZADA: 'rechazada'
};

// Map frontend priority labels to backend values
export const PRIORITY_MAPPING = {
  // Direct mappings (lowercase)
  baja: 'baja',
  media: 'media',
  alta: 'alta',
  // Legacy/UI label mappings
  normal: 'baja',
  urgente: 'media',
  critica: 'alta',
  // Uppercase variants (in case they come from backend)
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta'
};

// Map frontend status labels to backend values
export const STATUS_MAPPING = {
  // Direct mappings (lowercase)
  recibida: 'recibida',
  en_proceso: 'en_proceso',
  analizada: 'analizada',
  completada: 'completada',
  rechazada: 'rechazada',
  // Legacy UI mappings
  en_preparacion: 'en_proceso',
  en_analisis: 'en_proceso',
  entregada: 'completada',
  // Uppercase variants (in case they come from backend)
  RECIBIDA: 'recibida',
  EN_PROCESO: 'en_proceso',
  ANALIZADA: 'analizada',
  COMPLETADA: 'completada',
  RECHAZADA: 'rechazada'
};

// Volume units
export const VOLUME_UNITS = {
  ML: 'mL',
  L: 'L',
  UL: 'μL'
};

export default {
  SAMPLE_PRIORITIES,
  SAMPLE_STATUSES,
  PRIORITY_MAPPING,
  STATUS_MAPPING,
  VOLUME_UNITS
};