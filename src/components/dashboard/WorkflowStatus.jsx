import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FlaskConical, 
  ClipboardCheck, 
  Microscope, 
  CheckCircle 
} from "lucide-react";

const workflowSteps = [
  { 
    key: 'generada', 
    label: 'Generadas', 
    icon: FlaskConical, 
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    progressColor: 'bg-blue-500'
  },
  { 
    key: 'en_preparacion', 
    label: 'En Preparación', 
    icon: ClipboardCheck, 
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    progressColor: 'bg-orange-500'
  },
  { 
    key: 'en_analisis', 
    label: 'En Análisis', 
    icon: Microscope, 
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    progressColor: 'bg-purple-500'
  },
  { 
    key: 'completada', 
    label: 'Completadas', 
    icon: CheckCircle, 
    color: 'text-green-600',
    bg: 'bg-green-50',
    progressColor: 'bg-green-500'
  }
];

export default function WorkflowStatus({ workflowStats, isLoading }) {
  const total = Object.values(workflowStats).reduce((sum, count) => sum + count, 0);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Estado del Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workflowSteps.map((step) => (
            <Skeleton key={step.key} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900">Estado del Workflow</CardTitle>
        <p className="text-xs text-gray-600">Distribución de OTs por etapa de proceso</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-around">
        {workflowSteps.map((step) => {
          const count = workflowStats[step.key] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={step.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${step.bg}`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <span className="font-medium text-sm text-gray-900">{step.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{count} OT{count !== 1 ? 's' : ''}</span>
                  <span className="text-base font-semibold text-gray-900 w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${step.progressColor} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}