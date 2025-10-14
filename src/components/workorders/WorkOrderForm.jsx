import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

const priorities = [
  { value: "normal", label: "Normal" },
  { value: "urgente", label: "Urgente" },
  { value: "critica", label: "Crítica" }
];

const statuses = [
  { value: "generada", label: "Generada" },
  { value: "preparacion", label: "En Preparación" },
  { value: "en_ejecucion", label: "En Ejecución" },
  { value: "resultado_registrado", label: "Resultado Registrado" },
  { value: "validada", label: "Validada" },
  { value: "completada", label: "Completada" }
];

const technicians = [
  "Juan Pérez",
  "Ana Martínez", 
  "Carlos Silva",
  "María González",
  "Pedro Ramírez"
];

export default function WorkOrderForm({ order, samples, analyses, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    sample_id: order?.sample_id || '',
    sample_internal_number: order?.sample_internal_number || '',
    test_parameter: order?.test_parameter || '',
    test_method: order?.test_method || '',
    assigned_technician: order?.assigned_technician || '',
    equipment_used: order?.equipment_used || '',
    status: order?.status || 'generada',
    priority: order?.priority || 'normal'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSampleSelect = (sampleId) => {
    const selectedSample = samples.find(s => s.id === sampleId);
    if (selectedSample) {
      setFormData(prev => ({
        ...prev,
        sample_id: sampleId,
        sample_internal_number: selectedSample.internal_number
      }));
    }
  };

  const handleAnalysisSelect = (analysisName) => {
    const selectedAnalysis = analyses.find(a => a.name === analysisName);
    if (selectedAnalysis) {
      setFormData(prev => ({
        ...prev,
        test_parameter: analysisName,
        test_method: selectedAnalysis.method || ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {order ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de muestra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sample">Muestra *</Label>
                <Select 
                  value={formData.sample_id} 
                  onValueChange={handleSampleSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar muestra" />
                  </SelectTrigger>
                  <SelectContent>
                    {samples.map((sample) => (
                      <SelectItem key={sample.id} value={sample.id}>
                        {sample.internal_number} - {sample.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="analysis">Análisis *</Label>
                <Select 
                  value={formData.test_parameter} 
                  onValueChange={handleAnalysisSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar análisis" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyses.map((analysis) => (
                      <SelectItem key={analysis.id} value={analysis.name}>
                        {analysis.name} ({analysis.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Método y técnico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Método de Análisis</Label>
                <Input
                  id="method"
                  value={formData.test_method}
                  onChange={(e) => handleInputChange('test_method', e.target.value)}
                  placeholder="Ej: NCh 409/1, APHA 3120"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technician">Técnico Asignado</Label>
                <Select 
                  value={formData.assigned_technician} 
                  onValueChange={(value) => handleInputChange('assigned_technician', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Equipos utilizados */}
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipos Utilizados</Label>
              <Input
                id="equipment"
                value={formData.equipment_used}
                onChange={(e) => handleInputChange('equipment_used', e.target.value)}
                placeholder="Ej: Espectrómetro ICP, Balanza analítica"
              />
            </div>

            {/* Estado y prioridad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {order ? 'Actualizar OT' : 'Crear OT'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}