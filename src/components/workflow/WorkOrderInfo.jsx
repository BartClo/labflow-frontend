import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  User,
  Calendar,
  Settings,
  MapPin,
  Building2
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

export default function WorkOrderInfo({ workOrder, sample }) {
  if (!workOrder) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Información de la OT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado y prioridad */}
        <div className="flex items-center gap-2">
          <Badge className={`${statusConfig[workOrder.status]?.color} border`}>
            {statusConfig[workOrder.status]?.label}
          </Badge>
          {workOrder.priority && workOrder.priority !== 'normal' && (
            <Badge className={`${priorityConfig[workOrder.priority]?.color} border`}>
              {priorityConfig[workOrder.priority]?.label}
            </Badge>
          )}
        </div>

        {/* Información de la muestra */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              <span>{sampleTypeIcons[sample?.sample_type] || "🧪"}</span>
            </div>
            <div>
              <p className="font-medium">{workOrder.sample_internal_number}</p>
              <p className="text-gray-500 text-xs">
                {sample?.sample_type ? sample.sample_type.charAt(0).toUpperCase() + sample.sample_type.slice(1) : 'Tipo no especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Cliente */}
        {sample?.client_name && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium">Cliente</p>
              <p className="text-gray-600">{sample.client_name}</p>
            </div>
          </div>
        )}

        {/* Punto de muestreo */}
        {sample?.sampling_point && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium">Punto de Muestreo</p>
              <p className="text-gray-600">{sample.sampling_point}</p>
            </div>
          </div>
        )}

        {/* Análisis */}
        <div className="flex items-center gap-2 text-sm">
          <FlaskConical className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-medium">Análisis</p>
            <p className="text-gray-600">{workOrder.test_parameter}</p>
          </div>
        </div>

        {/* Método */}
        <div className="flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-medium">Método</p>
            <p className="text-gray-600">{workOrder.test_method}</p>
          </div>
        </div>

        {/* Técnico asignado */}
        {workOrder.assigned_technician && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium">Técnico Asignado</p>
              <p className="text-gray-600">{workOrder.assigned_technician}</p>
            </div>
          </div>
        )}

        {/* Fecha de recepción */}
        {sample?.reception_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium">Fecha de Recepción</p>
              <p className="text-gray-600">
                {format(new Date(sample.reception_date), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>
        )}

        {/* Fecha límite */}
        {sample?.completion_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium">Fecha Límite</p>
              <p className="text-gray-600">
                {format(new Date(sample.completion_date), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}