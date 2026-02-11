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
const ResultadoCapturaModal = ({ open, onOpenChange, ordenTrabajoId, muestrasOT = [], onResultadoGuardado }) => {
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
    const barcode = muestra.codigo_barras || muestra.codigoBarras || '';
    setCodigoBarras(barcode);
    setTareaInfo({
      id_muestra_analisis: muestra.id_muestra_analisis || muestra.idMuestraAnalisis,
      id_muestra: muestra.id_muestra || muestra.idMuestra || null,
      numero_muestra: muestra.numero_muestra || muestra.numeroMuestra || '',
      codigo_barras: barcode,
      nombre_analisis: muestra.nombre_analisis || muestra.nombreAnalisis || '',
      nombre_parametro: muestra.nombre_parametro || muestra.nombreParametro || '',
      unidad_medida: muestra.unidad_medida || muestra.unidadMedida || null,
      limite_minimo: muestra.limite_minimo || muestra.limiteMinimo || null,
      limite_maximo: muestra.limite_maximo || muestra.limiteMaximo || null,
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
    const matchedSample = allMuestras.find(m => {
      const sampleBarcode = (m.codigo_barras || m.codigoBarras || '').toString().trim().toUpperCase();
      return sampleBarcode && sampleBarcode === inputBarcode;
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

    setError('El código de barras no corresponde a ninguna muestra de esta OT');
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
      const payload = {
        id_muestra_analisis: tareaInfo.id_muestra_analisis ?? tareaInfo.idMuestraAnalisis,
        codigo_barras: codigoBarras,
        valor_medido: valorMedido,
        observaciones: observaciones || null,
      };
      const saved = await tasksService.guardarResultado(payload);
      const newSavedCount = savedCount + 1;
      setSavedCount(newSavedCount);
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
      setError(err?.response?.data?.mensaje || err?.response?.data?.message || 'Error al guardar el resultado');
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
      // Crear OT rechazada — el backend marca la tarea como rechazada y crea nueva OT
      await WorkOrder.crearOTRechazadas(ordenTrabajoId, {
        tecnicoAsignadoId: null,
        notas: rejectNotes || `Muestra ${tareaInfo.numero_muestra} rechazada por valor fuera de normativa: ${valorMedido}`,
        tareaIds: [tareaInfo.id_muestra_analisis]
      });
      
      setSuccessMsg(`✓ Muestra ${tareaInfo.numero_muestra} rechazada y enviada a nueva OT`);
      setShowRejectDialog(false);
      setRejectNotes('');
      
      onResultadoGuardado && onResultadoGuardado({
        action: 'rejected',
        tarea_id: tareaInfo.id_muestra_analisis,
        numero_muestra: tareaInfo.numero_muestra
      });

      // Avanzar a la siguiente muestra después de 1.5 segundos
      // Nota: pendingMuestras se recalcula al cambiar muestrasOT,
      // pero podría no haberse actualizado aún, así que verificamos manualmente
      const remainingAfterReject = pendingMuestras.filter(
        m => (m.id_muestra_analisis || m.idMuestraAnalisis) !== tareaInfo.id_muestra_analisis
      );
      
      setTimeout(() => {
        if (remainingAfterReject.length > 0) {
          // Hay más muestras — mantener abierto y avanzar
          const nextIdx = Math.min(currentIndex, remainingAfterReject.length - 1);
          setCurrentIndex(nextIdx);
          setSuccessMsg(null);
          resetFormFields();
          autoSelectMuestra(remainingAfterReject[nextIdx]);
        } else {
          // Todas las muestras procesadas
          setSuccessMsg('✓ Todas las muestras han sido procesadas');
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
    const min = tareaInfo.limite_minimo ?? null;
    const max = tareaInfo.limite_maximo ?? null;
    const parametro = tareaInfo.nombre_parametro || '';

    if (!unidad && min === null && max === null) return null;

    return (
      <div className="bg-slate-50 border rounded p-3 text-sm space-y-1">
        {parametro && (
          <div className="flex justify-between">
            <span className="text-gray-600">Parámetro:</span>
            <strong>{parametro}</strong>
          </div>
        )}
        {unidad && (
          <div className="flex justify-between">
            <span className="text-gray-600">Unidad:</span>
            <strong>{unidad}</strong>
          </div>
        )}
        {min !== null && max !== null && (
          <div className="flex justify-between">
            <span className="text-gray-600">Rango normativa:</span>
            <strong>{min} – {max} {unidad}</strong>
          </div>
        )}
        {min === null && max !== null && (
          <div className="flex justify-between">
            <span className="text-gray-600">Máximo normativa:</span>
            <strong>≤ {max} {unidad}</strong>
          </div>
        )}
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
      <div className="flex items-center gap-2 p-2 rounded bg-red-50 text-red-700">
        <AlertTriangle className="w-4 h-4" />
        ALERTA: Valor fuera de norma
      </div>
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
              Capturar Resultado
            </DialogTitle>
            {totalMuestras > 0 && (
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Muestra {Math.min(currentIndex + 1, totalMuestras)} de {totalMuestras}
              </span>
            )}
          </div>
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
            {currentIndex + 1 < totalMuestras && (
              <Button variant="ghost" onClick={handleSkip} disabled={loading} title="Saltar a la siguiente muestra">
                <SkipForward className="w-4 h-4 mr-1" />
                Omitir
              </Button>
            )}
          </div>
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
            La muestra será enviada a una nueva OT de rechazadas para su reprocesamiento.
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
