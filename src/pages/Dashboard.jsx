
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
  const [allSamples, setAllSamples] = useState([]);
  const [allWorkOrders, setAllWorkOrders] = useState([]);
  const [urgentOrders, setUrgentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load data with proper error handling
      let clientsData = [];
      let quotesData = [];
      let samplesData = [];
      let workOrdersData = [];
      
      try {
        clientsData = await Client.getAll();
      } catch (clientError) {
        console.error('Error loading clients:', clientError);
      }
      
      try {
        quotesData = await Quote.getAll ? await Quote.getAll() : [];
      } catch (quoteError) {
        // Backend does not have /quotes endpoint yet — silently default to 0
        quotesData = [];
      }
      
      try {
        samplesData = await Sample.getAll();
      } catch (sampleError) {
        console.error('Error loading samples:', sampleError);
      }
      
      try {
        workOrdersData = await WorkOrder.getAll ? await WorkOrder.getAll() : [];
      } catch (workOrderError) {
        console.error('Error loading work orders:', workOrderError);
        workOrdersData = [];
      }
      
      // Ensure arrays
      const clientsArray = Array.isArray(clientsData) ? clientsData : [];
      const quotesArray = Array.isArray(quotesData) ? quotesData : [];
      const samplesArray = Array.isArray(samplesData) ? samplesData : [];
      const workOrdersArray = Array.isArray(workOrdersData) ? workOrdersData : [];
      

      
      setStats({
        clients: clientsArray.length,
        quotes: quotesArray.length,
        samples: samplesArray.filter(s => s.status !== 'completada' && s.status !== 'entregada').length,
        workOrders: workOrdersArray.length
      });
      
      // Sort samples by reception date (most recent first)
      const sortedSamples = samplesArray.sort((a, b) => {
        const dateA = new Date(a.reception_date || a.created_at || 0);
        const dateB = new Date(b.reception_date || b.created_at || 0);
        return dateB - dateA;
      });
      
      setAllSamples(samplesArray);
      setAllWorkOrders(workOrdersArray);
      setRecentSamples(sortedSamples.slice(0, 10));
      setUrgentOrders(workOrdersArray.filter(wo => wo.priority === 'urgente' || wo.priority === 'critica'));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getSampleStats = () => {
    const statusCounts = {
      recibida: 0,
      en_proceso: 0,
      analizada: 0,
      completada: 0,
      rechazada: 0
    };

    // Count samples by their status
    allSamples.forEach(sample => {
      const status = (sample.status || '').toLowerCase();

      if (status === 'completada' || status === 'finalizada') {
        statusCounts.completada++;
      } else if (status === 'rechazada' || status === 'cancelada') {
        statusCounts.rechazada++;
      } else if (status === 'analizada') {
        statusCounts.analizada++;
      } else if (status === 'en_proceso' || status === 'en_progreso') {
        statusCounts.en_proceso++;
      } else {
        // recibida, pendiente, or others
        statusCounts.recibida++;
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
          {/* Estado de las muestras */}
          <div className="h-full">
            <WorkflowStatus
              sampleStats={getSampleStats()}
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
