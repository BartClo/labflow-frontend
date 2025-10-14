import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Edit, 
  FlaskConical, 
  User, 
  Calendar,
  Clock,
  Settings,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  generada: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Generada" },
  preparacion: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "En Preparación" },
  en_ejecucion: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "En Ejecución" },
  resultado_registrado: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Resultado Registrado" },
  validada: { color: "bg-green-100 text-green-800 border-green-200", label: "Validada" },
  completada: { color: "bg-green-100 text-green-800 border-green-200", label: "Completada" }
};

const priorityConfig = {
  normal: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Normal" },
  urgente: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "Urgente" },
  critica: { color: "bg-red-100 text-red-800 border-red-200", label: "Crítica" }
};

export default function WorkOrderDetails({ order, sample, analysis, onEdit, onClose }) {
  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">No se pudo cargar la información de la orden de trabajo</p>
            <Button onClick={onClose}>Cerrar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              Orden de Trabajo: {order.ot_number}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${statusConfig[order.status]?.color || statusConfig.generada.color} border`}>
                {statusConfig[order.status]?.label || "Generada"}
              </Badge>
              <Badge className={`${priorityConfig[order.priority]?.color || priorityConfig.normal.color} border`}>
                {priorityConfig[order.priority]?.label || "Normal"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información de la Muestra</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Muestra:</span>
                  <span>{order.sample_internal_number}</span>
                </div>
                {sample && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Cliente:</span>
                      <span>{sample.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Punto de muestreo:</span>
                      <span>{sample.sampling_point}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tipo:</span>
                      <span className="capitalize">{sample.sample_type}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información del Análisis</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Parámetro:</span>
                  <span>{order.test_parameter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Método:</span>
                  <span>{order.test_method}</span>
                </div>
                {analysis && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Categoría:</span>
                      <span className="capitalize">{analysis.category?.replace('_', ' ')}</span>
                    </div>
                    {analysis.estimated_duration_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Duración estimada:</span>
                        <span>{analysis.estimated_duration_hours} horas</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Asignación y equipos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Asignación</h3>
              <div className="space-y-3">
                {order.assigned_technician && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Técnico asignado:</span>
                    <span>{order.assigned_technician}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Fecha de creación:</span>
                  <span>
                    {order.created_date 
                      ? format(new Date(order.created_date), 'dd/MM/yyyy HH:mm', { locale: es })
                      : 'No disponible'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Equipos y Recursos</h3>
              <div className="space-y-3">
                {order.equipment_used && (
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Equipos utilizados:</span>
                    <span>{order.equipment_used}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Datos de ejecución */}
          {order.execution_data && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Datos de Ejecución</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {order.execution_data.start_date && (
                  <div>
                    <span className="font-medium">Fecha de inicio:</span>
                    <span className="ml-2">
                      {format(new Date(order.execution_data.start_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                )}
                {order.execution_data.end_date && (
                  <div>
                    <span className="font-medium">Fecha de finalización:</span>
                    <span className="ml-2">
                      {format(new Date(order.execution_data.end_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                )}
                {order.execution_data.raw_results && (
                  <div>
                    <span className="font-medium">Resultados en bruto:</span>
                    <p className="mt-1 text-sm">{order.execution_data.raw_results}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resultado final */}
          {order.final_result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Resultado Final</h3>
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Valor:</span>
                    <p>{order.final_result.value} {order.final_result.unit}</p>
                  </div>
                  {order.final_result.detection_limit && (
                    <div>
                      <span className="font-medium">Límite de detección:</span>
                      <p>{order.final_result.detection_limit}</p>
                    </div>
                  )}
                  {order.final_result.uncertainty && (
                    <div>
                      <span className="font-medium">Incertidumbre:</span>
                      <p>±{order.final_result.uncertainty}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Cumple norma:</span>
                    <Badge className={
                      order.final_result.complies_norm 
                        ? 'bg-green-100 text-green-800 ml-1' 
                        : 'bg-red-100 text-red-800 ml-1'
                    }>
                      {order.final_result.complies_norm ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información de validación */}
          {order.validation_data && order.validation_data.validated_by && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Validación</h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="font-medium">Validado por:</span>
                  <span className="ml-2">{order.validation_data.validated_by}</span>
                </div>
                {order.validation_data.validation_date && (
                  <div>
                    <span className="font-medium">Fecha de validación:</span>
                    <span className="ml-2">
                      {format(new Date(order.validation_data.validation_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                )}
                {order.validation_data.validation_comments && (
                  <div>
                    <span className="font-medium">Comentarios:</span>
                    <p className="mt-1 text-sm">{order.validation_data.validation_comments}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}