import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus } from "lucide-react";

const categories = [
  { value: "Microbiológico", label: "Microbiológico" },
  { value: "Físico-Químico", label: "Físico-Químico" },
  { value: "Metales Pesados", label: "Metales Pesados" },
  { value: "Orgánicos", label: "Orgánicos" },
  { value: "Otros", label: "Otros" }
];

const sampleTypes = [
  { value: "Agua", label: "Agua" },
  { value: "Suelo", label: "Suelo" },
  { value: "Aire", label: "Aire" },
  { value: "Alimentos", label: "Alimentos" },
  { value: "Otros", label: "Otros" }
];

export default function AnalysisForm({ analysis, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: analysis?.name || '',
    code: analysis?.code || '',
    description: analysis?.description || '',
    category: analysis?.category || 'Físico-Químico',
    method: analysis?.method || '',
    sample_types: analysis?.sample_types || [],
    parameters: analysis?.parameters || [{ parameter_name: '', unit: '', detection_limit: '', max_limit: '' }],
    required_equipment: analysis?.required_equipment || [''],
    estimated_duration_hours: analysis?.estimated_duration_hours || '',
    price: analysis?.price || '',
    status: analysis?.status || 'activo'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSampleTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      sample_types: prev.sample_types.includes(type)
        ? prev.sample_types.filter(t => t !== type)
        : [...prev.sample_types, type]
    }));
  };

  const addParameter = () => {
    setFormData(prev => ({
      ...prev,
      parameters: [...prev.parameters, { parameter_name: '', unit: '', detection_limit: '', max_limit: '' }]
    }));
  };

  const removeParameter = (index) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  const updateParameter = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      required_equipment: [...prev.required_equipment, '']
    }));
  };

  const removeEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      required_equipment: prev.required_equipment.filter((_, i) => i !== index)
    }));
  };

  const updateEquipment = (index, value) => {
    setFormData(prev => ({
      ...prev,
      required_equipment: prev.required_equipment.map((eq, i) => 
        i === index ? value : eq
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      estimated_duration_hours: formData.estimated_duration_hours ? Number(formData.estimated_duration_hours) : undefined,
      price: formData.price ? Number(formData.price) : undefined,
      parameters: formData.parameters.filter(p => p.parameter_name),
      required_equipment: formData.required_equipment.filter(e => e)
    };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[95vh] flex flex-col bg-white rounded-lg shadow-xl">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {analysis ? 'Editar Análisis' : 'Nuevo Análisis'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Análisis *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Determinación de pH"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="Ej: AN-001"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción detallada del análisis"
                className="h-20"
              />
            </div>

            {/* Categoría y método */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="method">Método de Ensayo *</Label>
                <Input
                  id="method"
                  value={formData.method}
                  onChange={(e) => handleInputChange('method', e.target.value)}
                  placeholder="Ej: NCh 409/1, APHA 3120"
                  required
                />
              </div>
            </div>

            {/* Tipos de muestra aplicables */}
            <div className="space-y-2">
              <Label>Tipos de Muestra Aplicables</Label>
              <div className="flex flex-wrap gap-2">
                {sampleTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={formData.sample_types.includes(type.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSampleTypeToggle(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Parámetros */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Parámetros a Medir</Label>
                <Button type="button" variant="outline" size="sm" onClick={addParameter}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Parámetro
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.parameters.map((param, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Nombre del parámetro"
                          value={param.parameter_name}
                          onChange={(e) => updateParameter(index, 'parameter_name', e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="Unidad"
                        value={param.unit}
                        onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                      />
                      <Input
                        type="number"
                        step="any"
                        placeholder="Límite detección"
                        value={param.detection_limit}
                        onChange={(e) => updateParameter(index, 'detection_limit', e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="any"
                          placeholder="Límite máx"
                          value={param.max_limit}
                          onChange={(e) => updateParameter(index, 'max_limit', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeParameter(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Equipos requeridos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Equipos Requeridos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEquipment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Equipo
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.required_equipment.map((equipment, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Nombre del equipo"
                      value={equipment}
                      onChange={(e) => updateEquipment(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEquipment(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Duración y precio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración Estimada (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  step="0.5"
                  value={formData.estimated_duration_hours}
                  onChange={(e) => handleInputChange('estimated_duration_hours', e.target.value)}
                  placeholder="Ej: 24"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Precio (CLP)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Ej: 25000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {analysis ? 'Actualizar Análisis' : 'Crear Análisis'}
          </Button>
        </div>
      </div>
    </div>
  );
}