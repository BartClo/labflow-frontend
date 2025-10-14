import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X,
  Calendar,
  User,
  Activity,
  CheckCircle,
  Play,
  Clock,
  ChevronLeft,
  ChevronRight,
  Lightbulb
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
    border: "border-green-200",
    cardBg: "bg-green-50"
  },
  en_progreso: {
    icon: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    cardBg: "bg-blue-50"
  },
  pendiente: {
    icon: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    cardBg: "bg-gray-50"
  }
};

export default function ActivityHistoryModal({ workOrderId, workflowSteps, onClose }) {
  const scrollContainerRef = React.useRef(null);

  // Crear historial basado en los pasos del workflow
  const activities = workflowSteps
    .filter(step => step.started_at || step.completed_at)
    .map(step => {
      const activities = [];
      
      if (step.started_at) {
        activities.push({
          id: `${step.id}-started`,
          type: 'en_progreso',
          title: 'Iniciado',
          stepName: step.step_name,
          description: `Paso iniciado por ${step.assigned_to || 'Sistema'}`,
          timestamp: step.started_at,
          user: step.assigned_to
        });
      }
      
      if (step.completed_at) {
        activities.push({
          id: `${step.id}-completed`, 
          type: 'completado',
          title: 'Completado',
          stepName: step.step_name,
          description: `Paso completado exitosamente`,
          timestamp: step.completed_at,
          user: step.assigned_to
        });
      }
      
      return activities;
    })
    .flat()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-[95vw] h-[80vh]">
        <CardHeader className="border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Insights - Historial de Actividad</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Seguimiento detallado del proceso</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 flex-1 overflow-hidden">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No hay actividad registrada</p>
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              {/* Botón scroll izquierda */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {/* Contenedor con scroll horizontal */}
              <div 
                ref={scrollContainerRef}
                className="flex items-center gap-6 overflow-x-auto pb-4 h-full px-12 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Línea horizontal conectora */}
                <div className="absolute top-[140px] left-12 right-12 h-1 bg-gray-200" />
                <div 
                  className="absolute top-[140px] left-12 h-1 bg-blue-500 transition-all duration-500"
                  style={{ width: `calc(${(activities.filter(a => a.type === 'completado').length / activities.length) * 100}% - 48px)` }}
                />

                {activities.map((activity, index) => {
                  const ActivityIcon = activityIcons[activity.type] || Activity;
                  const colors = activityColors[activity.type] || activityColors.pendiente;
                  
                  return (
                    <div key={activity.id} className="flex flex-col items-center gap-4 flex-shrink-0 relative" style={{ width: '280px' }}>
                      {/* Ícono */}
                      <div className={`relative z-10 w-16 h-16 rounded-full ${colors.bg} border-4 ${colors.border} flex items-center justify-center shadow-lg bg-white`}>
                        <ActivityIcon className={`w-8 h-8 ${colors.icon}`} />
                      </div>

                      {/* Card de información */}
                      <div className={`w-full ${colors.cardBg} border-2 ${colors.border} rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow`}>
                        <div className="space-y-3">
                          <div>
                            <Badge className={`mb-2 ${
                              activity.type === 'completado' ? 'bg-green-100 text-green-800' :
                              activity.type === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.title}
                            </Badge>
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                              {activity.stepName}
                            </h4>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{format(new Date(activity.timestamp), 'dd/MM/yyyy', { locale: es })}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{format(new Date(activity.timestamp), 'HH:mm', { locale: es })}</span>
                          </div>
                          
                          {activity.user && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <User className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{activity.user}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Línea conectora al siguiente elemento */}
                      {index < activities.length - 1 && (
                        <div className="absolute top-8 left-full w-6 h-0.5 bg-gray-300 z-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botón scroll derecha */}
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}