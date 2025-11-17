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
  microbiologico: { color: "bg-green-100 text-green-800", label: "Microbiológico" },
  fisico_quimico: { color: "bg-blue-100 text-blue-800", label: "Físico-Químico" },
  metales_pesados: { color: "bg-red-100 text-red-800", label: "Metales Pesados" },
  organicos: { color: "bg-purple-100 text-purple-800", label: "Orgánicos" },
  otros: { color: "bg-gray-100 text-gray-800", label: "Otros" }
};

export default function AnalysisDetails({ analysis, onEdit, onClose }) {
  const categoryInfo = categoryConfig[analysis.category] || categoryConfig.otros;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{analysis.name}</CardTitle>
              {analysis.description && (
                <p className="text-gray-600 mt-1">{analysis.description}</p>
              )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      ${analysis.price?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-blue-700">Precio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {analysis.turnaround_time || 'N/A'}
                    </p>
                    <p className="text-sm text-green-700">Tiempo estimado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-8 h-8 text-purple-600" />
                  <div>
                    <Badge className={categoryInfo.color}>
                      {categoryInfo.label}
                    </Badge>
                    <p className="text-sm text-purple-700 mt-1">Categoría</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {analysis.methodology && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Metodología
              </h3>
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {analysis.methodology}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {analysis.parameters && analysis.parameters.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Parámetros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.parameters.map((param, index) => (
                  <Card key={index} className="bg-white border">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{param.name}</p>
                          {param.unit && (
                            <p className="text-sm text-gray-600">Unidad: {param.unit}</p>
                          )}
                          {param.method && (
                            <p className="text-sm text-gray-600">Método: {param.method}</p>
                          )}
                        </div>
                        {param.limit && (
                          <Badge variant="outline" className="ml-2">
                            Límite: {param.limit}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {analysis.equipment && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Equipo Requerido</h3>
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <p className="text-gray-700">{analysis.equipment}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {analysis.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notas</h3>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {analysis.notes}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {analysis.created_at && (
            <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Creado: {new Date(analysis.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {analysis.updated_at && analysis.updated_at !== analysis.created_at && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Actualizado: {new Date(analysis.updated_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
