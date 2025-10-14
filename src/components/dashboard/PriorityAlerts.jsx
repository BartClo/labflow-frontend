import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  Clock,
  Eye,
  CheckCircle
} from "lucide-react";

const priorityConfig = {
  critica: {
    color: "bg-red-100 text-red-800",
    icon: AlertTriangle,
    iconColor: "text-red-600"
  },
  urgente: {
    color: "bg-orange-100 text-orange-800", 
    icon: Clock,
    iconColor: "text-orange-600"
  }
};

export default function PriorityAlerts({ urgentOrders, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Alertas de Prioridad</CardTitle>
          <p className="text-xs text-gray-600">OT urgentes</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900">Alertas de Prioridad</CardTitle>
        <p className="text-xs text-gray-600">OT urgentes que requieren atención</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {urgentOrders.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">No hay OT urgentes pendientes</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 flex-1 flex flex-col justify-around">
            {urgentOrders.slice(0, 4).map((order) => {
              const config = priorityConfig[order.priority];
              const Icon = config ? config.icon : AlertTriangle;
              
              return (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                      order.priority === 'critica' ? 'bg-red-50' : 'bg-orange-50'
                    }`}>
                      <Icon className={`w-4 h-4 ${config ? config.iconColor : 'text-gray-600'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {order.ot_number}
                        </span>
                        <Badge className={`${config ? config.color : 'bg-gray-100 text-gray-800'} text-xs`}>
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {order.test_parameter} • {order.sample_internal_number}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}