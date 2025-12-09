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
                  Detalles Operativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.duracionEstimadaHoras && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Duración:</span>
                    <span className="text-gray-600">{analysis.duracionEstimadaHoras} horas</span>
                  </div>
                )}
                {analysis.precioClp && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Precio:</span>
                    <span className="text-gray-600">${analysis.precioClp.toLocaleString()} CLP</span>
                  </div>
                )}
                {analysis.diasEntrega && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Días de Entrega:</span>
                    <span className="text-gray-600">{analysis.diasEntrega} días</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tipos de muestra aplicables */}
          {analysis.tiposMuestraAplicables && analysis.tiposMuestraAplicables.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tipos de Muestra Aplicables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.tiposMuestraAplicables.map((tipo, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {typeof tipo === 'object' ? JSON.stringify(tipo) : String(tipo)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parámetros a medir */}
          {analysis.parametrosMedir && Object.keys(analysis.parametrosMedir).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Parámetros a Medir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.parametrosMedir).map(([parametro, detalles], index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <h4 className="font-semibold text-gray-900">{parametro}</h4>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {detalles && typeof detalles === 'object' && detalles.unidad && (
                          <div><span className="font-medium">Unidad:</span> {String(detalles.unidad)}</div>
                        )}
                        {detalles && typeof detalles === 'object' && detalles.limiteDeteccion && (
                          <div><span className="font-medium">Límite de Detección:</span> {String(detalles.limiteDeteccion)}</div>
                        )}
                        {detalles && typeof detalles === 'object' && detalles.limiteMaximo && (
                          <div><span className="font-medium">Límite Máximo:</span> {String(detalles.limiteMaximo)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Equipos requeridos */}
          {analysis.equiposRequeridos && Object.keys(analysis.equiposRequeridos).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Equipos Requeridos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.values(analysis.equiposRequeridos).map((equipo, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200">
                      {typeof equipo === 'object' ? JSON.stringify(equipo) : String(equipo)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
