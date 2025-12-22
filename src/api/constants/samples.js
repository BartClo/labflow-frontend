/**
 * Sample Constants
 * 
 * Contains constants for sample-related operations
 */

export const SAMPLE_PRIORITIES = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA', 
  ALTA: 'ALTA'
};

export const SAMPLE_STATUSES = {
  RECIBIDA: 'RECIBIDA',
  EN_PROCESO: 'EN_PROCESO', 
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA'
};

export const PRIORITY_MAPPING = {
  normal: SAMPLE_PRIORITIES.BAJA,
  urgente: SAMPLE_PRIORITIES.MEDIA,
  critica: SAMPLE_PRIORITIES.ALTA
};

export const STATUS_MAPPING = {
  recibida: SAMPLE_STATUSES.RECIBIDA,
  en_proceso: SAMPLE_STATUSES.EN_PROCESO,
  completada: SAMPLE_STATUSES.COMPLETADA,
  cancelada: SAMPLE_STATUSES.CANCELADA
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