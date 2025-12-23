import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Calendar, MapPin, User, Thermometer, Package, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Analysis } from "@/api/entities";

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
  const [analyses, setAnalyses] = useState([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const analysesData = await Analysis.getAll();
      setAnalyses(Array.isArray(analysesData) ? analysesData : []);
    } catch (error) {
      console.error('Error loading analyses:', error);
      setAnalyses([]);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  // Function to get analysis name by ID
  const getAnalysisById = (id) => {
    const analysis = analyses.find(a => a.id === id);
    return analysis ? {
      name: analysis.nombreAnalisis || analysis.nombre || `Análisis ${id}`,
      code: analysis.codigo,
      category: analysis.categoria
    } : {
      name: `Análisis ID: ${id}`,
      code: null,
      category: null
    };
  };
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
          {/* Información básica de la muestra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Número Interno:</span>
                  <span>{sample.internal_number}</span>
                </div>
                {sample.scanned_barcode && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Código de Barras:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{sample.scanned_barcode}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Tipo de Muestra:</span>
                  <span className="capitalize">{sample.sample_type}</span>
                </div>
                {sample.sample_volume && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Volumen:</span>
                    <span>{sample.sample_volume} mL</span>
                  </div>
                )}
                {sample.project_name && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Proyecto:</span>
                    <span>{sample.project_name}</span>
                  </div>
                )}
                {sample.request_number && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Nº Solicitud:</span>
                    <span>{sample.request_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Prioridad:</span>
                  <span className="capitalize">{sample.priority}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Fechas Importantes</h3>
              <div className="space-y-3">
                {sample.reception_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-600">Recepción:</span>
                      <br />
                      <span className="text-sm">
                        {format(new Date(sample.reception_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                )}
                {sample.sampling_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-600">Muestreo:</span>
                      <br />
                      <span className="text-sm">
                        {format(new Date(sample.sampling_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                )}
                {sample.completion_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-600">Finalización:</span>
                      <br />
                      <span className="text-sm">
                        {format(new Date(sample.completion_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Cliente:</span>
                    <br />
                    <span className="font-medium">{sample.client_name || 'No especificado'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Punto de Muestreo:</span>
                    <br />
                    <span>{sample.sampling_point}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Datos de Recepción</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Recibida por:</span>
                    <br />
                    <span>{sample.received_by}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Condición:</span>
                    <br />
                    <span>{sample.sample_condition === 'aceptable' ? 'Aceptable' : 'No aceptable'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Condiciones de transporte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Condiciones de Transporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Thermometer className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-600">Temperatura:</span>
                  <br />
                  <span>
                    {sample.transport_conditions?.temperature 
                      ? `${sample.transport_conditions.temperature}°${sample.transport_conditions.temperature_unit === 'fahrenheit' ? 'F' : 'C'}`
                      : 'No especificada'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Package className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-600">Tipo de Contenedor:</span>
                  <br />
                  <span className="capitalize">
                    {sample.transport_conditions?.container_type 
                      ? sample.transport_conditions.container_type.replace('_', ' ')
                      : 'No especificado'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Package className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-600">Preservación:</span>
                  <br />
                  <span>
                    {sample.transport_conditions?.preservation || 'No especificada'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Análisis y plantillas solicitados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Análisis Solicitados</h3>
            {sample.requested_tests && sample.requested_tests.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sample.requested_tests.map((testId, index) => {
                    const analysis = getAnalysisById(testId);
                    return (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <span className="text-sm font-medium block">{analysis.name}</span>
                            {analysis.code && (
                              <span className="text-xs text-gray-600">Código: {analysis.code}</span>
                            )}
                            {analysis.category && (
                              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded mt-1 inline-block">
                                {analysis.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">Total de análisis solicitados:</span> {sample.requested_tests.length}
                  {isLoadingAnalyses && <span className="ml-2 text-gray-500">(Cargando detalles...)</span>}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">No se han solicitado análisis específicos</p>
            )}
            
            {/* Información de plantilla utilizada */}
            {sample.template_used && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-800">Plantilla aplicada:</span>
                  <span className="text-green-700">{sample.template_used}</span>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Observaciones</h3>
            {sample.observations && sample.observations.trim() ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{sample.observations}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">No se registraron observaciones</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}