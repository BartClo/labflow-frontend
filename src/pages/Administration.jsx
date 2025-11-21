import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Shield } from "lucide-react";

import UserManagement from "../components/administration/UserManagement";
import RoleManagement from "../components/administration/RoleManagement";
import SystemSettings from "../components/administration/SystemSettings";
import UserStatistics from "../components/administration/UserStatistics";

export default function AdministrationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("estadisticas");

  // Check if user is admin
  const isAdmin = user?.rol?.nombre === "ADMINISTRADOR" || user?.rol === "ADMINISTRADOR";
  
  if (!isAdmin) {
    return <Navigate to="/Dashboard" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administración</h1>
          <p className="text-gray-600">Gestiona usuarios, roles y configuraciones del sistema</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
          <TabsTrigger value="estadisticas" className="data-[state=active]:bg-white">
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-white">
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-white">
            Roles
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white">
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estadisticas" className="space-y-4">
          <UserStatistics />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
