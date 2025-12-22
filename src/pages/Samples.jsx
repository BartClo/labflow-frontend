import React, { useState, useEffect, useCallback } from "react";
import { Sample, Client } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FlaskConical,
  User,
  Calendar,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import SampleForm from "../components/samples/SampleForm";
import SampleDetails from "../components/samples/SampleDetails";

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

const statusConfig = {
  recibida: { color: "bg-blue-100 text-blue-800", label: "Recibida" },
  en_preparacion: { color: "bg-yellow-100 text-yellow-800", label: "En Preparación" },
  en_analisis: { color: "bg-purple-100 text-purple-800", label: "En Análisis" },
  completada: { color: "bg-green-100 text-green-800", label: "Completada" },
  entregada: { color: "bg-gray-100 text-gray-800", label: "Entregada" }
};

export default function SamplesPage() {
  const [samples, setSamples] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load data with better error handling
      let samplesData = [];
      let clientsData = [];
      
      try {
        samplesData = await Sample.getAll();
      } catch (sampleError) {
        console.error('Error loading samples:', sampleError);
        // Continue with empty samples array
      }
      
      try {
        clientsData = await Client.getAll();
      } catch (clientError) {
        console.error('Error loading clients:', clientError);
        // Continue with empty clients array
      }
      
      // Ensure samples is always an array
      const samplesArray = Array.isArray(samplesData) ? samplesData : [];
      const clientsArray = Array.isArray(clientsData) ? clientsData : [];
      
      setSamples(samplesArray);
      setClients(clientsArray);
      setFilteredSamples(samplesArray);
    } catch (error) {
      console.error("Error in loadData:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper function to safely filter samples
  const getSamplesCount = (status) => {
    if (!Array.isArray(samples)) return 0;
    return samples.filter(s => s.status === status).length;
  };

  useEffect(() => {
    if (searchTerm && Array.isArray(samples)) {
      const filtered = samples.filter(sample =>
        sample.internal_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.sample_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSamples(filtered);
    } else {
      setFilteredSamples(Array.isArray(samples) ? samples : []);
    }
  }, [searchTerm, samples]);

  const handleSampleSubmit = async (data) => {
    try {
      if (editingSample) {
        await Sample.update(editingSample.id, data);
      } else {
        await Sample.create(data);
      }
      
      setShowForm(false);
      setEditingSample(null);
      loadData();
    } catch (error) {
      console.error("Error saving sample:", error);
    }
  };

  const handleDeleteSample = async (sampleId) => {
    if (confirm("¿Estás seguro de eliminar esta muestra?")) {
      try {
        await Sample.delete(sampleId);
        loadData();
      } catch (error) {
        console.error("Error deleting sample:", error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Muestras</h1>
          <p className="text-gray-600">Registro y control de muestras de laboratorio</p>
        </div>
        <Button 
          onClick={() => {
            setEditingSample(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Muestra
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card key="total-samples">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Muestras</p>
                <p className="text-2xl font-bold">{samples.length}</p>
              </div>
              <FlaskConical className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card key="received-samples">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recibidas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getSamplesCount('recibida')}
                </p>
              </div>
              <FlaskConical className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card key="in-analysis-samples">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Análisis</p>
                <p className="text-2xl font-bold text-purple-600">
                  {getSamplesCount('en_analisis')}
                </p>
              </div>
              <FlaskConical className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card key="completed-samples">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {getSamplesCount('completada')}
                </p>
              </div>
              <FlaskConical className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por número interno, cliente o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de muestras */}
      <div className="grid gap-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredSamples.length === 0 ? (
          <Card key="no-samples">
            <CardContent className="text-center py-12">
              <FlaskConical className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay muestras registradas</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? "No se encontraron muestras que coincidan con la búsqueda"
                  : "Comienza registrando tu primera muestra"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSamples.map((sample) => {
            const sampleTypeIcon = sampleTypeIcons[sample.sample_type] || "🧪";
            const statusInfo = statusConfig[sample.status] || statusConfig.recibida;
            const priorityInfo = priorityConfig[sample.priority] || priorityConfig.normal;
            
            return (
              <Card key={sample.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">
                        {sampleTypeIcon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {sample.internal_number}
                          </h3>
                          <Badge className={`${statusInfo.color} border`}>
                            {statusInfo.label}
                          </Badge>
                          {sample.priority !== 'normal' && (
                            <Badge className={`${priorityInfo.color} border`}>
                              {priorityInfo.label}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{sample.client_name || 'Cliente no especificado'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="capitalize">{sample.sample_type}</span>
                          </div>
                          {sample.reception_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(sample.reception_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                          )}
                        </div>

                        {sample.requested_tests && sample.requested_tests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sample.requested_tests.slice(0, 3).map((test, i) => (
                              <Badge key={`${sample.id}-test-${i}`} variant="outline" className="text-xs">
                                {test}
                              </Badge>
                            ))}
                            {sample.requested_tests.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{sample.requested_tests.length - 3} más
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
                        onClick={() => setSelectedSample(sample)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSample(sample);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSample(sample.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <SampleForm
          sample={editingSample}
          clients={clients}
          onSubmit={handleSampleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingSample(null);
          }}
        />
      )}

      {/* Modal de detalles */}
      {selectedSample && (
        <SampleDetails
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
          onEdit={() => {
            setEditingSample(selectedSample);
            setShowForm(true);
            setSelectedSample(null);
          }}
        />
      )}
    </div>
  );
}