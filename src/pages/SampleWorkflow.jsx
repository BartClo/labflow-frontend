
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Sample, WorkOrder, WorkflowStep } from "@/api/entities";
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
  const [sample, setSample] = useState(null);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showOTInfo, setShowOTInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Genera pasos de workflow por defecto basados en las tareas de la OT
  const generateDefaultWorkflowSteps = (order) => {
    const tareas = order.tareas || [];
    const now = new Date();
    
    // Pasos estándar para cualquier OT
    const defaultSteps = [
      {
        id: `step-${order.id}-1`,
        step_type: "recepcion",
        step_name: "Registro de Recepción",
        status: "completado",
        assigned_to: order.tecnico_asignado?.nombre_completo || "Técnico asignado",
        started_at: order.created_date,
        completed_at: order.created_date,
        order: 1
      },
      {
        id: `step-${order.id}-2`,
        step_type: "preparacion_muestra",
        step_name: "Preparación de Muestra",
        status: "pendiente",
        assigned_to: order.tecnico_asignado?.nombre_completo || "Técnico asignado",
        order: 2
      }
    ];

    // Agregar un paso por cada análisis/tarea en la OT
    tareas.forEach((tarea, index) => {
      defaultSteps.push({
        id: `step-${order.id}-analysis-${index}`,
        step_type: "ejecucion_analisis",
        step_name: `Análisis: ${tarea.nombre_analisis || 'Análisis'}`,
        status: "pendiente",
        assigned_to: order.tecnico_asignado?.nombre_completo || "Técnico asignado",
        method_used: tarea.nombre_analisis,
        order: 3 + index
      });
    });

    // Pasos finales
    const finalSteps = [
      {
        id: `step-${order.id}-qc`,
        step_type: "control_calidad",
        step_name: "Control de Calidad",
        status: "pendiente",
        requires_approval: true,
        order: defaultSteps.length + 1
      },
      {
        id: `step-${order.id}-final`,
        step_type: "aprobacion_final",
        step_name: "Validación de Resultados",
        status: "pendiente",
        requires_approval: true,
        order: defaultSteps.length + 2
      }
    ];

    return [...defaultSteps, ...finalSteps];
  };

  // Genera historial de actividad basado en los pasos del workflow
  const generateActivityHistory = (steps, order) => {
    const activities = [];
    
    // Actividad de creación de OT
    activities.push({
      id: `activity-created`,
      type: 'created',
      step_name: 'Orden de Trabajo Creada',
      timestamp: order.created_date,
      user: order.tecnico_asignado?.nombre_completo || 'Sistema'
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
      // Obtener la orden de trabajo por ID
      const order = await WorkOrder.getById(otId);
      console.log('📋 Orden de trabajo cargada:', order);
      setWorkOrder(order);
      
      if (order) {
        // Cargar la muestra asociada a través de las tareas de la OT
        if (order.tareas && order.tareas.length > 0) {
          const firstTask = order.tareas[0];
          if (firstTask.numero_muestra) {
            try {
              const sampleData = await Sample.getAll();
              const sampleRecord = sampleData.find(s => 
                s.sample_number === firstTask.numero_muestra || 
                s.internal_number === firstTask.numero_muestra
              );
              setSample(sampleRecord);
            } catch (sampleError) {
              console.warn('No se pudo cargar la muestra:', sampleError);
            }
          }
        }
        
        // Intentar cargar pasos del workflow desde el backend
        let stepsData = [];
        try {
          stepsData = await WorkflowStep.getStepsByWorkOrderId(otId);
        } catch (stepsError) {
          console.warn('No se pudieron cargar los pasos del workflow desde backend:', stepsError);
        }

        // Si no hay pasos, generar pasos por defecto
        if (!stepsData || stepsData.length === 0) {
          console.log('📝 Generando pasos de workflow por defecto...');
          stepsData = generateDefaultWorkflowSteps(order);
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

  const updateStepStatus = async (stepId, newStatus, additionalData = {}) => {
    try {
      const updateData = {
        status: newStatus,
        ...additionalData
      };
      
      if (newStatus === 'en_progreso' && !additionalData.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      
      if (newStatus === 'completado' && !additionalData.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      // Intentar actualizar en backend
      try {
        await WorkflowStep.update(stepId, updateData);
      } catch (backendError) {
        console.warn('Backend update failed, updating locally:', backendError);
      }
      
      // Actualizar localmente
      setWorkflowSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === stepId 
            ? { ...step, ...updateData }
            : step
        )
      );

      // Actualizar historial de actividad
      const updatedSteps = workflowSteps.map(step => 
        step.id === stepId ? { ...step, ...updateData } : step
      );
      const history = generateActivityHistory(updatedSteps, workOrder);
      setActivityHistory(history);
      
    } catch (error) {
      console.error("Error updating step:", error);
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
          sample={sample}
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
          sample={sample}
          onClose={() => setShowOTInfo(false)}
        />
      )}
    </div>
  );
}
