import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Edit, 
  FlaskConical,
  DollarSign,
  Calendar,
  Clock,
  FileText
} from "lucide-react";

const categoryConfig = {
  "Microbiológico": { color: "bg-purple-100 text-purple-800 border-purple-200" },
  "Físico-Químico": { color: "bg-blue-100 text-blue-800 border-blue-200" },
  "Metales Pesados": { color: "bg-orange-100 text-orange-800 border-orange-200" },
  "Orgánicos": { color: "bg-green-100 text-green-800 border-green-200" },
  "GENERAL": { color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  "Otros": { color: "bg-gray-100 text-gray-800 border-gray-200" }
};

export default function AnalysisDetails({ analysis, onEdit, onClose }) {
  if (!analysis) return null;

  const categoryInfo = categoryConfig[analysis.categoria] || categoryConfig["Otros"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{analysis.nombreAnalisis}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono">
                  {analysis.codigo}
                </Badge>
                <Badge className={`${categoryInfo.color} border`}>
                  {analysis.categoria}
                </Badge>
                <Badge variant={analysis.estado === 'Activo' ? 'default' : 'secondary'}>
                  {analysis.estado}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onEdit} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button onClick={onClose} variant="outline" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Alerta de análisis incompleto */}
          {(!analysis.descripcion || !analysis.metodoEnsayo || !analysis.duracionEstimadaHoras || !analysis.precioClp) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Análisis Incompleto</span>
              </div>
              <p className="text-amber-700 text-sm">
                Este análisis no tiene toda la información requerida. Se recomienda completar los datos faltantes antes de usarlo en órdenes de trabajo.
              </p>
            </div>
          )}

          {/* Información crítica para laboratorio */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Información Crítica del Análisis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3 border border-blue-100">
                <div className="font-medium text-blue-800">Tiempo de Ejecución</div>
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.duracionEstimadaHoras || '—'}
                  {analysis.duracionEstimadaHoras && 'h'}
                </div>
                {!analysis.duracionEstimadaHoras && (
                  <div className="text-xs text-red-500">No especificado</div>
                )}
              </div>
              <div className="bg-white rounded p-3 border border-green-100">
                <div className="font-medium text-green-800">Costo del Análisis</div>
                <div className="text-2xl font-bold text-green-600">
                  {analysis.precioClp ? `$${analysis.precioClp.toLocaleString()}` : '—'}
                </div>
                <div className="text-xs text-green-600">
                  {analysis.precioClp ? 'CLP' : 'No especificado'}
                </div>
              </div>
              <div className="bg-white rounded p-3 border border-orange-100">
                <div className="font-medium text-orange-800">Tiempo de Entrega</div>
                <div className="text-2xl font-bold text-orange-600">
                  {analysis.diasEntrega || '—'}
                  {analysis.diasEntrega && ' días'}
                </div>
                {!analysis.diasEntrega && (
                  <div className="text-xs text-red-500">No especificado</div>
                )}
              </div>
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Descripción:</span>
                  <p className="text-gray-600 mt-1">{analysis.descripcion || 'No especificada'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Método de Ensayo:</span>
                  <p className="text-gray-600 mt-1">{analysis.metodoEnsayo || 'No especificado'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Protocolo de Ejecución
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Método de Ensayo:</span>
                  <p className="text-gray-600 mt-1 font-mono text-sm bg-gray-50 p-2 rounded">
                    {analysis.metodoEnsayo || 'No especificado'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estado del Protocolo:</span>
                  <div className="mt-1">
                    <Badge variant={analysis.estado === 'Activo' ? 'default' : 'secondary'}>
                      {analysis.estado}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tipos de muestra aplicables */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tipos de Muestra Aplicables
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.tiposMuestraAplicables && analysis.tiposMuestraAplicables.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.tiposMuestraAplicables.map((tipo, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {tipo}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-4">
                  No se han especificado tipos de muestra aplicables
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parámetros a medir */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Parámetros a Medir
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.parametrosMedir && analysis.parametrosMedir.parametros && analysis.parametrosMedir.parametros.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.parametrosMedir.parametros.map((parametro, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <h4 className="font-semibold text-gray-900">{parametro.nombre}</h4>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {parametro.unidad && (
                          <div><span className="font-medium">Unidad:</span> {parametro.unidad}</div>
                        )}
                        {parametro.limite_deteccion && (
                          <div><span className="font-medium">Límite de Detección:</span> {parametro.limite_deteccion}</div>
                        )}
                        {parametro.limite_maximo && (
                          <div><span className="font-medium">Límite Máximo:</span> {parametro.limite_maximo}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-4">
                  No se han definido parámetros para este análisis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipos requeridos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Equipos Requeridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.equiposRequeridos && analysis.equiposRequeridos.equipos && analysis.equiposRequeridos.equipos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.equiposRequeridos.equipos.map((equipo, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-blue-900">{equipo.nombre}</h4>
                      <div className="text-sm text-blue-700 mt-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Estado:</span>
                          <Badge variant={equipo.estado === 'Activo' ? 'default' : 'secondary'} className="text-xs">
                            {equipo.estado}
                          </Badge>
                        </div>
                        {equipo.precio_clp && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Precio:</span>
                            <span>${equipo.precio_clp.toLocaleString()} CLP</span>
                          </div>
                        )}
                        {equipo.duracion_horas && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Duración:</span>
                            <span>{equipo.duracion_horas} horas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-4">
                  No se han especificado equipos requeridos para este análisis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insumos requeridos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Insumos Requeridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.required_supplies && analysis.required_supplies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.required_supplies.map((supply, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-800">
                      {supply}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-4">
                  No se han especificado insumos requeridos para este análisis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reactivos requeridos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reactivos Requeridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.required_reagents && analysis.required_reagents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.required_reagents.map((reagent, index) => (
                    <Badge key={index} variant="outline" className="bg-orange-50 border-orange-200 text-orange-800">
                      {reagent}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-4">
                  No se han especificado reactivos requeridos para este análisis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Información de Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.fechaCreacion && (
                  <div>
                    <span className="font-medium text-gray-700">Fecha de Creación:</span>
                    <p className="text-gray-600 mt-1">
                      {new Date(analysis.fechaCreacion).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                {analysis.fechaActualizacion && (
                  <div>
                    <span className="font-medium text-gray-700">Última Actualización:</span>
                    <p className="text-gray-600 mt-1">
                      {new Date(analysis.fechaActualizacion).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
