import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Edit, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  BarChart3,
  FlaskConical
} from "lucide-react";

const clientTypeConfig = {
  empresa: { label: "Empresa", color: "bg-blue-100 text-blue-800 border-blue-200" },
  particular: { label: "Particular", color: "bg-green-100 text-green-800 border-green-200" },
  gobierno: { label: "Gobierno", color: "bg-purple-100 text-purple-800 border-purple-200" },
  investigacion: { label: "Investigación", color: "bg-orange-100 text-orange-800 border-orange-200" }
};

export default function ClientDetails({ client, stats, onEdit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{client.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${clientTypeConfig[client.client_type]?.color || clientTypeConfig.empresa.color} border`}>
                  {clientTypeConfig[client.client_type]?.label || "Empresa"}
                </Badge>
                {client.status === 'inactivo' && (
                  <Badge variant="secondary">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onEdit} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats?.quotes || 0}
                    </p>
                    <p className="text-sm text-blue-700">Cotizaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {stats?.samples || 0}
                    </p>
                    <p className="text-sm text-green-700">Muestras</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {client.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Empresa</p>
                      <p className="font-medium">{client.company}</p>
                    </div>
                  </div>
                )}
                
                {client.contact_person && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Persona de Contacto</p>
                      <p className="font-medium">{client.contact_person}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dirección */}
          {client.address && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dirección</h3>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <p>{client.address}</p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fecha de Registro</p>
                <p className="font-medium">
                  {client.created_date 
                    ? new Date(client.created_date).toLocaleDateString('es-ES') 
                    : 'No disponible'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-500">Última Actualización</p>
                <p className="font-medium">
                  {client.updated_date 
                    ? new Date(client.updated_date).toLocaleDateString('es-ES')
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}