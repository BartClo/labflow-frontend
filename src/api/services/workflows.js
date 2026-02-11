/**
 * Workflows Service
 * 
 * Handles all workflow operations using the real backend endpoints:
 *   GET  /api/ordenes/{id}/workflow             → obtener progreso del workflow
 *   POST /api/ordenes/{id}/workflow/completar-etapa → completar etapa actual y avanzar
 *   POST /api/ordenes/{id}/crear-ot-rechazadas  → crear nueva OT con muestras rechazadas
 */

import apiClient from '../client';

/**
 * Transform backend workflow progress to frontend-friendly format.
 * Backend returns: { etapas[], etapa_actual, etapa_actual_orden, porcentaje_completado, ... }
 * Frontend expects an array of steps with: id, step_type, step_name, status, order, ...
 */
const transformWorkflowProgress = (progress) => {
  if (!progress || !progress.etapas) return { steps: [], progress };

  const statusMap = {
    PENDIENTE: 'pendiente',
    EN_PROGRESO: 'en_progreso',
    COMPLETADO: 'completado',
  };

  const steps = progress.etapas.map((etapa) => ({
    id: etapa.id_etapa,
    step_type: etapa.tipo_etapa?.toLowerCase(),
    step_name: etapa.nombre_etapa,
    status: statusMap[etapa.estado_etapa] || etapa.estado_etapa?.toLowerCase() || 'pendiente',
    order: etapa.orden_secuencia,
    assigned_to: etapa.tecnico_asignado || null,
    assigned_to_id: etapa.tecnico_asignado_id || null,
    started_at: etapa.fecha_inicio || null,
    completed_at: etapa.fecha_completado || null,
    notes: etapa.notas || null,
    created_at: etapa.created_at || null,
    updated_at: etapa.updated_at || null,
  }));

  return { steps, progress };
};

export const workflowsService = {
  /**
   * Get workflow progress for a work order (the real endpoint)
   * GET /api/ordenes/{workOrderId}/workflow
   * @returns {{ steps: Array, progress: Object }}
   */
  getWorkflowByOrderId: async (workOrderId) => {
    const response = await apiClient.get(`/ordenes/${workOrderId}/workflow`);
    return transformWorkflowProgress(response.data);
  },

  /**
   * Complete the current workflow stage and advance to the next one
   * POST /api/ordenes/{workOrderId}/workflow/completar-etapa
   * @param {UUID} workOrderId
   * @param {string|null} notas - optional notes
   * @returns {{ steps: Array, progress: Object }}
   */
  completarEtapa: async (workOrderId, notas = null) => {
    const body = notas ? { notas } : {};
    const response = await apiClient.post(`/ordenes/${workOrderId}/workflow/completar-etapa`, body);
    return transformWorkflowProgress(response.data);
  },

  /**
   * Create a new OT with rejected samples from the given OT
   * POST /api/ordenes/{workOrderId}/crear-ot-rechazadas
   */
  crearOTRechazadas: async (workOrderId, { tecnicoAsignadoId = null, notas = null } = {}) => {
    const body = {};
    if (tecnicoAsignadoId) body.tecnico_asignado_id = tecnicoAsignadoId;
    if (notas) body.notas = notas;
    const response = await apiClient.post(`/ordenes/${workOrderId}/crear-ot-rechazadas`, body);
    return response.data;
  },

  // ============================================
  // Backward-compatible aliases used by existing pages
  // ============================================

  /**
   * Alias: get workflow steps by work order ID
   * Used by SampleWorkflow.jsx via WorkflowStep.getStepsByWorkOrderId()
   * Calls the real endpoint and returns just the steps array.
   */
  getStepsByWorkOrderId: async (workOrderId) => {
    try {
      const { steps } = await workflowsService.getWorkflowByOrderId(workOrderId);
      return steps;
    } catch (error) {
      console.warn('Error loading workflow steps:', error.message);
      return [];
    }
  },

  /**
   * Alias: update step — no longer directly available; use completarEtapa instead.
   * Kept for backward compatibility; logs a warning.
   */
  update: async (id, stepData) => {
    console.warn('workflowsService.update() is deprecated. Use completarEtapa(workOrderId) instead.');
    return null;
  },

  /**
   * Alias: filter steps by work_order_id
   */
  filter: async (filters = {}) => {
    try {
      if (filters.work_order_id) {
        return await workflowsService.getStepsByWorkOrderId(filters.work_order_id);
      }
      console.warn('workflowsService.filter() only supports work_order_id filter');
      return [];
    } catch (error) {
      console.warn('workflowsService.filter() error:', error.message);
      return [];
    }
  },

  // Legacy no-ops
  create: async () => null,
  bulkCreate: async () => [],
  getAllSteps: async () => [],
  getStepById: async () => null,
  createStep: async () => null,
  updateStep: async () => null,
  deleteStep: async () => null,
  getStepsBySampleId: async () => [],
  updateStepStatus: async () => null,
  completeStep: async () => null,
  getTimeline: async () => [],
};

export default workflowsService;
