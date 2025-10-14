
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
  const [selectedStep, setSelectedStep] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showOTInfo, setShowOTInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const createDefaultWorkflowSteps = async (workOrderId, sampleId) => {
    // Determinar tipo de flujo basado en el número interno de la muestra
    // Para visualización: 
    // - Muestras MU-240001, MU-240002 = Flujo CORTO (3 pasos)
    // - Muestras MU-240003, MU-240004 = Flujo MEDIO (5 pasos)
    // - Muestras MU-240005, MU-240006 = Flujo LARGO (8 pasos)
    
    const sampleRecord = await Sample.filter({ id: sampleId });
    const sampleNumber = sampleRecord[0]?.internal_number || '';
    
    let steps = [];
    
    // FLUJO CORTO - 3 pasos (Análisis simples/rápidos)
    if (sampleNumber.includes('240001') || sampleNumber.includes('240002')) {
      console.log(`🔵 Creando FLUJO CORTO (3 pasos) para muestra: ${sampleNumber}`);
      steps = [
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "recepcion",
          step_name: "Registro de Recepción",
          status: "completado",
          assigned_to: "Juan Pérez",
          started_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date(Date.now() - 3000000).toISOString()
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "ejecucion_analisis",
          step_name: "Análisis Rápido",
          status: "en_progreso",
          assigned_to: "Ana Martínez",
          started_at: new Date(Date.now() - 1800000).toISOString(),
          method_used: "Método Express / NCh 409/1",
          equipment_used: ["Espectrofotómetro"]
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "aprobacion_final",
          step_name: "Validación de Resultados",
          status: "pendiente",
          method_used: "Revisión técnica"
        }
      ];
    }
    
    // FLUJO MEDIO - 5 pasos (Análisis estándar - DEFAULT)
    else if (sampleNumber.includes('240003') || sampleNumber.includes('240004') || !sampleNumber) {
      console.log(`🟢 Creando FLUJO MEDIO (5 pasos) para muestra: ${sampleNumber}`);
      steps = [
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "recepcion",
          step_name: "Registro de Recepción",
          status: "completado",
          assigned_to: "Juan Pérez",
          started_at: new Date(Date.now() - 7200000).toISOString(),
          completed_at: new Date(Date.now() - 6600000).toISOString()
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "preparacion_muestra",
          step_name: "Preparación de Muestra",
          status: "completado",
          assigned_to: "Ana Martínez",
          started_at: new Date(Date.now() - 6000000).toISOString(),
          completed_at: new Date(Date.now() - 5400000).toISOString(),
          method_used: "Digestión ácida",
          equipment_used: ["Bloque digestor", "Campana extractora"]
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "preparacion_analisis",
          step_name: "Preparación de Análisis",
          status: "en_progreso",
          assigned_to: "Carlos Silva",
          started_at: new Date(Date.now() - 3600000).toISOString(),
          method_used: "ICP-OES / NCh 409/1",
          equipment_used: ["Espectrómetro ICP"]
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "ejecucion_analisis",
          step_name: "Ejecución de Análisis",
          status: "pendiente",
          method_used: "Filtreadora / MMP-100mL"
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "control_calidad",
          step_name: "Control de Calidad",
          status: "pendiente",
          requires_approval: true
        }
      ];
    }
    
    // FLUJO LARGO - 8 pasos (Análisis complejos/múltiples etapas)
    else if (sampleNumber.includes('240005') || sampleNumber.includes('240006')) {
      console.log(`🟠 Creando FLUJO LARGO (8 pasos) para muestra: ${sampleNumber}`);
      steps = [
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "recepcion",
          step_name: "Registro de Recepción",
          status: "completado",
          assigned_to: "Juan Pérez",
          started_at: new Date(Date.now() - 14400000).toISOString(),
          completed_at: new Date(Date.now() - 13800000).toISOString()
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "preparacion_muestra",
          step_name: "Preparación Inicial",
          status: "completado",
          assigned_to: "Ana Martínez",
          started_at: new Date(Date.now() - 12600000).toISOString(),
          completed_at: new Date(Date.now() - 12000000).toISOString(),
          method_used: "Secado y tamizado",
          equipment_used: ["Estufa", "Tamiz"]
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "preparacion_muestra",
          step_name: "Digestión de Muestra",
          status: "completado",
          assigned_to: "Ana Martínez",
          started_at: new Date(Date.now() - 10800000).toISOString(),
          completed_at: new Date(Date.now() - 9000000).toISOString(),
          method_used: "Digestión ácida EPA 3050B",
          equipment_used: ["Bloque digestor", "Campana extractora"]
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "preparacion_analisis",
          step_name: "Preparación de Análisis",
          status: "en_progreso",
          assigned_to: "Carlos Silva",
          started_at: new Date(Date.now() - 7200000).toISOString(),
          method_used: "Dilución y calibración",
          equipment_used: ["Balanza analítica", "Matraces aforados"]
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "ejecucion_analisis",
          step_name: "Análisis ICP-OES",
          status: "pendiente",
          method_used: "ICP-OES / NCh 409/1",
          equipment_used: ["Espectrómetro ICP-OES"]
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "ejecucion_analisis",
          step_name: "Análisis Complementario",
          status: "pendiente",
          method_used: "Cromatografía",
          equipment_used: ["Cromatógrafo HPLC"]
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "control_calidad",
          step_name: "Control de Calidad",
          status: "pendiente",
          requires_approval: true,
          method_used: "Verificación de estándares"
        },
        {
          sample_id: sampleId,
          work_order_id: workOrderId,
          step_type: "aprobacion_final",
          step_name: "Aprobación Final",
          status: "pendiente",
          requires_approval: true,
          method_used: "Revisión supervisor"
        }
      ];
    }

    try {
      await WorkflowStep.bulkCreate(steps);
      return await WorkflowStep.filter({ work_order_id: workOrderId }, '-created_date');
    } catch (error) {
      console.error("Error creating workflow steps:", error);
      return [];
    }
  };

  const loadWorkflowData = useCallback(async () => {
    if (!otId) return;
    setIsLoading(true);
    try {
      const [workOrderData] = await Promise.all([
        WorkOrder.filter({ id: otId })
      ]);
      
      const order = workOrderData[0];
      setWorkOrder(order);
      
      if (order) {
        const sampleData = await Sample.filter({ internal_number: order.sample_internal_number });
        const sampleRecord = sampleData[0];
        setSample(sampleRecord);
        
        let stepsData = await WorkflowStep.filter({ work_order_id: otId }, '-created_date');
        
        if (stepsData.length === 0 && sampleRecord) {
          stepsData = await createDefaultWorkflowSteps(otId, sampleRecord.id);
        }
        
        setWorkflowSteps(stepsData);
      }
    } catch (error) {
      console.error("Error loading workflow data:", error);
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

      await WorkflowStep.update(stepId, updateData);
      loadWorkflowData();
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
                Muestra: {workOrder?.sample_numbers} • Análisis: {workOrder?.test_parameter}
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
