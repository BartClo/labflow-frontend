import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FlaskConical,
  Calendar,
  User,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  recibida: { color: "bg-blue-100 text-blue-800", label: "Recibida" },
  en_preparacion: { color: "bg-orange-100 text-orange-800", label: "En Preparación" },
  en_analisis: { color: "bg-purple-100 text-purple-800", label: "En Análisis" },
  completada: { color: "bg-green-100 text-green-800", label: "Completada" },
  entregada: { color: "bg-gray-100 text-gray-800", label: "Entregada" }
};

const sampleTypeConfig = {
  agua: { icon: "💧", label: "Agua" },
  suelo: { icon: "🌍", label: "Suelo" },
  aire: { icon: "💨", label: "Aire" },
  alimentos: { icon: "🍃", label: "Alimentos" },
  otros: { icon: "🧪", label: "Otros" }
};

export default function RecentActivity({ recentSamples, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Actividad Reciente</CardTitle>
        <p className="text-sm text-gray-600">Últimas muestras ingresadas al sistema</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSamples.length === 0 ? (
          <div className="text-center py-6">
            <FlaskConical className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No hay muestras recientes</p>
          </div>
        ) : (
          recentSamples.map((sample) => {
            const statusInfo = statusConfig[sample.status] || statusConfig.recibida;
            const sampleInfo = sampleTypeConfig[sample.sample_type] || sampleTypeConfig.otros;
            
            return (
              <div 
                key={sample.id} 
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-lg">{sampleInfo.icon}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {sample.internal_number || `Muestra ${sample.id?.slice(-6)}`}
                    </p>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{sample.client_name || 'Cliente no especificado'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{sample.sampling_point}</span>
                    </div>
                    {sample.reception_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(sample.reception_date), 'dd/MM HH:mm', { locale: es })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {sampleInfo.label}
                  </p>
                  {sample.priority && sample.priority !== 'normal' && (
                    <Badge variant="outline" className="text-xs">
                      {sample.priority}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}