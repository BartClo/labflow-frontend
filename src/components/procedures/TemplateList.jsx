import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package,
  Eye,
  Edit,
  Trash2,
  FlaskConical,
  DollarSign,
  Calendar
} from "lucide-react";

export default function TemplateList({ templates, analyses, isLoading, onView, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array(3).fill(0).map((_, i) => (
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

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
          <p className="text-gray-600">Comienza creando tu primera plantilla de procedimientos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {templates.map((template) => {
        const analysisCount = template.analysis_ids?.length || 0;
        
        return (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <Badge variant="outline">
                        {analysisCount} análisis
                      </Badge>
                    </div>
                    
                    {template.description && (
                      <p className="text-sm text-gray-600 max-w-2xl">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      {template.sample_types && (
                        <div className="flex items-center gap-2">
                          <span>Tipos de muestra:</span>
                          {template.sample_types.slice(0, 2).map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs capitalize">
                              {type}
                            </Badge>
                          ))}
                          {template.sample_types.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.sample_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {template.total_price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${template.total_price.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {template.estimated_duration_days && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{template.estimated_duration_days} días</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(template)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(template)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(template.id)}
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