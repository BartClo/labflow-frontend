import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Shield, Briefcase } from "lucide-react";
import { administrationService } from "@/api/services";

export default function UserStatistics() {
  const [statistics, setStatistics] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    administradores: 0,
    trabajadores: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await administrationService.getUserStatistics();
      setStatistics(response);
    } catch (err) {
      console.error("Error loading statistics:", err);
      setError("Error al cargar las estadísticas");
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{isLoading ? '-' : value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Usuarios"
          value={statistics.totalUsuarios}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Usuarios Activos"
          value={statistics.usuariosActivos}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Administradores"
          value={statistics.administradores}
          icon={Shield}
          color="bg-purple-500"
        />
        <StatCard
          title="Trabajadores"
          value={statistics.trabajadores}
          icon={Briefcase}
          color="bg-orange-500"
        />
      </div>

      {!isLoading && (
        <div className="text-sm text-gray-500 text-center">
          Última actualización: {new Date().toLocaleTimeString('es-CL')}
        </div>
      )}
    </div>
  );
}
