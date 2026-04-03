import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Scan, Save, FlaskConical, SkipForward, AlertCircle } from 'lucide-react';
import tasksService from '@/api/services/tasks';
import { analysisService } from '@/api/services/analysis';
import { WorkOrder } from '@/api/entities';
import workOrdersService from '@/api/services/workOrders';

// Normalise step name for comparison (strip accents, lowercase)
const normalizeStepName = (name) =>
  (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const isQCStep = (stepName) => {
  const n = normalizeStepName(stepName);
  return n.includes('control de calidad') || n === 'calidad';
};
const isValidacionStep = (stepName) => {
  const n = normalizeStepName(stepName);
  return n.includes('validacion') || n.includes('validar resultado');
};

/**
 * ResultadoCapturaModal
 *
 * Props:
 *   open            - boolean: controls dialog visibility
 *   onOpenChange    - fn(bool): toggle dialog
 *   ordenTrabajoId  - UUID of the current work order
 *   muestrasOT      - Array of task objects from the OT (enriched with limits from backend)
 *   onResultadoGuardado - callback after saving result
 */
const ResultadoCapturaModal = ({ open, onOpenChange, ordenTrabajoId, muestrasOT = [], onResultadoGuardado, currentStepName = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [tareaInfo, setTareaInfo] = useState(null);
  const [valorMedido, setValorMedido] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [reportarDiscrepancia, setReportarDiscrepancia] = useState(false);
  const [nuevoValor, setNuevoValor] = useState('');
  const [validacionEstado, setValidacionEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [processedIds, setProcessedIds] = useState(new Set());
  const [hasQCFailureLocal, setHasQCFailureLocal] = useState(false);
  const [hasAutoRejectLocal, setHasAutoRejectLocal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const codigoRef = useRef(null);
  const valorRef = useRef(null);

  // Filter out already-completed tasks so the operator only sees pending ones
  const pendingMuestras = useMemo(() => {
    return muestrasOT.filter(m => {
      const estado = (m.estado_analisis || m.estadoAnalisis || '').toUpperCase();
      // If we are in "Validación de Resultados", we need to see "COMPLETADO" tasks to validate them.
      if (isValidacionStep(currentStepName)) {
        return estado !== 'VALIDADO' && estado !== 'RECHAZADO' && estado !== 'CANCELADO';
      }
      return estado !== 'COMPLETADO' && estado !== 'VALIDADO' && estado !== 'RECHAZADO' && estado !== 'CANCELADO';
    });
  }, [muestrasOT, currentStepName]);

  // Current sample based on index
  const currentMuestra = pendingMuestras[currentIndex] || null;
  const totalMuestras = pendingMuestras.length;

  // Determine if this OT previously failed QC
  const otHadQCFailure = ordenTrabajoId ? workOrdersService.isQCFailed(ordenTrabajoId) : false;
  // In Validación step with prior QC failure and value still out of range → reject-only mode
  const isInValidacion = isValidacionStep(currentStepName);
  const rejectOnlyMode = isInValidacion && otHadQCFailure && validacionEstado === 'invalido';
  // Also determine if we're in QC step for UI label
  const isInQC = isQCStep(currentStepName);

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setSavedCount(0);
      setProcessedIds(new Set());
      resetFormFields();
      // No seleccionamos automáticamente para forzar escaneo
      setTimeout(() => codigoRef.current?.focus(), 120);
    } else {
      fullReset();
    }
  }, [open]);

  // When currentIndex changes manually (from skip), auto-select only if it was explicit
  // But generally, we want the user to scan.
  useEffect(() => {
    // We'll leave it intentionally empty and remove auto selection here.
    // The previous logic auto-selected on currentIndex change.
    // Now we rely on validarCodigo to select it.
  }, [currentIndex]);

  const resetFormFields = () => {
    setCodigoBarras('');
    setTareaInfo(null);
    setValorMedido('');
    setObservaciones('');
    setValidacionEstado(null);
    setError(null);
    setSuccessMsg(null);
    setLoading(false);
    setReportarDiscrepancia(false);
    setNuevoValor('');
  };

  const fullReset = () => {
    resetFormFields();
    setCurrentIndex(0);
    setSavedCount(0);
    setProcessedIds(new Set());
    setHasQCFailureLocal(false);
    setHasAutoRejectLocal(false);
    setShowRejectDialog(false);
    setRejectNotes('');
    setRejectLoading(false);
  };

  const autoSelectMuestra = (muestra) => {
    if (!muestra) return;
    console.warn('[DEBUG] Muestra seleccionada:', JSON.stringify(muestra, null, 2));
    const barcode = muestra.codigo_barras || muestra.codigoBarras || '';
    setCodigoBarras(barcode);
    
    // NUNCA pre-llenar el valor - siempre debe venir vacío para evitar confusiones
    // Esto es especialmente crítico cuando se rehace una muestra fallida
    setValorMedido('');

    setTareaInfo({
      id_muestra_analisis: muestra.id_muestra_analisis || muestra.idMuestraAnalisis,
      id_muestra: muestra.id_muestra || muestra.idMuestra || null,
      numero_muestra: muestra.numero_muestra || muestra.numeroMuestra || '',
      codigo_barras: barcode,
      nombre_analisis: muestra.nombre_analisis || muestra.nombreAnalisis || '',
      nombre_parametro: muestra.nombre_parametro || muestra.nombreParametro || muestra.nombre_analisis || muestra.nombreAnalisis || '',
      unidad_medida: muestra.unidad_medida || muestra.unidadMedida || null,
      limite_minimo: muestra.limite_minimo || muestra.limiteMinimo || null,
      limite_maximo: muestra.limite_maximo || muestra.limiteMaximo || null,
      limite_deteccion: muestra.limite_deteccion || muestra.limiteDeteccion || muestra.limite_minimo || muestra.limiteMinimo || null,
      normativa: muestra.normativa || muestra.norma || muestra.codigo_norma || muestra.codigoNorma || null,
    });
    setTimeout(() => valorRef.current?.focus(), 120);
  };

  // Handle manual combobox selection
  const handleMuestraSelect = (muestraId) => {
    // Check if this sample was already processed
    if (processedIds.has(muestraId)) {
      setError(`Esta muestra ya fue procesada. ¿Desea realizar algún cambio de valor?`);
      setTareaInfo(null);
      setCodigoBarras('');
      setValorMedido('');
      return;
    }
    
    const idx = pendingMuestras.findIndex(
      m => (m.id_muestra_analisis || m.idMuestraAnalisis) === muestraId
    );
    if (idx >= 0) {
      setCurrentIndex(idx);
      autoSelectMuestra(pendingMuestras[idx]);
    }
  };

  const validarCodigo = async () => {
    if (!codigoBarras.trim()) {
      setError('Ingrese o escanee un código de barras');
      return;
    }
    setLoading(true);
    setError(null);

    const inputBarcode = codigoBarras.trim().toUpperCase();
    const allMuestras = muestrasOT.length > 0 ? muestrasOT : pendingMuestras;
    
    // Buscar por código de barras O por número de muestra
    const matchedSample = allMuestras.find(m => {
      const sampleBarcode = (m.codigo_barras || m.codigoBarras || '').toString().trim().toUpperCase();
      const sampleNumber = (m.numero_muestra || m.numeroMuestra || '').toString().trim().toUpperCase();
      return (sampleBarcode && sampleBarcode === inputBarcode) || (sampleNumber && sampleNumber === inputBarcode);
    });

    if (matchedSample) {
      const taskId = matchedSample.id_muestra_analisis || matchedSample.idMuestraAnalisis;
      
      // Check if already processed
      if (processedIds.has(taskId)) {
        setError('Esta muestra ya fue procesada. ¿Desea realizar algún cambio de valor?');
        setTareaInfo(null);
        setLoading(false);
        return;
      }
      
      autoSelectMuestra(matchedSample);
      const idx = pendingMuestras.findIndex(
        m => (m.id_muestra_analisis || m.idMuestraAnalisis) === taskId
      );
      if (idx >= 0) setCurrentIndex(idx);
      setLoading(false);
      return;
    }

    setError('El código no corresponde a ninguna muestra de esta OT');
    setTareaInfo(null);
    setLoading(false);
  };

  // Fetch missing limits from analysis template if the backend sends null in tasks
  useEffect(() => {
    const fetchLimites = async () => {
      if (tareaInfo && tareaInfo.nombre_analisis && (tareaInfo.limite_maximo === null || tareaInfo.limite_minimo === null || tareaInfo.limite_deteccion === null)) {
        try {
          const data = await analysisService.getAll();
          const match = data.find(a => 
            a.nombreAnalisis.trim().toLowerCase() === tareaInfo.nombre_analisis.trim().toLowerCase()
          );
          if (match && match.parametrosMedir) {
            // Some keys are dynamic like "para" or the parameter name. Try to extract from the first value.
            const paramsKey = Object.keys(match.parametrosMedir)[0];
            if (paramsKey) {
              const params = match.parametrosMedir[paramsKey];
              setTareaInfo(prev => {
                if (!prev || prev.id_muestra_analisis !== tareaInfo.id_muestra_analisis) return prev;
                return {
                  ...prev,
                  limite_minimo: prev.limite_minimo ?? params.limiteMinimo ?? params.limiteDeteccion,
                  limite_maximo: prev.limite_maximo ?? params.limiteMaximo,
                  limite_deteccion: prev.limite_deteccion ?? params.limiteDeteccion ?? params.limiteMinimo,
                  unidad_medida: prev.unidad_medida ?? params.unidad
                };
              });
            }
          }
        } catch(e) {
          console.error("Error fetching analysis limits fallback", e);
        }
      }
    };
    fetchLimites();
  }, [tareaInfo?.id_muestra_analisis]);

  // Helper to safely parse limits that might have commas instead of dots
  const parseSafeFloat = (val) => {
    if (val === null || val === undefined || val === '') return NaN;
    return parseFloat(val.toString().replace(',', '.'));
  };

  // Traffic-light: validate value against limits
  useEffect(() => {
    if (!tareaInfo || valorMedido === '') {
      setValidacionEstado(null);
      return;
    }
    const valor = parseSafeFloat(valorMedido);
    if (Number.isNaN(valor)) { setValidacionEstado(null); return; }

    let limiteMin = tareaInfo.limite_minimo ?? tareaInfo.limite_deteccion ?? null;
    let limiteMax = tareaInfo.limite_maximo ?? null;

    if (limiteMin === '') limiteMin = null;
    if (limiteMax === '') limiteMax = null;

    if (limiteMin !== null && limiteMax !== null) {
      const min = parseSafeFloat(limiteMin);
      const max = parseSafeFloat(limiteMax);
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        setValidacionEstado(valor >= min && valor <= max ? 'valido' : 'invalido');
        return;
      }
    }
    if (limiteMin !== null) {
      const min = parseSafeFloat(limiteMin);
      if (!Number.isNaN(min)) {
        setValidacionEstado(valor >= min ? 'valido' : 'invalido');
        return;
      }
    }
    if (limiteMax !== null) {
      const max = parseSafeFloat(limiteMax);
      if (!Number.isNaN(max)) {
        setValidacionEstado(valor <= max ? 'valido' : 'invalido');
        return;
      }
    }
    setValidacionEstado(null);
  }, [valorMedido, tareaInfo]);

  const handleGuardar = async () => {
      if (!tareaInfo || valorMedido === '') {
        setError('Complete el código de barras y el valor medido');
        return;
      }
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      try {
        const taskId = tareaInfo.id_muestra_analisis ?? tareaInfo.idMuestraAnalisis;
        // When reporting discrepancy, use the new value for validation
        const valorParaValidar = (reportarDiscrepancia && nuevoValor) ? parseFloat(nuevoValor) : parseFloat(valorMedido);
        
        // Calculate cumple_normativa based on validation state or limits
        let cumpleNormativa = null;
        if (validacionEstado === 'valido' && !reportarDiscrepancia) {
          // If explicitly valid and not reporting discrepancy, it's compliant
          cumpleNormativa = true;
        } else if (validacionEstado === 'invalido' && !reportarDiscrepancia) {
          // If explicitly invalid and not reporting discrepancy, it's non-compliant
          cumpleNormativa = false;
        } else {
          // If reporting discrepancy OR no explicit validation state, check against limits
          const min = parseFloat(tareaInfo?.limite_minimo ?? tareaInfo?.limite_deteccion);
          const max = parseFloat(tareaInfo?.limite_maximo);
          if (!isNaN(valorParaValidar)) {
            if (!isNaN(min) && !isNaN(max)) {
              cumpleNormativa = valorParaValidar >= min && valorParaValidar <= max;
            } else if (!isNaN(max)) {
              cumpleNormativa = valorParaValidar <= max;
            } else if (!isNaN(min)) {
              cumpleNormativa = valorParaValidar >= min;
            } else {
              // No limits available, assume compliant
              cumpleNormativa = true;
            }
          }
        }
        // Backend expects parametros as a Map<String, ParametroResultadoDTO> keyed by parameter name
        const parametroKey = tareaInfo.nombre_parametro || tareaInfo.nombre_analisis;
        const payload = {
          parametros: {
            [parametroKey]: {
              valor: parseFloat(valorMedido),
              valor_medido: parseFloat(valorMedido), // valor original de QC
              cumple_normativa: cumpleNormativa,
              observaciones: observaciones || null,
              reportarDiscrepancia: reportarDiscrepancia || false,
              nuevoValor: reportarDiscrepancia && nuevoValor ? parseFloat(nuevoValor) : null,
            },
          },
        };
        console.warn('[DEBUG] Guardando resultado:', { taskId, payload });
        const saved = await tasksService.updateResult(taskId, payload);

        // Also persist valor_medido via the simpler guardarResultado endpoint
        // so the value is stored directly on the task record and returned by getById
        try {
          await tasksService.guardarResultado({
            id_muestra_analisis: taskId,
            codigo_barras: tareaInfo.codigo_barras || tareaInfo.numero_muestra || '',
            valor_medido: parseFloat(valorMedido),
            observaciones: observaciones || null,
            reportarDiscrepancia: reportarDiscrepancia || false,
            nuevoValor: reportarDiscrepancia && nuevoValor ? parseFloat(nuevoValor) : null,
          });
        } catch (fallbackErr) {
          // Non-critical: the primary updateResult already succeeded
          console.warn('[DEBUG] guardarResultado fallback failed (non-critical):', fallbackErr?.response?.data || fallbackErr.message);
        }

        const newSavedCount = savedCount + 1;
        setSavedCount(newSavedCount);
        const newProcessedIds = new Set(processedIds);
        newProcessedIds.add(taskId);
        setProcessedIds(newProcessedIds);
        
        const isQC = isQCStep(currentStepName);
        const isComplete = newProcessedIds.size >= totalMuestras;

        const getNextIndex = () => {
          for (let i = 1; i <= totalMuestras; i++) {
            const checkIdx = (currentIndex + i) % totalMuestras;
            const m = pendingMuestras[checkIdx];
            if (m && !newProcessedIds.has(m.id_muestra_analisis || m.idMuestraAnalisis)) {
               return checkIdx;
            }
          }
          return currentIndex + 1;
        };

        if (cumpleNormativa === false && !reportarDiscrepancia) {
          // Auto-rechazo SOLO si el valor está fuera de norma Y no está reportando discrepancia
          // Si reporta discrepancia, permitir guardar incluso si el nuevo valor está fuera de rango
          try {
            await tasksService.rechazarTarea(taskId);
          } catch (rejectErr) {
            if (tareaInfo.id_muestra) {
              try { await tasksService.rechazarMuestra(tareaInfo.id_muestra); } catch (e) { }
            }
          }

          if (isQC) setHasQCFailureLocal(true);

          if (!isComplete) {
            const nextIdx = getNextIndex();
            setSuccessMsg(`❌ Muestra rechazada. Escanee la siguiente muestra...`);
            setTimeout(() => {
              setCurrentIndex(nextIdx);
              resetFormFields();
              setSuccessMsg(null);
              setTimeout(() => codigoRef.current?.focus(), 100);
            }, 1500);
          } else {
            // Check accumulated QC failure
            const finalQCFailed = isQC || hasQCFailureLocal;
            
            onResultadoGuardado && onResultadoGuardado({
              ...saved,
              action: 'rejected',
              auto_rejected: true,
              qc_failed: finalQCFailed,
              tarea_id: taskId,
              numero_muestra: tareaInfo.numero_muestra,
            });
            setSuccessMsg(finalQCFailed 
              ? `❌ Control de Calidad fallido. Todas procesadas.` 
              : `❌ Muestra rechazada. Todas procesadas.`);
              
            setTimeout(() => {
              onOpenChange(false);
              fullReset();
            }, 1500);
          }
          return;
        }

        // Determine if this is a QC failure (Control de Calidad step + value out of range)
        const qcFailed = isQC && validacionEstado === 'invalido';
        let currentQCFailed = false;

        if (qcFailed) {
            setHasQCFailureLocal(true);
            currentQCFailed = true;
        }

        if (!isComplete) {
          const nextIdx = getNextIndex();
          if (currentQCFailed) {
              setSuccessMsg(`⚠️ Control de calidad fallido (${newSavedCount}/${totalMuestras}). Escanee la siguiente muestra...`);
          } else if (reportarDiscrepancia) {
              // When reporting discrepancy, acknowledge it was corrected
              const nuevoValorNum = parseFloat(nuevoValor);
              const min = parseFloat(tareaInfo?.limite_minimo ?? tareaInfo?.limite_deteccion);
              const max = parseFloat(tareaInfo?.limite_maximo);
              let isNuevoValorFuera = false;
              
              if (!isNaN(nuevoValorNum) && !isNaN(min) && !isNaN(max)) {
                isNuevoValorFuera = nuevoValorNum < min || nuevoValorNum > max;
              }
              
              if (isNuevoValorFuera) {
                setSuccessMsg(`⚠️ Corrección registrada (valor fuera de rango) (${newSavedCount}/${totalMuestras}). Escanee la siguiente muestra...`);
              } else {
                setSuccessMsg(`✓ Corrección guardada (${newSavedCount}/${totalMuestras}). Escanee la siguiente muestra...`);
              }
          } else {
              setSuccessMsg(`✓ Resultado guardado (${newSavedCount}/${totalMuestras}). Escanee la siguiente muestra...`);
          }
          setTimeout(() => {
            setCurrentIndex(nextIdx);
            resetFormFields();
            setSuccessMsg(null);
            setTimeout(() => codigoRef.current?.focus(), 100);
          }, 1500);
        } else {
          const finalQCFailed = hasQCFailureLocal || currentQCFailed;

          if (finalQCFailed) {
             onResultadoGuardado && onResultadoGuardado({ ...saved, qc_failed: true });
             setSuccessMsg('✓ Procesado completo. Control de Calidad fallido.');
          } else {
             onResultadoGuardado && onResultadoGuardado(saved);
             setSuccessMsg(`✓ ¡Todos los resultados guardados! (${newSavedCount} muestras procesadas)`);
          }
          setTimeout(() => {
            onOpenChange(false);
            fullReset();
          }, 1500);
        }
      } catch (err) {
        // Log detailed error for debugging
        console.error('[DEBUG] Error guardando resultado:', err?.response?.data);
        // Extract detailed validation errors if available
        const errorData = err?.response?.data;
        let errorMsg = errorData?.mensaje || errorData?.message || 'Error al guardar el resultado';
        if (errorData?.errors) {
          const fieldErrors = Object.entries(errorData.errors).map(([field, msg]) => `${field}: ${msg}`).join(', ');
          errorMsg = `${errorMsg} (${fieldErrors})`;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    

  const handleSkip = () => {
    let nextIdx = -1;
    for (let i = 1; i < totalMuestras; i++) {
      const checkIdx = (currentIndex + i) % totalMuestras;
      const m = pendingMuestras[checkIdx];
      if (m && !processedIds.has(m.id_muestra_analisis || m.idMuestraAnalisis)) {
        nextIdx = checkIdx;
        break;
      }
    }
    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
      resetFormFields();
      setTimeout(() => codigoRef.current?.focus(), 100);
    } else if (currentIndex + 1 < totalMuestras) {
      setCurrentIndex(currentIndex + 1);
      resetFormFields();
      setTimeout(() => codigoRef.current?.focus(), 100);
    }
  };

  const handleRejectSample = () => {
    setShowRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    if (!tareaInfo) return;
    
    setRejectLoading(true);
    setError(null);
    try {
      const taskId = tareaInfo.id_muestra_analisis ?? tareaInfo.idMuestraAnalisis;
      const inQC = isQCStep(currentStepName);
      const inValidacion = isValidacionStep(currentStepName);

      const newProcessedIds = new Set(processedIds);
      newProcessedIds.add(taskId);
      setProcessedIds(newProcessedIds);
      const isComplete = newProcessedIds.size >= totalMuestras;

      const getNextIndex = () => {
         for (let i = 1; i <= totalMuestras; i++) {
           const checkIdx = (currentIndex + i) % totalMuestras;
           const m = pendingMuestras[checkIdx];
           if (m && !newProcessedIds.has(m.id_muestra_analisis || m.idMuestraAnalisis)) {
              return checkIdx;
           }
         }
         return currentIndex + 1;
      };

      // 1. Guardar resultado con cumple_normativa=false si hay valor medido
      if (valorMedido !== '') {
        const parametroKey = tareaInfo.nombre_parametro || tareaInfo.nombre_analisis;
        const payload = {
          parametros: {
            [parametroKey]: {
              valor: parseFloat(valorMedido),
              valor_medido: parseFloat(valorMedido),
              cumple_normativa: false,
              observaciones: rejectNotes || `Rechazada: valor fuera de normativa (${valorMedido})`,
            },
          },
        };
        try {
          await tasksService.updateResult(taskId, payload);
        } catch (resultErr) {
          console.warn('No se pudo guardar resultado antes del rechazo:', resultErr?.message);
        }
      }

      // ------- QC STEP: mark as failed, advance to Validación, OT stays active -------
      if (inQC) {
          setHasQCFailureLocal(true);
          setSuccessMsg(`⚠️ Muestra rechazada (QC). Escanee la siguiente...`);
          setShowRejectDialog(false);
          setRejectNotes('');

          if (!isComplete) {
              const nextIdx = getNextIndex();
              setTimeout(() => {
                setCurrentIndex(nextIdx);
                resetFormFields();
                setTimeout(() => codigoRef.current?.focus(), 100);
              }, 800);
          } else {
              // Only trigger advancement if this was the last sample
              setSuccessMsg(`✓ Control de calidad fallido — avanzando a Validación de Resultados`);
              // Signal QC failure to parent (advance step, mark QC failed)
              onResultadoGuardado && onResultadoGuardado({
                action: 'rejected',
                qc_failed: true,
                tarea_id: taskId,
                numero_muestra: tareaInfo.numero_muestra,
              });
      
              setTimeout(() => {
                onOpenChange(false);
                fullReset();
              }, 800);
          }

        return;
      }

      // ------- VALIDACIÓN STEP: full rejection → cancel OT → offer to generate new OT -------
      // 2. Marcar la tarea como RECHAZADA en el backend
      try {
        await tasksService.rechazarTarea(taskId);
      } catch (rejectErr) {
        if (tareaInfo.id_muestra) {
          try {
            await tasksService.rechazarMuestra(tareaInfo.id_muestra);
          } catch (muErr) {
            console.warn('Ambos endpoints de rechazo fallaron:', muErr?.message);
          }
        } else {
          console.warn('rechazarTarea falló:', rejectErr?.message);
        }
      }

      setShowRejectDialog(false);
      setRejectNotes('');

      // Collect ALL rejected task ids for this OT (current + any previously rejected)
      const rejectedTaskIds = [taskId];
      const rejectedMuestras = [
        { id: taskId, numero: tareaInfo.numero_muestra, analisis: tareaInfo.nombre_analisis }
      ];

      // Check remaining pending samples using processedIds
      const isCompleteValidacion = isComplete;

      // Cancel the OT (all samples rejected or this is the final rejection in validation)
      if (isCompleteValidacion || pendingMuestras.length <= 1) {
        try {
          await WorkOrder.cancelar(ordenTrabajoId);
        } catch (cancelErr) {
          console.warn('Cancel API failed, registrando localmente:', cancelErr?.message);
        }
        WorkOrder.markLocalCancelled(ordenTrabajoId);
      }

      // Signal to parent: validation rejected → go to Cancelados + offer new OT
      onResultadoGuardado && onResultadoGuardado({
        action: 'rejected',
        validation_rejected: true,
        tarea_id: taskId,
        numero_muestra: tareaInfo.numero_muestra,
        ot_cancelled: isCompleteValidacion || pendingMuestras.length <= 1,
        rejected_tasks: rejectedTaskIds,
        rejected_muestras: rejectedMuestras,
      });

      // Advance to next sample or close
      setTimeout(() => {
        if (!isCompleteValidacion && pendingMuestras.length > 1) {
          setCurrentIndex(getNextIndex());
          resetFormFields();
          setSuccessMsg(null);
          setTimeout(() => codigoRef.current?.focus(), 100);
        } else {
          setSuccessMsg('✓ Muestras rechazadas — OT enviada a Cancelados');
          setTimeout(() => {
            onOpenChange(false);
            fullReset();
            // Need to notify parent if it wasn't a validacion failure, or it's handled above
          }, 1000);
        }
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.mensaje || err?.response?.data?.message || 'Error al rechazar la muestra');
    } finally {
      setRejectLoading(false);
    }
  };

  const renderLimites = () => {
    if (!tareaInfo) return null;
    const unidad = tareaInfo.unidad_medida || '';
    const min = tareaInfo.limite_minimo ?? tareaInfo.limite_deteccion ?? null;
    const max = tareaInfo.limite_maximo ?? null;
    const parametro = tareaInfo.nombre_parametro || tareaInfo.nombre_analisis || '';
    const normativa = tareaInfo.normativa || tareaInfo.norma || '';

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <div className="font-semibold text-blue-800 mb-2 flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          Parámetros a Medir
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">•</span>
            <span className="font-medium text-blue-900">{parametro}</span>
          </div>
          {normativa && (
            <div>
              <span className="text-gray-500">Normativa:</span> <span className="font-medium">{normativa}</span>
            </div>
          )}
          {unidad && (
            <div>
              <span className="text-gray-500">Unidad:</span> <span className="font-medium">{unidad}</span>
            </div>
          )}
          {min !== null && (
            <div>
              <span className="text-gray-500">Lím. Mín/Det:</span> <span className="font-medium">{min}</span>
            </div>
          )}
          {max !== null && (
            <div>
              <span className="text-gray-500">Lím. Máximo:</span> <span className="font-medium">{max}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSemaforo = () => {
    // When reporting discrepancy, validate the new value instead
    if (reportarDiscrepancia && nuevoValor) {
      const nuevoValorNum = parseFloat(nuevoValor);
      const min = parseFloat(tareaInfo?.limite_minimo ?? tareaInfo?.limite_deteccion);
      const max = parseFloat(tareaInfo?.limite_maximo);
      let cumple = false;
      
      if (!isNaN(nuevoValorNum)) {
        if (!isNaN(min) && !isNaN(max)) {
          cumple = nuevoValorNum >= min && nuevoValorNum <= max;
        } else if (!isNaN(max)) {
          cumple = nuevoValorNum <= max;
        } else if (!isNaN(min)) {
          cumple = nuevoValorNum >= min;
        } else {
          cumple = true;
        }
      }
      
      if (cumple) {
        return (
          <div className="flex items-center gap-2 p-2 rounded bg-green-50 text-green-700">
            <CheckCircle className="w-4 h-4" />
            Nuevo valor dentro de los límites normativos
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2 p-2 rounded bg-red-50 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            ALERTA: Nuevo valor fuera de norma
          </div>
        );
      }
    }
    
    // Normal validation state display
    if (!validacionEstado) return null;
    if (validacionEstado === 'valido') {
      return (
        <div className="flex items-center gap-2 p-2 rounded bg-green-50 text-green-700">
          <CheckCircle className="w-4 h-4" />
          Valor dentro de los límites normativos
        </div>
      );
    }
    return (
      <>
        <div className="flex items-center gap-2 p-2 rounded bg-red-50 text-red-700">
          <AlertTriangle className="w-4 h-4" />
          ALERTA: Valor fuera de norma
        </div>
        {/* Show reject-only warning in Validación step when QC previously failed */}
        {rejectOnlyMode && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 border border-red-300 text-red-800 font-semibold">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p>Control de calidad fallido</p>
              <p className="text-xs font-normal mt-1">
                El valor sigue fuera de los parámetros normativos. Solo se permite rechazar la muestra.
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  const selectedMuestraId = currentMuestra
    ? (currentMuestra.id_muestra_analisis || currentMuestra.idMuestraAnalisis)
    : '';

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto my-4">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              {isInValidacion && otHadQCFailure
                ? 'Validación de Resultados — QC Fallido'
                : 'Capturar Resultado'}
            </DialogTitle>
            {totalMuestras > 0 && (
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Muestra {Math.min(currentIndex + 1, totalMuestras)} de {totalMuestras}
              </span>
            )}
          </div>
          {/* QC failure banner in Validación step */}
          {isInValidacion && otHadQCFailure && (
            <div className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Control de calidad fallido — Verifique los valores antes de continuar</span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar */}
          {totalMuestras > 1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(savedCount / totalMuestras) * 100}%` }}
              />
            </div>
          )}

          {/* Combobox: list of OT samples */}
          {pendingMuestras.length > 0 && (
            <div>
              <Label>Muestras en esta OT</Label>
              <Select value={selectedMuestraId} onValueChange={handleMuestraSelect}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar muestra..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingMuestras.map((m) => {
                    const id = m.id_muestra_analisis || m.idMuestraAnalisis;
                    const numero = m.numero_muestra || m.numeroMuestra || 'Sin número';
                    const analisis = m.nombre_analisis || m.nombreAnalisis || '';
                    const barcode = m.codigo_barras || m.codigoBarras || '';
                    const isProcessed = processedIds.has(id);
                    
                    return (
                      <SelectItem key={id} value={id} disabled={isProcessed}>
                        <div className="flex items-center gap-2">
                          {isProcessed && <CheckCircle className="w-3 h-3 text-green-600" />}
                          <FlaskConical className={`w-3 h-3 ${isProcessed ? 'text-gray-400' : 'text-blue-500'}`} />
                          <span className={isProcessed ? 'text-gray-400 line-through' : ''}>{numero}</span>
                          {analisis && <span className={`text-gray-500 text-xs ${isProcessed ? 'text-gray-300' : ''}`}>— {analisis}</span>}
                          {barcode && <span className={`text-gray-400 text-xs ml-1 ${isProcessed ? 'text-gray-300' : ''}`}>[{barcode}]</span>}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Barcode scanner */}
          <div>
            <Label htmlFor="barcode">Escanear código de barras</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="barcode"
                ref={codigoRef}
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); validarCodigo(); } }}
                placeholder="Escanee o ingrese el código"
                disabled={loading || !!tareaInfo}
              />
              {!tareaInfo && (
                <Button onClick={validarCodigo} disabled={loading}>
                  Validar
                </Button>
              )}
              {tareaInfo && (
                <Button variant="outline" onClick={() => { setTareaInfo(null); setError(null); setCodigoBarras(''); }}>
                  Cambiar
                </Button>
              )}
            </div>
          </div>

          {/* Validated sample info */}
          {tareaInfo && (
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800 font-semibold">Muestra válida</span>
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  {tareaInfo.numero_muestra} — {tareaInfo.nombre_analisis}
                </div>
              </div>

              {renderLimites()}

              <div>
                <Label htmlFor="valor">Ingrese el valor medido</Label>
                <Input
                  id="valor"
                  ref={valorRef}
                  type="number"
                  step="0.000001"
                  value={valorMedido}
                  onChange={(e) => setValorMedido(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGuardar(); } }}
                  placeholder="Valor medido"
                  className="mt-1"
                />
              </div>

              {renderSemaforo()}

              {/* Alerta y opción para reportar discrepancia en Validación - SIEMPRE MOSTRAR EN VALIDACIÓN */}
              {isInValidacion && (
                <div className="space-y-3">
                  <div className="space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <strong>Valor diferente al control de calidad</strong>
                        <p className="mt-1 text-xs">El valor ingresado no coincide con el medido en la etapa anterior. Si el valor anterior fue incorrecto, marque la opción para reportar la corrección.</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportarDiscrepancia}
                        onChange={(e) => setReportarDiscrepancia(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-yellow-800 font-medium">
                        El valor anterior fue incorrecto
                      </span>
                    </label>
                  </div>

                  {/* Campo para el nuevo valor entregado por la máquina */}
                  {reportarDiscrepancia && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label htmlFor="nuevo-valor" className="text-sm font-semibold text-blue-900">
                        Valor nuevo entregado por la máquina *
                      </Label>
                      <Input
                        id="nuevo-valor"
                        type="number"
                        step="0.000001"
                        value={nuevoValor}
                        onChange={(e) => setNuevoValor(e.target.value)}
                        placeholder="Ingrese el nuevo valor medido"
                        className="mt-2"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Campo de observaciones unificado */}
              <div>
                <Label htmlFor="obs" className={reportarDiscrepancia ? 'text-sm font-semibold' : ''}>
                  {reportarDiscrepancia ? 'Nota sobre la corrección *' : 'Observaciones (opcional)'}
                </Label>
                <Textarea
                  id="obs"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={reportarDiscrepancia ? 3 : 2}
                  placeholder={reportarDiscrepancia ? 'Describe por qué el valor anterior fue incorrecto y cualquier acción correctiva tomada...' : 'Ingrese observaciones si es necesario'}
                  className={`mt-1 ${reportarDiscrepancia ? 'bg-blue-50 border-blue-200' : ''}`}
                  required={reportarDiscrepancia}
                />
                {reportarDiscrepancia && (
                  <p className="text-xs text-blue-700 mt-2">Esta nota quedará registrada en la muestra para auditoría.</p>
                )}
              </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMsg && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { onOpenChange(false); fullReset(); }} disabled={loading}>
              Cerrar
            </Button>
            {processedIds.size + 1 < totalMuestras && !rejectOnlyMode && (
              <Button variant="ghost" onClick={handleSkip} disabled={loading} title="Saltar a la siguiente muestra">
                <SkipForward className="w-4 h-4 mr-1" />
                Omitir
              </Button>
            )}
          </div>
          {/* En Validación con discrepancia reportada o en modo rechazo obligatorio */}
          {rejectOnlyMode && !reportarDiscrepancia ? (
            <Button
              variant="destructive"
              onClick={handleRejectSample}
              disabled={loading || !tareaInfo}
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rechazar y Enviar a Cancelados
            </Button>
          ) : (
            <Button
              onClick={handleGuardar}
              disabled={loading || !tareaInfo || valorMedido === '' || (reportarDiscrepancia && (!observaciones || !nuevoValor))}
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              {loading ? 'Guardando...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {reportarDiscrepancia ? 'Guardar Corrección' : 'Guardar Resultado'} {processedIds.size + 1 < totalMuestras ? 'y Siguiente' : ''}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    {/* Dialog de confirmación para rechazar muestra */}
    <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Rechazar Muestra
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <div className="text-sm text-red-800">
              <strong>Muestra:</strong> {tareaInfo?.numero_muestra}<br/>
              <strong>Análisis:</strong> {tareaInfo?.nombre_analisis}<br/>
              <strong>Valor:</strong> {valorMedido} {tareaInfo?.unidad_medida}<br/>
              <strong>Motivo:</strong> Fuera de límites normativos
            </div>
          </div>
          
          <div>
            <Label htmlFor="reject-notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="reject-notes"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Observaciones sobre el rechazo..."
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div className="text-xs text-gray-600">
            {isQCStep(currentStepName)
              ? 'La muestra pasará a Validación de Resultados para verificación. La OT permanecerá activa.'
              : 'La muestra será rechazada y la OT pasará a Cancelados. Se ofrecerá generar una nueva OT.'}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowRejectDialog(false)}
            disabled={rejectLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirmReject}
            disabled={rejectLoading}
          >
            {rejectLoading ? 'Rechazando...' : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Confirmar Rechazo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default ResultadoCapturaModal;
