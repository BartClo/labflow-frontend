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

// Función de utilidad para limpiar texto
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\\n/g, ' ')     // \n como texto literal
    .replace(/\n/g, ' ')      // salto de línea real
    .replace(/\\r/g, ' ')     // \r como texto literal  
    .replace(/\r/g, ' ')      // retorno de carro real
    .replace(/\t/g, ' ')      // tabs
    .replace(/\s{2,}/g, ' ')  // múltiples espacios a uno solo
    .trim();                  // espacios al inicio/final
};

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
        const analysisCount = 1; // Each template represents one analysis
        
        return (
          <Card key={template.idPlantilla} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header with title and badges */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {cleanText(template.nombrePlantilla)}
                        </h3>
                        {template.estado && (
                          <Badge variant={template.estado === 'Activo' ? 'default' : 'secondary'}>
                            {template.estado}
                          </Badge>
                        )}
                      </div>
                      
                      {template.idPlantilla && (
                        <div className="mt-1">
                          <Badge variant="outline" className="font-mono text-xs break-all">
                            ID: {template.idPlantilla}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
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
                      onClick={() => onDelete(template.idPlantilla)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Description */}
                {template.descripcion && (
                  <div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {cleanText(template.descripcion)}
                    </p>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  {template.tiposMuestraAplicables && template.tiposMuestraAplicables.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tipos de muestra:</span>
                      <div className="flex gap-1">
                        {template.tiposMuestraAplicables.slice(0, 3).map((type, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {template.tiposMuestraAplicables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tiposMuestraAplicables.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {template.analisisIncluidos !== undefined && (
                    <div className="flex items-center gap-1">
                      <FlaskConical className="w-4 h-4" />
                      <span>{template.analisisIncluidos.length} análisis incluidos</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}