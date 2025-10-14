import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  User,
  Activity,
  CheckCircle,
  Play,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const activityIcons = {
  completado: CheckCircle,
  en_progreso: Play,
  pendiente: Clock
};

const activityColors = {
  completado: {
    icon: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200"
  },
  en_progreso: {
    icon: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200"
  },
  pendiente: {
    icon: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200"
  }
};

export default function ActivityHistory({ workOrderId, workflowSteps }) {
  // Crear historial basado en los pasos del workflow
  const activities = workflowSteps
    .filter(step => step.started_at || step.completed_at)
    .map(step => {
      const activities = [];
      
      if (step.started_at) {
        activities.push({
          id: `${step.id}-started`,
          type: 'en_progreso',
          title: `Iniciado: ${step.step_name}`,
          description: `Paso iniciado por ${step.assigned_to || 'Sistema'}`,
          timestamp: step.started_at,
          user: step.assigned_to
        });
      }
      
      if (step.completed_at) {
        activities.push({
          id: `${step.id}-completed`, 
          type: 'completado',
          title: `Completado: ${step.step_name}`,
          description: `Paso completado exitosamente`,
          timestamp: step.completed_at,
          user: step.assigned_to
        });
      }
      
      return activities;
    })
    .flat()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Historial de Actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No hay actividad registrada</p>
          </div>
        ) : (
          <div className="relative">
            {/* Línea vertical de la timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {activities.map((activity, index) => {
                const ActivityIcon = activityIcons[activity.type] || Activity;
                const colors = activityColors[activity.type] || activityColors.pendiente;
                
                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Ícono en la línea */}
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                      <ActivityIcon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    
                    {/* Contenido de la actividad */}
                    <div className="flex-1 pb-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {activity.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(activity.timestamp), 'dd/MM HH:mm', { locale: es })}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        
                        {activity.user && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            {activity.user}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}