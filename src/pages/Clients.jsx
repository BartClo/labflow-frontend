
import React, { useState, useEffect, useCallback } from "react";
import { Client, Quote, Sample } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  BarChart3,
  Users,
  Trash2
} from "lucide-react";

import ClientForm from "../components/clients/ClientForm";
import ClientDetails from "../components/clients/ClientDetails";
import ConfirmDialog from "../components/ui/confirm-dialog";
import NotificationDialog from "../components/ui/notification-dialog";

const clientTypeConfig = {
  empresa: { label: "Empresa", color: "bg-blue-100 text-blue-800" },
  particular: { label: "Particular", color: "bg-green-100 text-green-800" },
  gobierno: { label: "Gobierno", color: "bg-purple-100 text-purple-800" },
  investigacion: { label: "Investigación", color: "bg-orange-100 text-orange-800" }
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientStats, setClientStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    client: null
  });
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const applyFilters = useCallback(() => {
    let filtered = clients;
    
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  useEffect(() => {
    loadClients();
  }, []);

  // Reload stats when the component receives focus (useful when coming back from samples page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        reloadClientStats();
      }
    };

    const handleFocus = () => {
      reloadClientStats();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [clients]); // Depend on clients so it only runs after clients are loaded

  // Function to reload client statistics (useful when samples are created/updated)
  const reloadClientStats = async () => {
    try {
      let samplesData = [];
      let quotesData = [];
      
      try {
        samplesData = await Sample.getAll();
        samplesData = Array.isArray(samplesData) ? samplesData : [];
      } catch (sampleError) {
        console.error('Error reloading samples for stats:', sampleError);
      }
      
      try {
        quotesData = await Quote.getAll ? await Quote.getAll() : [];
        quotesData = Array.isArray(quotesData) ? quotesData : [];
      } catch (quoteError) {
        console.warn('Quotes service not available, continuing without quote stats:', quoteError.message);
        quotesData = []; // Fallback to empty array
      }
      
      // Recalculate statistics for existing clients
      const stats = {};
      clients.forEach(client => {
        const clientSamples = samplesData.filter(sample => 
          sample.client_id === client.id || sample.idCliente === client.id
        );
        
        const clientQuotes = quotesData.filter(quote => 
          quote.client_id === client.id || quote.idCliente === client.id
        );
        
        stats[client.id] = {
          quotes: clientQuotes.length,
          samples: clientSamples.length
        };
      });
      
      setClientStats(stats);
    } catch (error) {
      console.error("Error reloading client stats:", error);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      // Load clients
      const clientsData = await Client.list('-created_date');
      const clientsArray = Array.isArray(clientsData) ? clientsData : [];
      setClients(clientsArray);
      
      // Load samples to calculate real statistics
      let samplesData = [];
      let quotesData = [];
      
      try {
        samplesData = await Sample.getAll();
        samplesData = Array.isArray(samplesData) ? samplesData : [];
        console.log('📊 Loaded samples for client stats:', samplesData.length);
      console.log('🔍 Sample client IDs found:', [...new Set(samplesData.map(s => s.client_id || s.idCliente).filter(Boolean))]);
      
      console.log('📋 All clients loaded:', clientsArray.map(c => ({ id: c.id, name: c.name })));
      } catch (sampleError) {
        console.error('Error loading samples for stats:', sampleError);
      }
      
      try {
        quotesData = await Quote.getAll ? await Quote.getAll() : [];
        quotesData = Array.isArray(quotesData) ? quotesData : [];
        console.log('📊 Loaded quotes for client stats:', quotesData.length);
      } catch (quoteError) {
        console.warn('Quotes service not available, continuing without quote stats:', quoteError.message);
        quotesData = []; // Fallback to empty array
      }
      
      // Calculate real statistics for each client
      const stats = {};
      clientsArray.forEach(client => {
        // Count samples for this client
        const clientSamples = samplesData.filter(sample => {
          return sample.client_id === client.id || sample.idCliente === client.id;
        });
        
        // Count quotes for this client  
        const clientQuotes = quotesData.filter(quote => 
          quote.client_id === client.id || quote.idCliente === client.id
        );
        
        stats[client.id] = {
          quotes: clientQuotes.length,
          samples: clientSamples.length
        };
        
        if (clientSamples.length > 0) {
          console.log(`📋 Client ${client.name} (ID: ${client.id}) has ${clientSamples.length} samples`);
        }
      });
      
      console.log('📊 Final client statistics:', stats);
      setClientStats(stats);
      
    } catch (error) {
      console.error("Error loading clients:", error);
    }
    setIsLoading(false);
  };

  const handleClientSubmit = async (clientData) => {
    try {
      // Map frontend form data to backend DTO format
      const backendData = {
        nombreCliente: clientData.name || clientData.nombreCliente,
        empresa: clientData.company || '',
        email: clientData.email || '',
        telefono: clientData.phone || '',
        direccion: clientData.address || '',
        personaContacto: clientData.contact_person || '',
        tipoCliente: clientData.client_type || '',
        activo: clientData.status === 'activo'
      };
      
      let result;
      if (selectedClient) {
        result = await Client.update(selectedClient.id, backendData);
        console.log('Cliente actualizado:', result);
      } else {
        result = await Client.create(backendData);
        console.log('Cliente creado:', result);
      }
      
      setShowForm(false);
      setSelectedClient(null);
      loadClients();
      
      // Show success notification
      const successMessage = selectedClient ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente';
      const successTitle = selectedClient ? 'Cliente Actualizado' : 'Cliente Creado';
      showNotification('success', successTitle, successMessage);
      
    } catch (error) {
      console.error("Error saving client:", error);
      
      // Show error notification
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar cliente';
      showNotification('error', 'Error', errorMessage);
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = (client) => {
    // Show custom confirmation dialog
    setConfirmDialog({
      isOpen: true,
      client: client
    });
  };

  const confirmDeleteClient = async () => {
    const client = confirmDialog.client;
    
    // Close dialog first
    setConfirmDialog({ isOpen: false, client: null });

    try {
      await Client.delete(client.id);
      console.log('Cliente eliminado:', client.name);
      
      // Reload the clients list
      loadClients();
      
      // Show success notification
      showNotification('success', 'Cliente Eliminado', 'Cliente eliminado correctamente');
      
    } catch (error) {
      console.error("Error deleting client:", error);
      
      // Show error notification
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar cliente';
      showNotification('error', 'Error', errorMessage);
    }
  };

  const cancelDeleteClient = () => {
    setConfirmDialog({ isOpen: false, client: null });
  };

  const showNotification = (type, title, message) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeNotification = () => {
    setNotification({
      isOpen: false,
      type: 'info',
      title: '',
      message: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra tu cartera de clientes y su historial</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, empresa o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? "No se encontraron clientes que coincidan con la búsqueda"
                  : "Comienza registrando tu primer cliente"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {client.name}
                        </h3>
                        <Badge className={`${clientTypeConfig[client.client_type]?.color || clientTypeConfig.empresa.color} border`}>
                          {clientTypeConfig[client.client_type]?.label || "Empresa"}
                        </Badge>
                        {client.status === 'inactivo' && (
                          <Badge variant="secondary">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {client.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{client.company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Estadísticas */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{clientStats[client.id]?.quotes || 0} cotizaciones</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{clientStats[client.id]?.samples || 0} muestras</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(client)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClient(client)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <ClientForm
          client={selectedClient}
          onSubmit={handleClientSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Modal de detalles */}
      {selectedClient && !showForm && (
        <ClientDetails
          client={selectedClient}
          stats={clientStats[selectedClient.id]}
          onEdit={() => setShowForm(true)}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Eliminar Cliente"
        message={confirmDialog.client ? 
          `¿Estás seguro de que deseas eliminar al cliente "${confirmDialog.client.name}"?\n\nEsta acción no se puede deshacer.` : 
          ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDeleteClient}
        onCancel={cancelDeleteClient}
      />

      {/* Diálogo de notificaciones */}
      <NotificationDialog
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
}
