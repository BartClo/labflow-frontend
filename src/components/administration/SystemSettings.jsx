import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Database, Lock, Bell } from "lucide-react";

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Información del Sistema
          </CardTitle>
          <CardDescription>
            Detalles y estadísticas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Versión del Sistema</p>
              <p className="text-xl font-bold text-blue-900">1.0.0</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Estado del Sistema</p>
              <p className="text-xl font-bold text-green-900">Operativo</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600">Última Actualización</p>
              <p className="text-xl font-bold text-purple-900">21/11/2025</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-xl font-bold text-orange-900">5</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Configuración de Seguridad
          </CardTitle>
          <CardDescription>
            Gestiona la seguridad del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Autenticación de Dos Factores</p>
                <p className="text-sm text-gray-600">Requiere autenticación de dos factores para todos los usuarios</p>
              </div>
              <Button variant="outline" disabled>Configurar</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Política de Contraseñas</p>
                <p className="text-sm text-gray-600">Define requisitos mínimos para contraseñas</p>
              </div>
              <Button variant="outline" disabled>Configurar</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sesiones Activas</p>
                <p className="text-sm text-gray-600">Gestiona sesiones de usuarios activos</p>
              </div>
              <Button variant="outline">Ver Sesiones</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Base de Datos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Base de Datos
          </CardTitle>
          <CardDescription>
            Operaciones de mantenimiento de base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Respaldar Base de Datos</p>
                <p className="text-sm text-gray-600">Crea una copia de seguridad de todos los datos</p>
              </div>
              <Button variant="outline">Respaldar Ahora</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Optimizar Base de Datos</p>
                <p className="text-sm text-gray-600">Optimiza el rendimiento de la base de datos</p>
              </div>
              <Button variant="outline" disabled>Optimizar</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Limpiar Caché</p>
                <p className="text-sm text-gray-600">Limpia la memoria caché del sistema</p>
              </div>
              <Button variant="outline">Limpiar Caché</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura preferencias de notificaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-600">Recibe alertas del sistema por correo</p>
              </div>
              <Button variant="outline" disabled>Configurar</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Alertas de Error</p>
                <p className="text-sm text-gray-600">Notificaciones cuando hay errores en el sistema</p>
              </div>
              <Button variant="outline" disabled>Configurar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
