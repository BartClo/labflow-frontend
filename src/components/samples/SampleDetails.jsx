import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Calendar, MapPin, User, Thermometer, Package, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  recibida: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Recibida" },
  en_preparacion: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "En Preparación" },
  en_analisis: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "En Análisis" },
  completada: { color: "bg-green-100 text-green-800 border-green-200", label: "Completada" },
  entregada: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Entregada" }
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

export default function SampleDetails({ sample, onEdit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-2xl">
                {sampleTypeIcons[sample.sample_type] || "🧪"}
              </span>
            </div>
            <div>
              <CardTitle className="text-2xl">
                {sample.internal_number || `Muestra ${sample.id?.slice(-6)}`}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${statusConfig[sample.status]?.color || statusConfig.recibida.color} border`}>
                  {statusConfig[sample.status]?.label || "Recibida"}
                </Badge>
                {sample.priority && sample.priority !== 'normal' && (
                  <Badge className={`${priorityConfig[sample.priority]?.color || priorityConfig.normal.color} border`}>
                    {priorityConfig[sample.priority]?.label || sample.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onEdit} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{sample.client_name || 'No especificado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{sample.sampling_point}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Datos de Recepción</h3>
              <div className="space-y-3">
                {sample.reception_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>
                      {format(new Date(sample.reception_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Recibida por: {sample.received_by}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span>Condición: {sample.sample_condition === 'aceptable' ? 'Aceptable' : 'No aceptable'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Condiciones de transporte */}
          {sample.transport_conditions && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Condiciones de Transporte</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sample.transport_conditions.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-gray-500" />
                    <span>Temperatura: {sample.transport_conditions.temperature}</span>
                  </div>
                )}
                {sample.transport_conditions.container_type && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span>Contenedor: {sample.transport_conditions.container_type}</span>
                  </div>
                )}
                {sample.transport_conditions.preservation && (
                  <div className="flex items-center gap-2">
                    <span>Preservación: {sample.transport_conditions.preservation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Análisis solicitados */}
          {sample.requested_tests && sample.requested_tests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Análisis Solicitados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sample.requested_tests.map((test, index) => (
                  <Badge key={index} variant="outline" className="justify-start">
                    {test}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {sample.observations && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Observaciones</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {sample.observations}
              </p>
            </div>
          )}

          {/* Archivos adjuntos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
            <div className="flex gap-3">
              {sample.reception_photo_url && (
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Foto
                </Button>
              )}
              {sample.reception_pdf_url && (
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver PDF
                </Button>
              )}
              {!sample.reception_photo_url && !sample.reception_pdf_url && (
                <p className="text-gray-500 text-sm">No hay documentos adjuntos</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}