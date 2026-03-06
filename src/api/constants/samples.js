/**
 * Sample Constants
 * 
 * Contains constants for sample-related operations
 */

export const SAMPLE_PRIORITIES = {
  BAJA: 'baja',
  MEDIA: 'media', 
  ALTA: 'alta'
};

export const SAMPLE_STATUSES = {
  RECIBIDA: 'recibida',
  EN_PREPARACION: 'en_preparacion',
  EN_ANALISIS: 'en_analisis',
  COMPLETADA: 'completada',
  ENTREGADA: 'entregada'
};

export const PRIORITY_MAPPING = {
  normal: SAMPLE_PRIORITIES.BAJA,
  urgente: SAMPLE_PRIORITIES.MEDIA,
  critica: SAMPLE_PRIORITIES.ALTA
};

export const STATUS_MAPPING = {
  recibida: SAMPLE_STATUSES.RECIBIDA,
  en_preparacion: SAMPLE_STATUSES.EN_PREPARACION,
  en_analisis: SAMPLE_STATUSES.EN_ANALISIS,
  completada: SAMPLE_STATUSES.COMPLETADA,
  entregada: SAMPLE_STATUSES.ENTREGADA
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