import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical,
  User,
  Calendar,
  MapPin,
  Tag,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const sampleTypeIcons = {
  agua: "💧",
  suelo: "🌍",
  aire: "💨",
  alimentos: "🍃",
  otros: "🧪"
};

const priorityConfig = {
  normal: { color: "bg-gray-100 text-gray-800", label: "Normal" },
  urgente: { color: "bg-orange-100 text-orange-800", label: "Urgente" },
  critica: { color: "bg-red-100 text-red-800", label: "Crítica" }
};

export default function SampleInfo({ sample }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="w-5 h-5" />
          Información de la Muestra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {sampleTypeIcons[sample.sample_type] || "🧪"}
          </div>
          <div>
            <p className="font-semibold text-lg">{sample.internal_number}</p>
            <p className="text-sm text-gray-600 capitalize">
              {sample.sample_type?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Cliente:</span>
            <span>{sample.client_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Punto:</span>
            <span>{sample.sampling_point}</span>
          </div>
          
          {sample.reception_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Recibida:</span>
              <span>
                {format(new Date(sample.reception_date), 'dd/MM/yyyy', { locale: es })}
              </span>
            </div>
          )}
          
          {sample.completion_date && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Fecha límite:</span>
              <span>
                {format(new Date(sample.completion_date), 'dd/MM/yyyy', { locale: es })}
              </span>
            </div>
          )}
        </div>

        {/* Prioridad */}
        {sample.priority && sample.priority !== 'normal' && (
          <div className="pt-2">
            <Badge className={`${priorityConfig[sample.priority]?.color || priorityConfig.normal.color} border`}>
              <Tag className="w-3 h-3 mr-1" />
              {priorityConfig[sample.priority]?.label || sample.priority}
            </Badge>
          </div>
        )}

        {/* Análisis solicitados */}
        {sample.requested_tests && sample.requested_tests.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Análisis Solicitados:</p>
            <div className="space-y-1">
              {sample.requested_tests.map((test, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {test}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}