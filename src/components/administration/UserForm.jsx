import React, { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { administrationService } from "@/api/services";

export default function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    password: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
    rolId: "",
    activo: true
  });
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRoles();
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        username: user.username || "",
        password: "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        fechaNacimiento: user.fechaNacimiento || "",
        rolId: user.rol?.id || "",
        activo: user.activo !== false
      });
    }
  }, [user]);

  const loadRoles = async () => {
    try {
      const response = await administrationService.getAllRoles();
      console.log('Roles cargados:', response);
      setRoles(response);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!formData.nombre || !formData.email || !formData.username) {
        setError("Por favor completa los campos requeridos");
        setIsLoading(false);
        return;
      }

      if (!user && !formData.password) {
        setError("La contraseña es requerida para nuevos usuarios");
        setIsLoading(false);
        return;
      }

      if (!formData.rolId) {
        setError("Por favor selecciona un rol");
        setIsLoading(false);
        return;
      }

      const requestData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        username: formData.username,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fechaNacimiento: formData.fechaNacimiento,
        rolId: String(formData.rolId), // Asegurar que sea string
        activo: formData.activo === true || formData.activo === "true"
      };

      if (formData.password) {
        requestData.password = formData.password;
      }

      console.log('Enviando datos:', requestData);

      if (user) {
        await administrationService.updateUser(user.id, requestData);
      } else {
        await administrationService.createUser(requestData);
      }

      onSave();
    } catch (err) {
      console.error('Error completo:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || "Error al guardar usuario";
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
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
            {/* Información personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Juan"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            {/* Usuario y Contraseña */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="juan123"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña {user ? '(dejar en blanco para no cambiar)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  required={!user}
                />
              </div>
            </div>

            {/* Dirección y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Calle Principal 123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                />
              </div>
            </div>

            {/* Rol y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rolId">Rol *</Label>
                <select
                  id="rolId"
                  value={formData.rolId}
                  onChange={(e) => handleInputChange('rolId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="activo">Estado *</Label>
                <select
                  id="activo"
                  value={formData.activo ? "activo" : "inactivo"}
                  onChange={(e) => handleInputChange('activo', e.target.value === 'activo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
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
                {isLoading ? 'Guardando...' : user ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
}
