import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2,
  Clock,
  Play,
  Circle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  pendiente: { 
    color: "bg-gray-200",
    textColor: "text-gray-600",
    icon: Clock,
    label: "Pendiente"
  },
  en_progreso: { 
    color: "bg-blue-500",
    textColor: "text-blue-600",
    icon: Play,
    label: "En Progreso"
  },
  completado: { 
    color: "bg-green-500",
    textColor: "text-green-600",
    icon: CheckCircle2,
    label: "Completado"
  },
  pausado: { 
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    icon: AlertCircle,
    label: "Pausado"
  },
  fallido: { 
    color: "bg-red-500",
    textColor: "text-red-600",
    icon: AlertCircle,
    label: "Fallido"
  }
};

export default function WorkflowTimeline({ 
  workflowSteps, 
  workOrder, 
  sample, 
  onStepClick, 
  onStatusUpdate, 
  isLoading 
}) {
  if (isLoading) {
    return (
      <Card className="h-[calc(100vh-180px)]">
        <CardHeader>
          <CardTitle>Flujo de Trabajo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex items-center justify-between px-4 w-full">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedSteps = workflowSteps.filter(step => step.status === 'completado').length;
  const totalSteps = workflowSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="border-0 shadow-lg h-[calc(100vh-180px)] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Flujo de Trabajo</CardTitle>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-2xl text-blue-600">{completedSteps}</span> de {totalSteps} pasos completados
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        {/* Stepper horizontal */}
        <div className="relative w-full py-16">
          {/* Línea de fondo */}
          <div className="absolute top-[80px] left-0 right-0 h-2 bg-gray-200 mx-[64px]" />
          
          {/* Línea de progreso */}
          <div 
            className="absolute top-[80px] left-[64px] h-2 bg-blue-500 transition-all duration-500 rounded-full"
            style={{ 
              width: `calc(${progressPercentage}% - 64px)` 
            }}
          />
          
          {/* Pasos */}
          <div className="relative flex justify-between items-start">
            {workflowSteps.map((step, index) => {
              const config = statusConfig[step.status] || statusConfig.pendiente;
              const StatusIcon = config.icon;
              const isCompleted = step.status === 'completado';
              const isInProgress = step.status === 'en_progreso';
              const isClickable = step.status !== 'pendiente';
              
              return (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center gap-4 flex-1"
                  style={{ maxWidth: `${100 / workflowSteps.length}%` }}
                >
                  {/* Círculo con ícono - más grande */}
                  <button
                    onClick={() => isClickable && onStepClick && onStepClick(step)}
                    disabled={!isClickable}
                    className={`
                      relative z-10 w-20 h-20 rounded-full flex items-center justify-center
                      transition-all duration-300 border-4 border-white shadow-xl
                      ${isCompleted ? 'bg-green-500' : ''}
                      ${isInProgress ? 'bg-blue-500 animate-pulse' : ''}
                      ${step.status === 'pendiente' ? 'bg-gray-200' : ''}
                      ${step.status === 'pausado' ? 'bg-yellow-500' : ''}
                      ${step.status === 'fallido' ? 'bg-red-500' : ''}
                      ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                    `}
                  >
                    <StatusIcon className={`w-10 h-10 ${
                      isCompleted || isInProgress ? 'text-white' : 'text-gray-400'
                    }`} />
                  </button>
                  
                  {/* Información del paso - más grande */}
                  <div className="text-center space-y-2 px-2">
                    <p className={`font-semibold text-base ${
                      isCompleted || isInProgress ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.step_name}
                    </p>
                    
                    {step.assigned_to && (
                      <p className="text-sm text-gray-600">
                        {step.assigned_to}
                      </p>
                    )}
                    
                    {step.completed_at && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(step.completed_at), 'dd/MM HH:mm', { locale: es })}
                      </p>
                    )}
                    
                    {step.status === 'en_progreso' && !step.completed_at && step.started_at && (
                      <p className="text-sm text-blue-600 font-medium">
                        Desde {format(new Date(step.started_at), 'HH:mm', { locale: es })}
                      </p>
                    )}
                    
                    {/* Badge de estado */}
                    <Badge className={`${
                      isCompleted ? 'bg-green-100 text-green-800' :
                      isInProgress ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    } text-xs px-2 py-1`}>
                      {config.label}
                    </Badge>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="mt-2">
                    {isInProgress && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate && onStatusUpdate(step.id, 'completado');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completar
                      </Button>
                    )}
                    
                    {step.status === 'pendiente' && index === workflowSteps.findIndex(s => s.status === 'pendiente') && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate && onStatusUpdate(step.id, 'en_progreso');
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}