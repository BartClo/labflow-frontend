import React, { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Administration } from "@/api/entities";

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

export default function WorkOrderForm({ order, samples, analyses, onSubmit, onCancel }) {
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    assigned_technician: order?.assigned_technician || '',
    status: order?.status || 'generada',
    priority: order?.priority || 'normal'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Cargar técnicos activos del backend
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const users = await Administration.getActiveUsers();
        // Mapear usuarios a formato de técnicos (nombre completo)
        const techList = users.map(user => ({
          id: user.id,
          name: `${user.nombre} ${user.apellido}`,
          email: user.email
        }));
        setTechnicians(techList);
      } catch (error) {
        console.error('Error loading technicians:', error);
        // Fallback a lista vacía si falla
        setTechnicians([]);
      }
    };
    loadTechnicians();
  }, []);

  useEffect(() => {
    // Bloquear scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    
    // Cerrar con tecla Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);

  const modal = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]" onClick={onCancel}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between px-6 py-6 space-y-0 bg-white rounded-t-xl">
          <CardTitle>
            {order ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Técnico Asignado */}
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
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
}