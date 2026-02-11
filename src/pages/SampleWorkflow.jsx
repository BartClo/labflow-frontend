
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { WorkOrder, WorkflowStep } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock,
  User,
  Calendar,
  Activity,
  Eye,
  Edit,
  Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import WorkflowTimeline from "../components/workflow/WorkflowTimeline";
import WorkflowStepModal from "../components/workflow/WorkflowStepModal";
import ActivityHistoryModal from "../components/workflow/ActivityHistoryModal";
import WorkOrderInfoModal from "../components/workflow/WorkOrderInfoModal";

export default function SampleWorkflowPage() {
  const [searchParams] = useSearchParams();
  const otId = searchParams.get('otId');
  
  const [workOrder, setWorkOrder] = useState(null);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [workflowProgress, setWorkflowProgress] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showOTInfo, setShowOTInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Genera historial de actividad basado en los pasos del workflow
  const generateActivityHistory = (steps, order) => {
    const activities = [];
    
    // Actividad de creación de OT
    activities.push({
      id: `activity-created`,
      type: 'created',
      step_name: 'Orden de Trabajo Creada',
      timestamp: order.created_date,
      user: order.assigned_technician || 'Sistema'
    });

    // Generar actividades por cada paso
    steps.forEach(step => {
      if (step.started_at) {
        activities.push({
          id: `activity-${step.id}-started`,
          type: 'started',
          step_name: step.step_name,
          timestamp: step.started_at,
          user: step.assigned_to || 'Sin asignar'
        });
      }
      if (step.completed_at) {
        activities.push({
          id: `activity-${step.id}-completed`,
          type: 'completed',
          step_name: step.step_name,
          timestamp: step.completed_at,
          user: step.assigned_to || 'Sin asignar'
        });
      }
    });

    // Ordenar por fecha
    return activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const loadWorkflowData = useCallback(async () => {
    if (!otId) return;
    setIsLoading(true);
    try {
      // 1. Obtener la orden de trabajo por ID (incluye tareas con barcodes)
      const order = await WorkOrder.getById(otId);
      console.log('📋 Orden de trabajo cargada:', order);
      setWorkOrder(order);
      
      if (order) {
        // 2. Obtener workflow real del backend
        let stepsData = [];
        try {
          const { steps, progress } = await WorkflowStep.getWorkflowByOrderId(otId);
          stepsData = steps;
          setWorkflowProgress(progress);
          console.log('✅ Workflow cargado desde backend:', steps.length, 'etapas');
        } catch (workflowError) {
          console.warn('No se pudo cargar el workflow desde backend:', workflowError);
          stepsData = [];
        }
        
        setWorkflowSteps(stepsData);
        
        // Generar historial de actividad
        const history = generateActivityHistory(stepsData, order);
        setActivityHistory(history);
      }
    } catch (error) {
      console.error("Error loading workflow data:", error);
      setWorkOrder(null);
    }
    setIsLoading(false);
  }, [otId]);

  useEffect(() => {
    loadWorkflowData();
  }, [loadWorkflowData]);

  /**
   * Completes the current active workflow stage via the real backend endpoint.
   * The backend handles advancing to the next stage automatically.
   */
  const advanceWorkflowStage = async (notas = null) => {
    if (!otId) return;
    try {
      const { steps, progress } = await WorkflowStep.completarEtapa(otId, notas);
      setWorkflowSteps(steps);
      setWorkflowProgress(progress);
      
      // Refresh order to get updated status
      const updatedOrder = await WorkOrder.getById(otId);
      setWorkOrder(updatedOrder);
      
      const history = generateActivityHistory(steps, updatedOrder);
      setActivityHistory(history);
      
      console.log('✅ Etapa completada. Progreso:', progress?.porcentaje_completado + '%');
    } catch (error) {
      console.error("Error completing workflow stage:", error);
      alert(error?.response?.data?.message || error?.response?.data?.error || 'Error al completar la etapa');
    }
  };

  /**
   * Legacy updateStepStatus — maps to advanceWorkflowStage.
   * The backend does not support updating individual steps by ID;
   * it always completes the current active step and advances.
   */
  const updateStepStatus = async (stepId, newStatus, additionalData = {}) => {
    if (newStatus === 'completado') {
      await advanceWorkflowStage(additionalData.notas || null);
    } else if (newStatus === 'en_progreso') {
      // Backend auto-starts the next step when the previous one completes.
      // If user clicks "Iniciar" on the first pending step, just advance.
      await advanceWorkflowStage(null);
    }
  };

  if (!otId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">ID de orden de trabajo no proporcionado</h2>
          <Link to={createPageUrl("OTGeneration")}>
            <Button variant="outline">Volver a Órdenes de Trabajo</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-lg text-gray-700">Cargando workflow de la orden de trabajo...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Orden de trabajo no encontrada</h2>
          <p className="text-gray-600 mb-4">No se pudo cargar la información de la OT</p>
          <Link to={createPageUrl("OTGeneration")}>
            <Button variant="outline">Volver a Órdenes de Trabajo</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calcular información del header basada en tareas
  const tareas = workOrder?.tareas || [];
  const sampleNumbers = tareas.map(t => t.numero_muestra).filter(Boolean).join(', ') || workOrder?.sample_numbers || '';
  const analysisNames = [...new Set(tareas.map(t => t.nombre_analisis).filter(Boolean))].join(', ') || workOrder?.test_parameter || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("OTGeneration")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                LIMS - Seguimiento de OT #{workOrder?.ot_number}
              </h1>
              <p className="text-gray-600 mt-1">
                Muestra: {sampleNumbers || 'N/A'} • Análisis: {analysisNames || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              className={`px-3 py-1 ${
                workOrder?.status === 'completada' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {workOrder?.status?.replace(/_/g, ' ')}
            </Badge>
            <Button variant="outline" onClick={() => setShowInsights(true)}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </Button>
            <Button variant="outline" onClick={() => setShowOTInfo(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver OT
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal - solo workflow */}
      <div className="p-6">
        <WorkflowTimeline 
          workflowSteps={workflowSteps}
          workOrder={workOrder}
          onStepClick={setSelectedStep}
          onStatusUpdate={updateStepStatus}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de detalles del paso */}
      {selectedStep && (
        <WorkflowStepModal
          step={selectedStep}
          onClose={() => setSelectedStep(null)}
          onStatusUpdate={updateStepStatus}
        />
      )}

      {/* Modal de Insights (Historial de Actividad) */}
      {showInsights && (
        <ActivityHistoryModal
          workOrderId={otId}
          workflowSteps={workflowSteps}
          onClose={() => setShowInsights(false)}
        />
      )}

      {/* Modal de Información de la OT */}
      {showOTInfo && (
        <WorkOrderInfoModal
          workOrder={workOrder}
          onClose={() => setShowOTInfo(false)}
        />
      )}
    </div>
  );
}
