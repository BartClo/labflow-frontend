import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FlaskConical,
  Edit,
  Trash2,
  Clock,
  DollarSign
} from "lucide-react";

const categoryConfig = {
  microbiologico: { color: "bg-purple-100 text-purple-800", label: "Microbiológico" },
  fisico_quimico: { color: "bg-blue-100 text-blue-800", label: "Físico-Químico" },
  metales_pesados: { color: "bg-orange-100 text-orange-800", label: "Metales Pesados" },
  organicos: { color: "bg-green-100 text-green-800", label: "Orgánicos" },
  otros: { color: "bg-gray-100 text-gray-800", label: "Otros" }
};

export default function AnalysisList({ analyses, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FlaskConical className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay análisis</h3>
          <p className="text-gray-600">Comienza creando tu primer análisis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {analyses.map((analysis) => {
        const categoryInfo = categoryConfig[analysis.category] || categoryConfig.otros;
        
        return (
          <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {analysis.name}
                      </h3>
                      <Badge variant="outline" className="font-mono">
                        {analysis.code}
                      </Badge>
                      <Badge className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Método: {analysis.method}</span>
                      {analysis.estimated_duration_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{analysis.estimated_duration_hours}h</span>
                        </div>
                      )}
                      {analysis.price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${analysis.price.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {analysis.description && (
                      <p className="text-sm text-gray-500 max-w-2xl">
                        {analysis.description}
                      </p>
                    )}
                    
                    {analysis.parameters && analysis.parameters.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Parámetros:</span>
                        {analysis.parameters.slice(0, 3).map((param, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {param.parameter_name}
                          </Badge>
                        ))}
                        {analysis.parameters.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{analysis.parameters.length - 3} más
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(analysis)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(analysis.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}