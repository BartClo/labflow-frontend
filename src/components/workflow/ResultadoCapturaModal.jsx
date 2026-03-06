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
  const [validacionEstado, setValidacionEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const codigoRef = useRef(null);
  const valorRef = useRef(null);

  // Filter out already-completed tasks so the operator only sees pending ones
  const pendingMuestras = useMemo(() => {
    return muestrasOT.filter(m => {
      const estado = (m.estado_analisis || m.estadoAnalisis || '').toUpperCase();
      return estado !== 'COMPLETADO' && estado !== 'VALIDADO';
    });
  }, [muestrasOT]);

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
      resetFormFields();
      // Auto-select first pending sample
      if (pendingMuestras.length > 0) {
        autoSelectMuestra(pendingMuestras[0]);
      }
    } else {
      fullReset();
    }
  }, [open]);

  // When currentIndex changes, auto-select the new sample
  useEffect(() => {
    if (open && currentMuestra) {
      resetFormFields();
      autoSelectMuestra(currentMuestra);
    }
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
  };

  const fullReset = () => {
    resetFormFields();
    setCurrentIndex(0);
    setSavedCount(0);
    setShowRejectDialog(false);
    setRejectNotes('');
    setRejectLoading(false);
  };

  const autoSelectMuestra = (muestra) => {
    if (!muestra) return;
    console.warn('[DEBUG] Muestra seleccionada:', JSON.stringify(muestra, null, 2));
    const barcode = muestra.codigo_barras || muestra.codigoBarras || '';
    setCodigoBarras(barcode);
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
    const idx = pendingMuestras.findIndex(
      m => (m.id_muestra_analisis || m.idMuestraAnalisis) === muestraId
    );
    if (idx >= 0) {
      setCurrentIndex(idx);
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
      autoSelectMuestra(matchedSample);
      const idx = pendingMuestras.findIndex(
        m => (m.id_muestra_analisis || m.idMuestraAnalisis) === (matchedSample.id_muestra_analisis || matchedSample.idMuestraAnalisis)
      );
      if (idx >= 0) setCurrentIndex(idx);
      setLoading(false);
      return;
    }

    setError('El código no corresponde a ninguna muestra de esta OT');
    setTareaInfo(null);
    setLoading(false);
  };

  // Traffic-light: validate value against limits
  useEffect(() => {
    if (!tareaInfo || valorMedido === '') {
      setValidacionEstado(null);
      return;
    }
    const valor = parseFloat(valorMedido);
    if (Number.isNaN(valor)) { setValidacionEstado(null); return; }

    const limiteMin = tareaInfo.limite_minimo ?? null;
    const limiteMax = tareaInfo.limite_maximo ?? null;

    if (limiteMin !== null && limiteMax !== null) {
      const min = parseFloat(limiteMin);
      const max = parseFloat(limiteMax);
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        setValidacionEstado(valor >= min && valor <= max ? 'valido' : 'invalido');
        return;
      }
    }
    if (limiteMax !== null) {
      const max = parseFloat(limiteMax);
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
      // Calculate cumple_normativa based on validation state or limits
      let cumpleNormativa = null;
      if (validacionEstado === 'valido') {
        cumpleNormativa = true;
      } else if (validacionEstado === 'invalido') {
        cumpleNormativa = false;
      } else {
        // If no explicit validation state, check against limits if available
        const valor = parseFloat(valorMedido);
        const min = parseFloat(tareaInfo?.limite_minimo);
        const max = parseFloat(tareaInfo?.limite_maximo);
        if (!isNaN(valor)) {
          if (!isNaN(min) && !isNaN(max)) {
            cumpleNormativa = valor >= min && valor <= max;
          } else if (!isNaN(max)) {
            cumpleNormativa = valor <= max;
          } else if (!isNaN(min)) {
            cumpleNormativa = valor >= min;
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
            valor_medido: parseFloat(valorMedido),
            cumple_normativa: cumpleNormativa,
            observaciones: observaciones || null,
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
        });
      } catch (fallbackErr) {
        // Non-critical: the primary updateResult already succeeded
        console.warn('[DEBUG] guardarResultado fallback failed (non-critical):', fallbackErr?.response?.data || fallbackErr.message);
      }

      const newSavedCount = savedCount + 1;
      setSavedCount(newSavedCount);

      // Determine if this is a QC failure (Control de Calidad step + value out of range)
      const qcFailed = isQCStep(currentStepName) && validacionEstado === 'invalido';

      if (qcFailed) {
        // QC failed — notify parent so it advances workflow but marks step as fallido
        onResultadoGuardado && onResultadoGuardado({ ...saved, qc_failed: true });
        setSuccessMsg(null);
        // Close modal — parent will advance to Validación de Resultados
        setTimeout(() => {
          onOpenChange(false);
          fullReset();
        }, 300);
        return;
      }

      onResultadoGuardado && onResultadoGuardado(saved);

      const nextIndex = currentIndex + 1;
      if (nextIndex < totalMuestras) {
        setSuccessMsg(`✓ Resultado guardado (${newSavedCount}/${totalMuestras}). Avanzando...`);
        setTimeout(() => {
          setCurrentIndex(nextIndex);
          setSuccessMsg(null);
        }, 800);
      } else {
        setSuccessMsg(`✓ ¡Todos los resultados guardados! (${newSavedCount} muestras procesadas)`);
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
    if (currentIndex + 1 < totalMuestras) setCurrentIndex(currentIndex + 1);
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

      // 1. Guardar resultado con cumple_normativa=false si hay valor medido
      if (valorMedido !== '') {
        const parametroKey = tareaInfo.nombre_parametro || tareaInfo.nombre_analisis;
        const payload = {
          parametros: {
            [parametroKey]: {
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
        setSuccessMsg(`✓ Control de calidad fallido — avanzando a Validación de Resultados`);
        setShowRejectDialog(false);
        setRejectNotes('');

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

      // Check remaining pending samples
      const remainingAfterReject = pendingMuestras.filter(
        m => (m.id_muestra_analisis || m.idMuestraAnalisis) !== tareaInfo.id_muestra_analisis
      );

      // Cancel the OT (all samples rejected or this is the final rejection in validation)
      if (remainingAfterReject.length === 0) {
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
        ot_cancelled: remainingAfterReject.length === 0,
        rejected_tasks: rejectedTaskIds,
        rejected_muestras: rejectedMuestras,
      });

      // Advance to next sample or close
      setTimeout(() => {
        if (remainingAfterReject.length > 0) {
          const nextIdx = Math.min(currentIndex, remainingAfterReject.length - 1);
          setCurrentIndex(nextIdx);
          setSuccessMsg(null);
          resetFormFields();
          autoSelectMuestra(remainingAfterReject[nextIdx]);
        } else {
          setSuccessMsg('✓ Muestras rechazadas — OT enviada a Cancelados');
          setTimeout(() => {
            onOpenChange(false);
            fullReset();
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
    const normativa = tareaInfo.normativa || tareaInfo.norma || 'NCh 409/1';

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <div className="font-semibold text-blue-800 mb-2 flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          Parámetros a Medir
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">•</span>
            <span>{normativa}</span>
          </div>
          {unidad && (
            <div>
              <span className="text-gray-500">Unidad:</span> <span className="font-medium">{unidad}</span>
            </div>
          )}
          {min !== null && (
            <div>
              <span className="text-gray-500">Lím. Detección:</span> <span className="font-medium">{min}</span>
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
      <DialogContent className="max-w-2xl">
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
                    return (
                      <SelectItem key={id} value={id}>
                        <div className="flex items-center gap-2">
                          <FlaskConical className="w-3 h-3 text-blue-500" />
                          <span className="font-medium">{numero}</span>
                          {analisis && <span className="text-gray-500 text-xs">— {analisis}</span>}
                          {barcode && <span className="text-gray-400 text-xs ml-1">[{barcode}]</span>}
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

              <div>
                <Label htmlFor="obs">Observaciones (opcional)</Label>
                <Textarea
                  id="obs"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>

              {/* Botón de rechazo siempre visible cuando hay muestra seleccionada */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRejectSample}
                className="w-full"
                disabled={loading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar Muestra
              </Button>
            </div>
          )}

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

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { onOpenChange(false); fullReset(); }} disabled={loading}>
              Cerrar
            </Button>
            {currentIndex + 1 < totalMuestras && !rejectOnlyMode && (
              <Button variant="ghost" onClick={handleSkip} disabled={loading} title="Saltar a la siguiente muestra">
                <SkipForward className="w-4 h-4 mr-1" />
                Omitir
              </Button>
            )}
          </div>
          {/* In reject-only mode (Validación + QC failed + still invalid), only show reject button */}
          {rejectOnlyMode ? (
            <Button
              variant="destructive"
              onClick={handleRejectSample}
              disabled={loading || !tareaInfo}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rechazar y Enviar a Cancelados
            </Button>
          ) : (
            <Button
              onClick={handleGuardar}
              disabled={loading || !tareaInfo || valorMedido === ''}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Guardando...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar {currentIndex + 1 < totalMuestras ? 'y Siguiente' : ''}
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
