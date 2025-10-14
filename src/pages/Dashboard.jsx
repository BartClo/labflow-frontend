
import React, { useState, useEffect } from "react";
import { 
  Client, 
  Quote, 
  Sample, 
  WorkOrder 
} from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3,
  Users,
  FlaskConical,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import WorkflowStatus from "../components/dashboard/WorkflowStatus";
import PriorityAlerts from "../components/dashboard/PriorityAlerts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    quotes: 0,
    samples: 0,
    workOrders: 0
  });
  const [recentSamples, setRecentSamples] = useState([]);
  const [urgentOrders, setUrgentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [clients, quotes, samples, workOrders] = await Promise.all([
        Client.list(),
        Quote.list(),
        Sample.list('-reception_date', 10),
        WorkOrder.list('-created_date', 10)
      ]);
      
      setStats({
        clients: clients.length,
        quotes: quotes.length,
        samples: samples.length,
        workOrders: workOrders.length
      });
      
      setRecentSamples(samples);
      setUrgentOrders(workOrders.filter(wo => wo.priority === 'urgente' || wo.priority === 'critica'));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getWorkflowStats = () => {
    const statusCounts = {
      recibida: 0,
      en_preparacion: 0,
      en_analisis: 0,
      completada: 0
    };
    
    recentSamples.forEach(sample => {
      if (statusCounts.hasOwnProperty(sample.status)) {
        statusCounts[sample.status]++;
      }
    });
    
    return statusCounts;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600">Resumen general del laboratorio y actividades recientes</p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Clientes Activos"
          value={stats.clients}
          icon={Users}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Cotizaciones"
          value={stats.quotes}
          icon={BarChart3}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Muestras en Proceso"
          value={stats.samples}
          icon={FlaskConical}
          color="purple"
          isLoading={isLoading}
        />
        <StatsCard
          title="OT Activas"
          value={stats.workOrders}
          icon={ClipboardList}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      {/* Fila principal de contenido con altura igual */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Estado del workflow */}
        <div className="h-full">
          <WorkflowStatus 
            workflowStats={getWorkflowStats()}
            isLoading={isLoading}
          />
        </div>

        {/* Alertas de prioridad */}
        <div className="h-full">
          <PriorityAlerts 
            urgentOrders={urgentOrders}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Actividad reciente */}
      <div>
        <RecentActivity 
          recentSamples={recentSamples}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
