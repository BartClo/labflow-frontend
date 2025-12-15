import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search } from "lucide-react";

const sampleTypes = [
  { value: "agua", label: "Agua" },
  { value: "suelo", label: "Suelo" },
  { value: "aire", label: "Aire" },
  { value: "alimentos", label: "Alimentos" },
  { value: "otros", label: "Otros" }
];

export default function TemplateForm({ template, analyses, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    sample_types: template?.sample_types || [],
    analysis_ids: template?.analysis_ids || [],
    total_price: template?.total_price || 0,
    estimated_duration_days: template?.estimated_duration_days || 0,
    status: template?.status || 'activo'
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        sample_types: template.sample_types || [],
        analysis_ids: template.analysis_ids || [],
        total_price: template.total_price || 0,
        estimated_duration_days: template.estimated_duration_days || 0,
        status: template.status || 'activo'
      });
    }
  }, [template]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Si se están cambiando los analysis_ids, recalcular totales
      if (field === 'analysis_ids') {
        const selectedAnalyses = analyses.filter(a => value.includes(a.idAnalisis));
        const totalPrice = selectedAnalyses.reduce((sum, a) => sum + (a.precioClp || 0), 0);
        const totalHours = selectedAnalyses.reduce((sum, a) => sum + (a.duracionEstimadaHoras || 0), 0);
        
        newData.total_price = totalPrice;
        newData.estimated_duration_days = Math.ceil(totalHours / 24);
      }
      
      return newData;
    });
  };

  const handleSampleTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      sample_types: prev.sample_types.includes(type)
        ? prev.sample_types.filter(t => t !== type)
        : [...prev.sample_types, type]
    }));
  };

  const handleAnalysisToggle = (analysisId) => {
    setFormData(prev => {
      const newAnalysisIds = prev.analysis_ids.includes(analysisId)
        ? prev.analysis_ids.filter(id => id !== analysisId)
        : [...prev.analysis_ids, analysisId];
      
      const selectedAnalyses = analyses.filter(a => newAnalysisIds.includes(a.idAnalisis));
      const totalPrice = selectedAnalyses.reduce((sum, a) => sum + (a.precioClp || 0), 0);
      const totalHours = selectedAnalyses.reduce((sum, a) => sum + (a.duracionEstimadaHoras || 0), 0);
      
      return {
        ...prev,
        analysis_ids: newAnalysisIds,
        total_price: totalPrice,
        estimated_duration_days: Math.ceil(totalHours / 24)
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.nombreAnalisis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAnalyses = analyses.filter(a => formData.analysis_ids.includes(a.idAnalisis));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-5xl my-8 max-h-[95vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-2xl">
            {template ? 'Editar Plantilla de Procedimientos' : 'Nueva Plantilla de Procedimientos'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Plantilla *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Análisis Completo de Agua Potable"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción detallada de la plantilla"
                className="h-20"
              />
            </div>

            <div className="space-y-3">
              <Label>Tipos de Muestra Aplicables *</Label>
              <div className="flex flex-wrap gap-2">
                {sampleTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={formData.sample_types.includes(type.value) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                    onClick={() => handleSampleTypeToggle(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
              {formData.sample_types.length === 0 && (
                <p className="text-sm text-red-600">Selecciona al menos un tipo de muestra</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">
                  Análisis Incluidos * ({formData.analysis_ids.length} seleccionados)
                </Label>
                <div className="flex items-center gap-3">
                  {formData.analysis_ids.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('analysis_ids', [])}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Deseleccionar todo
                    </Button>
                  )}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar análisis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <Card className="border-2">
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredAnalyses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No se encontraron análisis' : 'No hay análisis disponibles'}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredAnalyses.map((analysis) => (
                          <div key={analysis.idAnalisis} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                checked={formData.analysis_ids.includes(analysis.idAnalisis)}
                                onCheckedChange={() => handleAnalysisToggle(analysis.idAnalisis)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{analysis.nombreAnalisis}</p>
                                  <Badge variant="outline" className="text-xs">{analysis.codigo}</Badge>
                                  <Badge className="text-xs bg-purple-100 text-purple-800">
                                    {analysis.categoria}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{analysis.metodoEnsayo || 'No especificado'}</p>
                                {analysis.parametrosMedir?.parametros && analysis.parametrosMedir.parametros.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {analysis.parametrosMedir.parametros.length} parámetros
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-lg">${analysis.precioClp?.toLocaleString() || 0}</p>
                              <p className="text-sm text-gray-600">{analysis.duracionEstimadaHoras || 0}h</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {formData.analysis_ids.length === 0 && (
                <p className="text-sm text-red-600">Selecciona al menos un análisis</p>
              )}
            </div>

            {selectedAnalyses.length > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Resumen de la Plantilla</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-gray-600 mb-1">Total de análisis</p>
                      <p className="text-3xl font-bold text-blue-900">{selectedAnalyses.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Precio total</p>
                      <p className="text-3xl font-bold text-green-700">${formData.total_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Duración estimada</p>
                      <p className="text-3xl font-bold text-orange-700">{formData.estimated_duration_days} días</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={formData.analysis_ids.length === 0 || formData.sample_types.length === 0}
              >
                {template ? 'Actualizar Plantilla' : 'Crear Plantilla'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}