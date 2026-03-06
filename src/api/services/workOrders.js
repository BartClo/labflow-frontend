/**
 * Work Orders Service
 *
 * Handles all work order-related API operations.
 * Backend base path: /api/ordenes
 */

import apiClient from '../client';

// Client-side registry of OTs explicitly cancelled by the user.
// Used as fallback when the backend cancel endpoint is unavailable.
const CANCELLED_KEY = 'labflow_cancelled_ots';
const localCancelledIds = new Set(
  JSON.parse(localStorage.getItem(CANCELLED_KEY) || '[]')
);
const markLocalCancelled = (id) => {
  localCancelledIds.add(id);
  localStorage.setItem(CANCELLED_KEY, JSON.stringify([...localCancelledIds]));
};

// Client-side registry of OT priorities.
// The backend POST /ordenes does not accept/return 'prioridad', so we store it
// locally and overlay it on every transform to keep badges in sync.
const PRIORITIES_KEY = 'labflow_ot_priorities';
const localPriorities = new Map(
  Object.entries(JSON.parse(localStorage.getItem(PRIORITIES_KEY) || '{}'))
);
const setLocalPriority = (id, priority) => {
  if (!id || !priority) return;
  localPriorities.set(String(id), priority.toLowerCase());
  localStorage.setItem(PRIORITIES_KEY, JSON.stringify(Object.fromEntries(localPriorities)));
};

// Client-side registry of QC failures per OT.
// When a measured value fails Control de Calidad, we store it here so that
// the Validación de Resultados step can enforce reject-only mode and the
// timeline can display the QC step as "fallido" (red).
const QC_FAILURES_KEY = 'labflow_qc_failures';
const loadQCFailures = () => {
  try { return JSON.parse(localStorage.getItem(QC_FAILURES_KEY) || '{}'); } catch { return {}; }
};
const setQCFailed = (otId) => {
  const failures = loadQCFailures();
  failures[String(otId)] = true;
  localStorage.setItem(QC_FAILURES_KEY, JSON.stringify(failures));
};
const isQCFailed = (otId) => {
  return !!loadQCFailures()[String(otId)];
};
const clearQCFailure = (otId) => {
  const failures = loadQCFailures();
  delete failures[String(otId)];
  localStorage.setItem(QC_FAILURES_KEY, JSON.stringify(failures));
};

/**
 * Transform a backend OrdenTrabajo object to the frontend-expected shape.
 * Backend fields (snake_case) → Frontend fields used across components.
 */
const transformWorkOrder = (raw) => {
  if (!raw) return null;

  const tareas = raw.tareas || raw.tasks || [];

  // Build a combined "test_parameter" label from unique analysis names
  const analysisNames = [...new Set(
    tareas.map(t => t.nombre_analisis || t.nombreAnalisis).filter(Boolean)
  )].join(', ');

  // Normalize status: backend sends ABIERTA | EN_PROGRESO | CERRADA etc.
  const rawStatus = (raw.estado || raw.status || '').toLowerCase();
  const statusMap = {
    abierta:     'generada',
    en_progreso: 'en_analisis',
    en_proceso:  'en_analisis',
    en_analisis: 'en_analisis',
    cerrada:     'completada',
    completada:  'completada',
    finalizada:  'completada',
    cancelada:   'cancelada',
    generada:    'generada',
  };
  const normalizedStatus = statusMap[rawStatus] || rawStatus || 'generada';

  // Start with backend status, then apply overrides
  let effectiveStatus = normalizedStatus;

  // Override to 'cancelada' if locally flagged (backend couldn't persist the cancel)
  if (localCancelledIds.has(raw.id_orden_trabajo || raw.id || raw.idOrden || raw.id_orden)) {
    effectiveStatus = 'cancelada';
  }
  if (tareas.length > 0) {
    const taskStatuses = tareas.map(t =>
      (t.estado_analisis || t.estadoAnalisis || '').toUpperCase()
    );
    const allRejected = taskStatuses.every(s => s === 'RECHAZADO' || s === 'RECHAZADA' || s === 'CANCELADO' || s === 'CANCELADA');
    const hasRejected = taskStatuses.some(s => s === 'RECHAZADO' || s === 'RECHAZADA');

    if (allRejected) {
      effectiveStatus = 'cancelada';
    }
    // NOTE: We intentionally do NOT override to 'completada' based on task statuses alone.
    // Tasks may be COMPLETADO while the workflow still has steps in progress (e.g. QC, Validación).
    // The OT status should come from the backend or the workflow step progress.
  }

  const tecnico = raw.tecnico_asignado || null;
  const tecnicoNombre = tecnico
    ? [tecnico.nombre, tecnico.apellido].filter(Boolean).join(' ').trim()
    : (raw.assigned_technician || null);

  return {
    // Identity
    id:        raw.id_orden_trabajo || raw.id || raw.idOrden || raw.id_orden,
    ot_number: raw.codigo_ot || raw.numero_ot || raw.ot_number || raw.numeroOt,

    // Status / priority — prefer backend value, then locally stored override, then default
    status:   effectiveStatus,
    priority: (() => {
      const backendPriority = (raw.prioridad || raw.priority || '').toLowerCase();
      const id = raw.id_orden_trabajo || raw.id || raw.idOrden || raw.id_orden;
      return backendPriority || localPriorities.get(String(id)) || 'normal';
    })(),

    // Dates
    generated_at:    raw.fecha_creacion || raw.generated_at || raw.fechaCreacion,
    created_date:    raw.fecha_creacion || raw.created_date  || raw.fechaCreacion,
    completion_date: raw.fecha_finalizacion || raw.completion_date || raw.fechaFinalizacion,

    // Samples / tasks - normalize task data for ResultadoCapturaModal
    tareas,
    tasks: tareas.map(t => ({
      ...t,
      // Normalize field names for modal compatibility
      id_muestra_analisis: t.id_muestra_analisis || t.idMuestraAnalisis,
      numero_muestra: t.numero_muestra || t.numeroMuestra,
      nombre_analisis: t.nombre_analisis || t.nombreAnalisis,
      codigo_barras: t.codigo_barras || t.codigoBarras || t.barcode,
      estado_analisis: t.estado_analisis || t.estadoAnalisis,
      limite_minimo: t.limite_minimo || t.limiteMinimo || t.valor_minimo || t.valorMinimo,
      limite_maximo: t.limite_maximo || t.limiteMaximo || t.valor_maximo || t.valorMaximo,
      limite_deteccion: t.limite_deteccion || t.limiteDeteccion || t.limite_minimo || t.limiteMinimo,
      unidad_medida: t.unidad_medida || t.unidadMedida,
      nombre_parametro: t.nombre_parametro || t.nombreParametro || t.nombre_analisis || t.nombreAnalisis,
      normativa: t.normativa || t.norma || t.codigo_norma || t.codigoNorma,
      // Result fields
      valor_medido: t.valor_medido || t.valorMedido || null,
      observaciones: t.observaciones || null,
      cumple_normativa: t.cumple_normativa ?? t.cumpleNormativa ?? null,
      fecha_resultado: t.fecha_resultado || t.fechaResultado || null,
    })),
    sample_count:   raw.total_tareas ?? tareas.length ?? raw.sample_count ?? 0,
    sample_numbers: tareas.map(t => t.numero_muestra || t.numeroMuestra).filter(Boolean).join(', ')
                    || raw.sample_numbers || '',

    // Analysis info
    test_parameter: analysisNames || raw.test_parameter || raw.analysis_type || '',
    analysis_type:  analysisNames || raw.analysis_type  || raw.test_parameter || '',

    // Technician
    assigned_technician: tecnicoNombre,
    tecnico_asignado:    tecnico,

    // Misc
    completed_tasks: tareas.filter(t =>
      (t.estado_analisis || t.estadoAnalisis || '').toLowerCase().includes('complet')
    ).length,
    rejected_tasks: tareas.filter(t => {
      const s = (t.estado_analisis || t.estadoAnalisis || '').toUpperCase();
      return s === 'RECHAZADO' || s === 'RECHAZADA';
    }).length,
    has_rejected: tareas.some(t => {
      const s = (t.estado_analisis || t.estadoAnalisis || '').toUpperCase();
      return s === 'RECHAZADO' || s === 'RECHAZADA';
    }),
    equipment_used: raw.equipment_used || '',
  };
};

export const workOrdersService = {
  /**
   * Get all work orders  GET /ordenes
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/ordenes', { params });
    const data = response.data;
    const list = Array.isArray(data) ? data : (data?.content || []);
    return list.map(transformWorkOrder);
  },

  /**
   * Get a single work order by ID  GET /ordenes/:id
   */
  getById: async (id) => {
    const response = await apiClient.get(`/ordenes/${id}`);
    if (response.data?.tareas?.length > 0) {
      console.warn('[DEBUG] Tarea raw del backend:', JSON.stringify(response.data.tareas[0], null, 2));
    }
    return transformWorkOrder(response.data);
  },

  /**
   * Create a new work order  POST /ordenes
   * The backend expects { tarea_ids, tecnico_asignado_id, prioridad }
   */
  create: async (workOrderData) => {
    const backendData = {
      tarea_ids:           workOrderData.tarea_ids || [],
      tecnico_asignado_id: workOrderData.tecnico_asignado_id || null,
      prioridad:           (workOrderData.priority || 'normal').toUpperCase(),
    };

    if (!backendData.tarea_ids || backendData.tarea_ids.length === 0) {
      throw new Error('No se encontraron tareas para crear la orden de trabajo.');
    }
    const response = await apiClient.post('/ordenes', backendData);
    const result = transformWorkOrder(response.data);
    // Backend doesn't store/return prioridad — persist it locally so the badge stays correct
    const chosenPriority = (workOrderData.priority || 'normal').toLowerCase();
    if (result?.id) {
      setLocalPriority(result.id, chosenPriority);
      result.priority = chosenPriority;
    }
    return result;
  },

  /**
   * Update an existing work order — tries PUT, PATCH, POST for compatibility.
   */
  update: async (id, workOrderData) => {
    // Map frontend status keys back to backend-expected values
    const statusToBackend = {
      generada:          'ABIERTA',
      abierta:           'ABIERTA',
      en_proceso:        'EN_PROGRESO',
      preparacion:       'EN_PROGRESO',
      en_ejecucion:      'EN_PROGRESO',
      resultado_registrado: 'EN_PROGRESO',
      validada:          'EN_PROGRESO',
      completada:        'COMPLETADA',
      finalizada:        'COMPLETADA',
      cancelada:         'CANCELADA',
    };
    const frontStatus = (workOrderData.status || '').toLowerCase();
    const backendStatus = statusToBackend[frontStatus] || workOrderData.status?.toUpperCase();

    // Support both assigned_technician (id) and tecnico_asignado_id field names
    const tecnicoId = workOrderData.tecnico_asignado_id
      || workOrderData.assigned_technician
      || null;

    const backendData = {
      estado:              backendStatus,
      prioridad:           workOrderData.priority?.toUpperCase(),
      tecnico_asignado_id: tecnicoId,
    };

    const attempts = [
      () => apiClient.put(`/ordenes/${id}`, backendData),
      () => apiClient.patch(`/ordenes/${id}`, backendData),
      () => apiClient.post(`/ordenes/${id}`, backendData),
    ];
    let lastErr;
    for (const attempt of attempts) {
      try {
        const response = await attempt();
        const result = transformWorkOrder(response.data);
        // Persist new priority locally so it survives a full reload from backend
        const newPriority = (workOrderData.priority || '').toLowerCase();
        if (newPriority && result?.id) {
          setLocalPriority(result.id, newPriority);
          result.priority = newPriority;
        }
        return result;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;
        const msg = (err?.response?.data?.message || err?.response?.data?.error || '').toLowerCase();
        const isMethodError = (status === 405 || status === 500) &&
          (msg.includes('not supported') || msg.includes('method'));
        if (!isMethodError) throw err;
      }
    }
    throw lastErr;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/ordenes/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const statusToBackend = {
      generada:    'ABIERTA',
      abierta:     'ABIERTA',
      en_proceso:  'EN_PROGRESO',
      completada:  'COMPLETADA',
      finalizada:  'COMPLETADA',
      cancelada:   'CANCELADA',
    };
    const key = (status || '').toLowerCase();
    const backendStatus = statusToBackend[key] || status?.toUpperCase();
    const body = { estado: backendStatus };

    // Try action-based POST first (common in Spring Boot), then fall back to PUT
    const attempts = [
      () => apiClient.post(`/ordenes/${id}/estado`, body),
      () => apiClient.put(`/ordenes/${id}/estado`, body),
      () => apiClient.patch(`/ordenes/${id}/estado`, body),
    ];
    let lastErr;
    for (const attempt of attempts) {
      try {
        const response = await attempt();
        return transformWorkOrder(response.data);
      } catch (err) {
        lastErr = err;
        const msg = err?.response?.data?.message || err?.response?.data?.error || '';
        // Only retry if it's an HTTP-method-not-supported error
        const isMethodError = (err?.response?.status === 405 || err?.response?.status === 500) &&
          (msg.toLowerCase().includes('not supported') || msg.toLowerCase().includes('method'));
        if (!isMethodError) throw err;
      }
    }
    throw lastErr;
  },

  /**
   * Cancel a work order — dedicated cancel endpoint with method fallback.
   */
  cancelar: async (id) => {
    const attempts = [
      () => apiClient.post(`/ordenes/${id}/cancelar`),
      () => apiClient.post(`/ordenes/${id}/estado`, { estado: 'CANCELADA' }),
      () => apiClient.put(`/ordenes/${id}/estado`, { estado: 'CANCELADA' }),
    ];
    let lastErr;
    for (const attempt of attempts) {
      try {
        const response = await attempt();
        return transformWorkOrder(response.data);
      } catch (err) {
        lastErr = err;
        const msg = err?.response?.data?.message || err?.response?.data?.error || '';
        const isMethodError = (err?.response?.status === 405 || err?.response?.status === 500) &&
          (msg.toLowerCase().includes('not supported') || msg.toLowerCase().includes('method'));
        if (!isMethodError) throw err;
      }
    }
    // If all API attempts fail, still update local status by returning a mock object flag
    console.warn('[cancelar] All cancel endpoints failed — flagging locally only');
    return null;
  },

  /**
   * Expose local cancel flag so the modal can call it directly.
   */
  markLocalCancelled,

  /**
   * QC failure helpers – used by WorkflowTimeline / ResultadoCapturaModal
   */
  setQCFailed,
  isQCFailed,
  clearQCFailure,

  /**
   * Get work order statistics  GET /ordenes/stats
   */
  getStats: async () => {
    const response = await apiClient.get('/ordenes/stats');
    return response.data;
  },

  /**
   * List work orders with optional ordering (alias of getAll)
   */
  list: async (ordering = null) => {
    const params = ordering ? { ordering } : {};
    return workOrdersService.getAll(params);
  },

  /**
   * Create a new OT for rejected samples from an existing OT
   * POST /ordenes/:id/crear-ot-rechazadas
   */
  crearOTRechazadas: async (workOrderId, { tecnicoAsignadoId = null, notas = null, tareaIds = [] } = {}) => {
    const body = {};
    if (tecnicoAsignadoId) body.tecnico_asignado_id = tecnicoAsignadoId;
    if (notas) body.notas = notas;
    if (tareaIds && tareaIds.length > 0) body.tarea_ids = tareaIds;
    const response = await apiClient.post(`/ordenes/${workOrderId}/crear-ot-rechazadas`, body);
    return response.data;
  },
};

export default workOrdersService;
