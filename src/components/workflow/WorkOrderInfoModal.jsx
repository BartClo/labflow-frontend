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
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  generada: { color: "bg-gray-100 text-gray-800", label: "Generada" },
  preparacion: { color: "bg-blue-100 text-blue-800", label: "En Preparación" },
  en_ejecucion: { color: "bg-orange-100 text-orange-800", label: "En Ejecución" },
  resultado_registrado: { color: "bg-purple-100 text-purple-800", label: "Resultado Registrado" },
  validada: { color: "bg-green-100 text-green-800", label: "Validada" },
  completada: { color: "bg-green-100 text-green-800", label: "Completada" }
};

const priorityConfig = {
  normal: { color: "bg-gray-100 text-gray-800", label: "Normal" },
  urgente: { color: "bg-orange-100 text-orange-800", label: "Urgente" },
  critica: { color: "bg-red-100 text-red-800", label: "Crítica" }
};

const sampleTypeIcons = {
  agua: "💧",
  suelo: "🌍",
  aire: "💨",
  alimentos: "🍃",
  otros: "🧪"
};

const InfoCard = ({ icon: Icon, title, value, iconColor = "text-gray-500" }) => (
  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 font-medium mb-1">{title}</p>
        <p className="text-sm text-gray-900 font-semibold truncate">{value}</p>
      </div>
    </div>
  </div>
);

export default function WorkOrderInfoModal({ workOrder, sample, onClose }) {
  if (!workOrder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Información de la OT</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm text-gray-600">
                  {workOrder.ot_number} • {workOrder.sample_internal_number}
                </p>
                <Badge className={`${statusConfig[workOrder.status]?.color} border`}>
                  {statusConfig[workOrder.status]?.label}
                </Badge>
                {workOrder.priority && workOrder.priority !== 'normal' && (
                  <Badge className={`${priorityConfig[workOrder.priority]?.color} border`}>
                    {priorityConfig[workOrder.priority]?.label}
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
            {/* Muestra */}
            <InfoCard
              icon={() => <span className="text-2xl">{sampleTypeIcons[sample?.sample_type] || "🧪"}</span>}
              title="Muestra"
              value={`${workOrder.sample_internal_number} - ${sample?.sample_type?.charAt(0).toUpperCase()}${sample?.sample_type?.slice(1) || 'N/A'}`}
            />

            {/* Cliente */}
            {sample?.client_name && (
              <InfoCard
                icon={Building2}
                title="Cliente"
                value={sample.client_name}
                iconColor="text-blue-600"
              />
            )}

            {/* Punto de muestreo */}
            {sample?.sampling_point && (
              <InfoCard
                icon={MapPin}
                title="Punto de Muestreo"
                value={sample.sampling_point}
                iconColor="text-red-600"
              />
            )}

            {/* Análisis */}
            <InfoCard
              icon={FlaskConical}
              title="Análisis"
              value={workOrder.test_parameter}
              iconColor="text-purple-600"
            />

            {/* Método */}
            <InfoCard
              icon={Settings}
              title="Método"
              value={workOrder.test_method}
              iconColor="text-orange-600"
            />

            {/* Técnico */}
            {workOrder.assigned_technician && (
              <InfoCard
                icon={User}
                title="Técnico Asignado"
                value={workOrder.assigned_technician}
                iconColor="text-green-600"
              />
            )}

            {/* Fecha de recepción */}
            {sample?.reception_date && (
              <InfoCard
                icon={Calendar}
                title="Fecha de Recepción"
                value={format(new Date(sample.reception_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                iconColor="text-indigo-600"
              />
            )}

            {/* Fecha límite */}
            {sample?.completion_date && (
              <InfoCard
                icon={Clock}
                title="Fecha Límite"
                value={format(new Date(sample.completion_date), 'dd/MM/yyyy', { locale: es })}
                iconColor="text-red-600"
              />
            )}

            {/* Fecha de creación de OT */}
            {workOrder.created_date && (
              <InfoCard
                icon={FileText}
                title="OT Creada"
                value={format(new Date(workOrder.created_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                iconColor="text-gray-600"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}