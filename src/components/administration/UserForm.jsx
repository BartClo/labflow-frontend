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

      if (!user && (!formData.password || formData.password.length < 8)) {
        setError("La contraseña es requerida y debe tener al menos 8 caracteres para nuevos usuarios");
        setIsLoading(false);
        return;
      }

      if (!formData.rolId) {
        setError("Por favor selecciona un rol");
        setIsLoading(false);
        return;
      }

      if (!formData.fechaNacimiento) {
        setError("La fecha de nacimiento es requerida");
        setIsLoading(false);
        return;
      }

      // Validar que la fecha de nacimiento sea válida y que el usuario sea mayor de 18 años
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        setError("El usuario debe ser mayor de 18 años");
        setIsLoading(false);
        return;
      }

      if (birthDate >= today) {
        setError("La fecha de nacimiento debe ser en el pasado");
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
        rolId: formData.rolId, // Mantener como UUID string
        activo: formData.activo === true || formData.activo === "true"
      };

      if (formData.password) {
        requestData.password = formData.password;
      }

      // Log detallado de cada campo
      console.log('=== DATOS DETALLADOS ===');
      console.log('nombre:', `"${requestData.nombre}" (length: ${requestData.nombre?.length})`);
      console.log('apellido:', `"${requestData.apellido}" (length: ${requestData.apellido?.length})`);
      console.log('email:', `"${requestData.email}" (length: ${requestData.email?.length})`);
      console.log('username:', `"${requestData.username}" (length: ${requestData.username?.length})`);
      console.log('password:', `"${requestData.password}" (length: ${requestData.password?.length})`);
      console.log('telefono:', `"${requestData.telefono}"`);
      console.log('direccion:', `"${requestData.direccion}"`);
      console.log('fechaNacimiento:', `"${requestData.fechaNacimiento}"`);
      console.log('rolId:', `"${requestData.rolId}" (type: ${typeof requestData.rolId})`);
      console.log('activo:', requestData.activo);
      console.log('=== FIN DATOS DETALLADOS ===');

      console.log('Datos del formulario antes de envío:', formData);
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
                  Contraseña {user ? '(dejar en blanco para no cambiar)' : '* (mínimo 8 caracteres)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  required={!user}
                  minLength={8}
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
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  required
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
