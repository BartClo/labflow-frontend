import React, { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { administrationService } from "@/api/services";

const PERMISOS_DISPONIBLES = [
  { id: 'MANAGE_USERS', label: 'Gestionar Usuarios' },
  { id: 'MANAGE_ROLES', label: 'Gestionar Roles' },
  { id: 'MANAGE_CLIENTES', label: 'Gestionar Clientes' },
  { id: 'MANAGE_ANALISIS', label: 'Gestionar Análisis' },
  { id: 'MANAGE_PLANTILLAS', label: 'Gestionar Plantillas' },
  { id: 'MANAGE_MUESTRAS', label: 'Gestionar Muestras' },
  { id: 'VIEW_REPORTS', label: 'Ver Reportes' },
  { id: 'MANAGE_SYSTEM', label: 'Gestionar Sistema' }
];

export default function RoleForm({ role, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    permisos: [],
    activo: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role) {
      setFormData({
        nombre: role.nombre || "",
        descripcion: role.descripcion || "",
        permisos: role.permisos || [],
        activo: role.activo !== false
      });
    }
  }, [role]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePermiso = (permisoId) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permisoId)
        ? prev.permisos.filter(p => p !== permisoId)
        : [...prev.permisos, permisoId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!formData.nombre) {
        setError("El nombre del rol es requerido");
        setIsLoading(false);
        return;
      }

      const requestData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        permisos: formData.permisos,
        activo: formData.activo
      };

      if (role) {
        await administrationService.updateRole(role.id, requestData);
      } else {
        await administrationService.createRole(requestData);
      }

      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar rol");
    } finally {
      setIsLoading(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {role ? 'Editar Rol' : 'Nuevo Rol'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Rol *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="ej: Técnico, Supervisor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder="Describa el propósito de este rol"
              />
            </div>

            {/* Permisos */}
            <div className="space-y-3">
              <Label>Permisos</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                {PERMISOS_DISPONIBLES.map((permiso) => (
                  <div key={permiso.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permiso.id}
                      checked={formData.permisos.includes(permiso.id)}
                      onCheckedChange={() => togglePermiso(permiso.id)}
                    />
                    <label
                      htmlFor={permiso.id}
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {permiso.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => handleInputChange('activo', checked)}
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
                Rol activo
              </label>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : role ? 'Actualizar Rol' : 'Crear Rol'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
}
