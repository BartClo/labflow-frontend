import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  X,
  Save,
  Calendar,
  User,
  Clock,
  Settings,
  FileText,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function WorkflowDetails({ step, workOrder, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    notes: step.notes || '',
    method_used: step.method_used || '',
    equipment_used: step.equipment_used?.join(', ') || '',
    results: {
      parameter: step.results?.parameter || '',
      value: step.results?.value || '',
      unit: step.results?.unit || '',
      limit: step.results?.limit || '',
      within_limits: step.results?.within_limits || false
    }
  });

  const handleSave = async () => {
    const updateData = {
      ...formData,
      equipment_used: formData.equipment_used.split(',').map(eq => eq.trim()).filter(eq => eq),
      results: {
        ...formData.results,
        value: parseFloat(formData.results.value) || 0,
        limit: parseFloat(formData.results.limit) || 0
      }
    };

    await onUpdate(step.id, step.status, updateData);
    setIsEditing(false);
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">
          Detalles del Paso: {step.step_name}
        </CardTitle>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Información general */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Asignado a:</span>
              <span>{step.assigned_to || 'No asignado'}</span>
            </div>
            
            {step.started_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Iniciado:</span>
                <span>
                  {format(new Date(step.started_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
            )}
            
            {step.completed_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Completado:</span>
                <span>
                  {format(new Date(step.completed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
            )}
            
            {step.duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Duración:</span>
                <span>{step.duration_minutes} minutos</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Badge 
              className={`inline-flex ${
                step.status === 'completado' ? 'bg-green-100 text-green-800' :
                step.status === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {step.status?.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        {/* Método utilizado */}
        <div className="space-y-2">
          <Label htmlFor="method">Método Utilizado</Label>
          {isEditing ? (
            <Input
              id="method"
              value={formData.method_used}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                method_used: e.target.value
              }))}
              placeholder="Ej: NCh 409/1"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">
              {step.method_used || 'No especificado'}
            </div>
          )}
        </div>

        {/* Equipos utilizados */}
        <div className="space-y-2">
          <Label htmlFor="equipment">Equipos Utilizados</Label>
          {isEditing ? (
            <Input
              id="equipment"
              value={formData.equipment_used}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                equipment_used: e.target.value
              }))}
              placeholder="Separar por comas: Equipo1, Equipo2"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">
              {step.equipment_used?.join(', ') || 'No especificado'}
            </div>
          )}
        </div>

        {/* Resultados */}
        {(step.results || isEditing) && (
          <div className="space-y-4">
            <h4 className="font-semibold">Resultados del Análisis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parameter">Parámetro</Label>
                {isEditing ? (
                  <Input
                    id="parameter"
                    value={formData.results.parameter}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      results: { ...prev.results, parameter: e.target.value }
                    }))}
                    placeholder="Ej: Plomo (Pb)"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded">
                    {step.results?.parameter || '-'}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">Valor</Label>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        id="value"
                        type="number"
                        step="0.001"
                        value={formData.results.value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          results: { ...prev.results, value: e.target.value }
                        }))}
                        placeholder="0.000"
                        className="flex-1"
                      />
                      <Input
                        value={formData.results.unit}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          results: { ...prev.results, unit: e.target.value }
                        }))}
                        placeholder="mg/L"
                        className="w-20"
                      />
                    </>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded flex-1">
                      {step.results?.value ? 
                        `${step.results.value} ${step.results.unit || ''}` : 
                        '-'
                      }
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit">Límite</Label>
                {isEditing ? (
                  <Input
                    id="limit"
                    type="number"
                    step="0.001"
                    value={formData.results.limit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      results: { ...prev.results, limit: e.target.value }
                    }))}
                    placeholder="0.000"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded">
                    {step.results?.limit || '-'}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Dentro de límites</Label>
                <div className="p-2">
                  {step.results?.within_limits !== undefined ? (
                    <Badge className={
                      step.results.within_limits 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {step.results.within_limits ? 'Sí' : 'No'}
                    </Badge>
                  ) : '-'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div className="space-y-2">
          <Label htmlFor="notes">Observaciones</Label>
          {isEditing ? (
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="Agregar observaciones del proceso..."
              className="h-24"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg min-h-[60px]">
              {step.notes || 'Sin observaciones'}
            </div>
          )}
        </div>

        {/* Archivos adjuntos */}
        <div className="space-y-2">
          <Label>Archivos Adjuntos</Label>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Subir Archivo
            </Button>
            {step.attachments && step.attachments.length > 0 && (
              <div className="flex gap-2">
                {step.attachments.map((attachment, i) => (
                  <Button key={i} variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Archivo {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}