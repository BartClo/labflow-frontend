import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Edit, 
  Package, 
  FlaskConical,
  DollarSign,
  Calendar,
  Clock
} from "lucide-react";

export default function TemplateDetails({ template, analyses, onEdit, onClose }) {
  const includedAnalyses = analyses.filter(a => template.analysis_ids?.includes(a.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              {template.description && (
                <p className="text-gray-600 mt-1">{template.description}</p>
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
                  <FlaskConical className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {includedAnalyses.length}
                    </p>
                    <p className="text-sm text-blue-700">Análisis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      ${template.total_price?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-green-700">Precio Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-orange-900">
                      {template.estimated_duration_days || 0}
                    </p>
                    <p className="text-sm text-orange-700">Días</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {template.sample_types && template.sample_types.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Tipos de Muestra Aplicables</h3>
              <div className="flex flex-wrap gap-2">
                {template.sample_types.map((type) => (
                  <Badge key={type} className="bg-blue-100 text-blue-800 capitalize">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Análisis Incluidos en esta Plantilla</h3>
            {includedAnalyses.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="text-center py-8">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No hay análisis incluidos en esta plantilla</p>
                  <Button 
                    onClick={onEdit} 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                  >
                    Agregar Análisis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {includedAnalyses.map((analysis, index) => (
                  <Card key={analysis.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{analysis.name}</h4>
                              <Badge variant="outline" className="text-xs">{analysis.code}</Badge>
                              <Badge className="text-xs bg-purple-100 text-purple-800">
                                {analysis.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">Método: {analysis.method}</p>
                            {analysis.description && (
                              <p className="text-xs text-gray-500 mt-1">{analysis.description}</p>
                            )}
                            {analysis.parameters && analysis.parameters.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">Parámetros:</span>
                                {analysis.parameters.slice(0, 3).map((param, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {param.parameter_name}
                                  </Badge>
                                ))}
                                {analysis.parameters.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{analysis.parameters.length - 3} más
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-gray-900">
                            ${analysis.price?.toLocaleString() || 0}
                          </p>
                          {analysis.estimated_duration_hours && (
                            <div className="flex items-center justify-end gap-1 text-sm text-gray-600 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{analysis.estimated_duration_hours}h</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {includedAnalyses.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de análisis incluidos</p>
                    <p className="text-2xl font-bold text-gray-900">{includedAnalyses.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Precio total del set</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${template.total_price?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tiempo estimado</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {template.estimated_duration_days} días
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}