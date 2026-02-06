import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  FlaskConical,
  User,
  Calendar,
  Settings,
  MapPin,
  Building2,
  FileText,
  Clock,
  Droplet
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  abierta: { color: "bg-blue-100 text-blue-800", label: "Abierta" },
  generada: { color: "bg-gray-100 text-gray-800", label: "Generada" },
  preparacion: { color: "bg-blue-100 text-blue-800", label: "En Preparación" },
  en_proceso: { color: "bg-orange-100 text-orange-800", label: "En Proceso" },
  en_ejecucion: { color: "bg-orange-100 text-orange-800", label: "En Ejecución" },
  resultado_registrado: { color: "bg-purple-100 text-purple-800", label: "Resultado Registrado" },
  validada: { color: "bg-green-100 text-green-800", label: "Validada" },
  completada: { color: "bg-green-100 text-green-800", label: "Completada" },
  finalizada: { color: "bg-green-100 text-green-800", label: "Finalizada" },
  cancelada: { color: "bg-red-100 text-red-800", label: "Cancelada" }
};

const priorityConfig = {
  normal: { color: "bg-gray-100 text-gray-800", label: "Normal" },
  baja: { color: "bg-gray-100 text-gray-800", label: "Baja" },
  media: { color: "bg-yellow-100 text-yellow-800", label: "Media" },
  urgente: { color: "bg-orange-100 text-orange-800", label: "Urgente" },
  alta: { color: "bg-orange-100 text-orange-800", label: "Alta" },
  critica: { color: "bg-red-100 text-red-800", label: "Crítica" }
};

const InfoCard = ({ icon: Icon, title, value, iconColor = "text-gray-500" }) => (
  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 font-medium mb-1">{title}</p>
        <p className="text-sm text-gray-900 font-semibold truncate">{value || 'N/A'}</p>
      </div>
    </div>
  </div>
);

export default function WorkOrderInfoModal({ workOrder, sample, onClose }) {
  if (!workOrder) return null;

  // Extraer información de las tareas
  const tareas = workOrder.tareas || [];
  const sampleNumbers = tareas.map(t => t.numero_muestra).filter(Boolean).join(', ') || workOrder.sample_numbers || 'N/A';
  const analysisNames = [...new Set(tareas.map(t => t.nombre_analisis).filter(Boolean))].join(', ') || workOrder.test_parameter || 'N/A';
  const clientName = tareas[0]?.cliente?.nombre || sample?.client_name || 'N/A';
  const priority = workOrder.priority || tareas[0]?.prioridad?.toLowerCase() || 'normal';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Información de la OT</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm text-gray-600">
                  {workOrder.ot_number}
                </p>
                <Badge className={`${statusConfig[workOrder.status?.toLowerCase()]?.color || 'bg-gray-100 text-gray-800'} border`}>
                  {statusConfig[workOrder.status?.toLowerCase()]?.label || workOrder.status}
                </Badge>
                {priority && priority !== 'normal' && priority !== 'baja' && (
                  <Badge className={`${priorityConfig[priority]?.color || 'bg-gray-100 text-gray-800'} border`}>
                    {priorityConfig[priority]?.label || priority}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Grid de información - 3 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Muestra(s) */}
            <InfoCard
              icon={Droplet}
              title="Muestra"
              value={sampleNumbers}
              iconColor="text-blue-600"
            />

            {/* Cliente */}
            <InfoCard
              icon={Building2}
              title="Cliente"
              value={clientName}
              iconColor="text-blue-600"
            />

            {/* Punto de muestreo */}
            <InfoCard
              icon={MapPin}
              title="Punto de Muestreo"
              value={sample?.sampling_point || tareas[0]?.punto_muestreo || 'N/A'}
              iconColor="text-red-600"
            />

            {/* Análisis */}
            <InfoCard
              icon={FlaskConical}
              title="Análisis"
              value={analysisNames}
              iconColor="text-purple-600"
            />

            {/* Método/Plantilla */}
            <InfoCard
              icon={Settings}
              title="Método"
              value={workOrder.test_method || `${tareas.length} análisis asignados`}
              iconColor="text-orange-600"
            />

            {/* Fecha de recepción */}
            <InfoCard
              icon={Calendar}
              title="Fecha de Recepción"
              value={sample?.reception_date 
                ? format(new Date(sample.reception_date), 'dd/MM/yyyy HH:mm', { locale: es })
                : 'N/A'}
              iconColor="text-indigo-600"
            />

            {/* Fecha de creación de OT */}
            <InfoCard
              icon={FileText}
              title="OT Creada"
              value={workOrder.created_date 
                ? format(new Date(workOrder.created_date), 'dd/MM/yyyy HH:mm', { locale: es })
                : 'N/A'}
              iconColor="text-gray-600"
            />

            {/* Técnico asignado */}
            <InfoCard
              icon={User}
              title="Técnico Asignado"
              value={workOrder.tecnico_asignado?.nombre_completo || workOrder.assigned_technician || 'Sin asignar'}
              iconColor="text-green-600"
            />

            {/* Total de tareas */}
            <InfoCard
              icon={Clock}
              title="Total Tareas"
              value={`${tareas.length} tarea${tareas.length !== 1 ? 's' : ''}`}
              iconColor="text-blue-600"
            />
          </div>

          {/* Lista de tareas si hay más de una */}
          {tareas.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tareas Incluidas</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tareas.map((tarea, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">{tarea.nombre_analisis || 'Análisis'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{tarea.numero_muestra}</span>
                      {tarea.prioridad && tarea.prioridad !== 'MEDIA' && (
                        <Badge className={`${priorityConfig[tarea.prioridad?.toLowerCase()]?.color || 'bg-gray-100'} text-xs`}>
                          {tarea.prioridad}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}