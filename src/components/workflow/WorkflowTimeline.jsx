import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  CheckCircle2,
  Clock,
  Play,
  Circle,
  AlertCircle,
  XCircle,
  FlaskConical,
  Plus,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ResultadoCapturaModal from './ResultadoCapturaModal';
import workOrdersService from '@/api/services/workOrders';
import { WorkOrder } from '@/api/entities';

// Normalise step name for comparison (strip accents, lowercase)
const normalizeStepName = (name) =>
  (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const isQCStepName = (stepName) => {
  const n = normalizeStepName(stepName);
  return n.includes('control de calidad') || n === 'calidad';
};

const statusConfig = {
  pendiente: { 
    color: "bg-gray-200",
    textColor: "text-gray-600",
    icon: Clock,
    label: "Pendiente"
  },
  en_progreso: { 
    color: "bg-blue-500",
    textColor: "text-blue-600",
    icon: Play,
    label: "En Progreso"
  },
  completado: { 
    color: "bg-green-500",
    textColor: "text-green-600",
    icon: CheckCircle2,
    label: "Completado"
  },
  pausado: { 
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    icon: AlertCircle,
    label: "Pausado"
  },
  fallido: { 
    color: "bg-red-500",
    textColor: "text-red-600",
    icon: XCircle,
    label: "Fallido"
  }
};

export default function WorkflowTimeline({ 
  workflowSteps, 
  workOrder, 
  onStepClick, 
  onStatusUpdate, 
  isLoading 
}) {
  const [showCapturaModal, setShowCapturaModal] = useState(false);
  const [currentStepForModal, setCurrentStepForModal] = useState(null);
  const [showGenerateOTDialog, setShowGenerateOTDialog] = useState(false);
  const [rejectedMuestrasForOT, setRejectedMuestrasForOT] = useState([]);
  const [rejectedTaskIdsForOT, setRejectedTaskIdsForOT] = useState([]);
  const [generatingOT, setGeneratingOT] = useState(false);
  // Local React state so QC failure immediately causes re-render
  const [localQCFailed, setLocalQCFailed] = useState(false);

  // Sync localQCFailed from localStorage whenever workOrder changes (e.g. on initial load or refresh)
  useEffect(() => {
    const oid = workOrder?.id || workOrder?.idOrdenTrabajo;
    if (oid && workOrdersService.isQCFailed(oid)) {
      setLocalQCFailed(true);
    }
  }, [workOrder]);
  if (isLoading) {
    return (
      <Card className="h-[calc(100vh-180px)]">
        <CardHeader>
          <CardTitle>Flujo de Trabajo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex items-center justify-between px-4 w-full">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedSteps = workflowSteps.filter(step => step.status === 'completado').length;
  const totalSteps = workflowSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="border-0 shadow-lg h-[calc(100vh-180px)] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Flujo de Trabajo</CardTitle>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-2xl text-blue-600">{completedSteps}</span> de {totalSteps} pasos completados
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        {/* Stepper horizontal */}
        <div className="relative w-full py-16">
          {/* Línea de fondo */}
          <div className="absolute top-[80px] left-0 right-0 h-2 bg-gray-200 mx-[64px]" />
          
          {/* Línea de progreso */}
          <div 
            className="absolute top-[80px] left-[64px] h-2 bg-blue-500 transition-all duration-500 rounded-full"
            style={{ 
              width: `calc(${progressPercentage}% - 64px)` 
            }}
          />
          
          {/* Pasos */}
          <div className="relative flex justify-between items-start">
            {workflowSteps.map((step, index) => {
              const otId = workOrder?.id || workOrder?.idOrdenTrabajo;
              // Combine React state (set immediately on rejection) with localStorage fallback
              const qcFailed = localQCFailed || (otId && workOrdersService.isQCFailed(otId));
              const otCancelled = workOrder?.status === 'cancelada';

              // Override display for QC step when QC has failed
              let effectiveStatus = step.status;
              if (qcFailed && isQCStepName(step.step_name) && step.status === 'completado') {
                effectiveStatus = 'fallido';
              }
              // Override display for Validación step when OT was cancelled (rejected)
              const stepNorm = normalizeStepName(step.step_name);
              const isValidacion = stepNorm.includes('validacion') || stepNorm.includes('validar resultado');
              if (otCancelled && isValidacion && step.status === 'completado') {
                effectiveStatus = 'fallido';
              }

              const config = statusConfig[effectiveStatus] || statusConfig.pendiente;
              const StatusIcon = config.icon;
              const isCompleted = effectiveStatus === 'completado';
              const isFallido = effectiveStatus === 'fallido';
              const isInProgress = step.status === 'en_progreso';
              const isClickable = step.status !== 'pendiente';
              
              return (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center gap-4 flex-1"
                  style={{ maxWidth: `${100 / workflowSteps.length}%` }}
                >
                  {/* Círculo con ícono - más grande */}
                  <button
                    onClick={() => isClickable && onStepClick && onStepClick(step)}
                    disabled={!isClickable}
                    className={`
                      relative z-10 w-20 h-20 rounded-full flex items-center justify-center
                      transition-all duration-300 border-4 border-white shadow-xl
                      ${isCompleted ? 'bg-green-500' : ''}
                      ${isFallido ? 'bg-red-500' : ''}
                      ${isInProgress ? 'bg-blue-500 animate-pulse' : ''}
                      ${step.status === 'pendiente' ? 'bg-gray-200' : ''}
                      ${step.status === 'pausado' ? 'bg-yellow-500' : ''}
                      ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                    `}
                  >
                    <StatusIcon className={`w-10 h-10 ${
                      isCompleted || isInProgress || isFallido ? 'text-white' : 'text-gray-400'
                    }`} />
                  </button>
                  
                  {/* Información del paso - más grande */}
                  <div className="text-center space-y-2 px-2">
                    <p className={`font-semibold text-base ${
                      isFallido ? 'text-red-700' :
                      isCompleted || isInProgress ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.step_name}
                    </p>

                    {/* Show failure label */}
                    {isFallido && (
                      <p className="text-sm font-bold text-red-600">
                        {isQCStepName(step.step_name) ? 'Control de calidad fallido' : 'Rechazada'}
                      </p>
                    )}
                    
                    {step.assigned_to && (
                      <p className="text-sm text-gray-600">
                        {step.assigned_to}
                      </p>
                    )}
                    
                    {step.completed_at && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(step.completed_at), 'dd/MM HH:mm', { locale: es })}
                      </p>
                    )}
                    
                    {step.status === 'en_progreso' && !step.completed_at && step.started_at && (
                      <p className="text-sm text-blue-600 font-medium">
                        Desde {format(new Date(step.started_at), 'HH:mm', { locale: es })}
                      </p>
                    )}
                    
                    {/* Badge de estado */}
                    <Badge className={`${
                      isFallido ? 'bg-red-100 text-red-800' :
                      isCompleted ? 'bg-green-100 text-green-800' :
                      isInProgress ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    } text-xs px-2 py-1`}>
                      {config.label}
                    </Badge>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="mt-2">
                    {isInProgress && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open capture modal for last step OR for any quality-control/validation step
                          const isLast = index === workflowSteps.length - 1;
                          const stepNameNorm = (step.step_name || '')
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '');
                          const needsCaptura =
                            isLast ||
                            stepNameNorm.includes('control de calidad') ||
                            stepNameNorm.includes('calidad') ||
                            stepNameNorm.includes('validacion') ||
                            stepNameNorm.includes('validar resultado');
                          if (needsCaptura) {
                            setCurrentStepForModal(step);
                            setShowCapturaModal(true);
                            return;
                          }
                          onStatusUpdate && onStatusUpdate(step.id, 'completado');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completar
                      </Button>
                    )}
                    
                    {step.status === 'pendiente' && index === workflowSteps.findIndex(s => s.status === 'pendiente') && !workflowSteps.some(s => s.status === 'en_progreso') && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate && onStatusUpdate(step.id, 'en_progreso');
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      {/* Modal de captura para Control de Calidad y Validación de Resultados */}
      <ResultadoCapturaModal
        open={showCapturaModal}
        onOpenChange={(v) => { setShowCapturaModal(v); if (!v) setCurrentStepForModal(null); }}
        ordenTrabajoId={workOrder?.id || workOrder?.idOrdenTrabajo}
        muestrasOT={workOrder?.tasks || []}
        currentStepName={currentStepForModal?.step_name || ''}
        onResultadoGuardado={(result) => {
          // --- QC rejection: mark QC as failed, advance step, OT stays active ---
          if (result?.qc_failed) {
            const otId = workOrder?.id || workOrder?.idOrdenTrabajo;
            if (otId) workOrdersService.setQCFailed(otId);
            setLocalQCFailed(true); // force immediate re-render
            if (currentStepForModal) {
              onStatusUpdate && onStatusUpdate(currentStepForModal.id, 'completado');
            }
            setShowCapturaModal(false);
            setCurrentStepForModal(null);
            return;
          }

          // --- Validación rejection: cancel OT, offer to generate new OT ---
          if (result?.validation_rejected) {
            if (currentStepForModal) {
              onStatusUpdate && onStatusUpdate(currentStepForModal.id, 'completado');
            }
            setShowCapturaModal(false);
            setCurrentStepForModal(null);
            setRejectedMuestrasForOT(result.rejected_muestras || []);
            setRejectedTaskIdsForOT(result.rejected_tasks || []);
            setTimeout(() => {
              setShowGenerateOTDialog(true);
              onStatusUpdate && onStatusUpdate(null, 'cancelado');
            }, 500);
            return;
          }

          // --- OT fully cancelled (non-validation path) ---
          if (result?.ot_cancelled) {
            if (currentStepForModal) {
              onStatusUpdate && onStatusUpdate(currentStepForModal.id, 'completado');
            }
            setShowCapturaModal(false);
            setCurrentStepForModal(null);
            setTimeout(() => {
              onStatusUpdate && onStatusUpdate(null, 'cancelado');
            }, 500);
            return;
          }

          // --- Normal rejected but not cancelled ---
          if (result?.action === 'rejected') {
            if (currentStepForModal) {
              onStatusUpdate && onStatusUpdate(currentStepForModal.id, 'completado');
            }
            setShowCapturaModal(false);
            setCurrentStepForModal(null);
            return;
          }

          // --- Normal completion ---
          if (currentStepForModal) {
            const otId = workOrder?.id || workOrder?.idOrdenTrabajo;
            if (otId && workOrdersService.isQCFailed(otId)) {
              const stepNorm = normalizeStepName(currentStepForModal.step_name);
              if (stepNorm.includes('validacion') || stepNorm.includes('validar resultado')) {
                workOrdersService.clearQCFailure(otId);
                setLocalQCFailed(false); // clear local state too
              }
            }
            onStatusUpdate && onStatusUpdate(currentStepForModal.id, 'completado');
          }
          setShowCapturaModal(false);
          setCurrentStepForModal(null);
        }}
      />

      {/* Dialog para generar nueva OT con muestras rechazadas */}
      <Dialog open={showGenerateOTDialog} onOpenChange={setShowGenerateOTDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Muestras Rechazadas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-2">
                Las siguientes muestras fueron rechazadas en Validación de Resultados:
              </p>
              <div className="space-y-1">
                {rejectedMuestrasForOT.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                    <FlaskConical className="w-3 h-3" />
                    <span className="font-medium">{m.numero}</span>
                    {m.analisis && <span className="text-red-500">— {m.analisis}</span>}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              ¿Desea generar una nueva Orden de Trabajo para reprocesar estas muestras?
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowGenerateOTDialog(false);
                setRejectedMuestrasForOT([]);
                setRejectedTaskIdsForOT([]);
              }}
              disabled={generatingOT}
            >
              No, solo cancelar
            </Button>
            <Button
              onClick={async () => {
                setGeneratingOT(true);
                try {
                  const otId = workOrder?.id || workOrder?.idOrdenTrabajo;
                  await WorkOrder.crearOTRechazadas(otId, {
                    tecnicoAsignadoId: null,
                    notas: `Reprocesamiento de muestras rechazadas: ${rejectedMuestrasForOT.map(m => m.numero).join(', ')}`,
                    tareaIds: rejectedTaskIdsForOT,
                  });
                  setShowGenerateOTDialog(false);
                  setRejectedMuestrasForOT([]);
                  setRejectedTaskIdsForOT([]);
                  onStatusUpdate && onStatusUpdate(null, 'cancelado');
                } catch (err) {
                  console.warn('Error al crear OT de retrabajo:', err?.response?.data?.message || err?.message);
                  setShowGenerateOTDialog(false);
                  setRejectedMuestrasForOT([]);
                  setRejectedTaskIdsForOT([]);
                } finally {
                  setGeneratingOT(false);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={generatingOT}
            >
              {generatingOT ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generar Nueva OT
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}