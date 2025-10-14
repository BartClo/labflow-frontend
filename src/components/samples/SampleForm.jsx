import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, QrCode, FlaskConical, Package } from "lucide-react";
import { AnalysisTemplate, Analysis } from "@/api/entities";

const sampleTypes = [
  { value: "agua", label: "Agua" },
  { value: "suelo", label: "Suelo" },
  { value: "aire", label: "Aire" },
  { value: "alimentos", label: "Alimentos" },
  { value: "otros", label: "Otros" }
];

const priorities = [
  { value: "normal", label: "Normal" },
  { value: "urgente", label: "Urgente" },
  { value: "critica", label: "Crítica" }
];

const samplingPoints = [
  { value: "laboratorio_uss_santiago", label: "Laboratorio Universidad San Sebastián - Sede Santiago" },
  { value: "efluente_planta", label: "Efluente Planta Procesamiento" },
  { value: "pozo_agua", label: "Pozo de Agua Potable" },
  { value: "suelo_agricola", label: "Suelo Agrícola" },
  { value: "aire_ambiente", label: "Aire Ambiente" }
];

const containerTypes = [
  { value: "frasco_vidrio", label: "Frasco de vidrio" },
  { value: "frasco_plastico", label: "Frasco de plástico" },
  { value: "bolsa_esteril", label: "Bolsa estéril" },
  { value: "tubo_ensayo", label: "Tubo de ensayo" },
  { value: "otro", label: "Otro" }
];

const preservationMethods = [
  { value: "refrigerado", label: "Refrigerado" },
  { value: "congelado", label: "Congelado" },
  { value: "acidificado", label: "Acidificado" },
  { value: "sin_preservacion", label: "Sin preservación" },
  { value: "otro", label: "Otro" }
];

// Análisis individuales disponibles
const availableTests = [
  "pH y Conductividad",
  "Turbidez",
  "Metales Pesados",
  "Análisis Microbiológico",
  "DBO y DQO",
  "Sólidos Totales",
  "Coliformes",
  "Pesticidas"
];

export default function SampleForm({ sample, clients, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    internal_number: sample?.internal_number || '',
    scanned_barcode: sample?.scanned_barcode || '',
    client_id: sample?.client_id || '',
    client_name: sample?.client_name || '',
    sampling_point: sample?.sampling_point || '',
    sample_type: sample?.sample_type || 'agua',
    reception_date: sample?.reception_date || new Date().toISOString().slice(0, 16),
    transport_conditions: {
      temperature: sample?.transport_conditions?.temperature || '',
      container_type: sample?.transport_conditions?.container_type || '',
      preservation: sample?.transport_conditions?.preservation || ''
    },
    received_by: sample?.received_by || '',
    sample_condition: sample?.sample_condition || 'aceptable',
    requested_tests: sample?.requested_tests || [],
    completion_date: sample?.completion_date || '',
    observations: sample?.observations || '',
    priority: sample?.priority || 'normal',
    status: sample?.status || 'recibida'
  });

  const [templates, setTemplates] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [analysisSelectionMode, setAnalysisSelectionMode] = useState('individual');

  useEffect(() => {
    loadTemplatesAndAnalyses();
  }, []);

  useEffect(() => {
    if (!sample && !formData.internal_number) {
      setFormData(prev => ({
        ...prev,
        internal_number: `MU-${Date.now().toString().slice(-6)}`
      }));
    }
  }, [sample, formData.internal_number]);

  const loadTemplatesAndAnalyses = async () => {
    try {
      const [templatesData, analysesData] = await Promise.all([
        AnalysisTemplate.list(),
        Analysis.list()
      ]);
      setTemplates(templatesData.filter(t => t.status === 'activo'));
      setAnalyses(analysesData.filter(a => a.status === 'activo'));
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleClientSelect = (clientId) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        client_id: clientId,
        client_name: selectedClient.name
      }));
    }
  };

  const handleBarcodeScanner = () => {
    const scannedCode = `BC-${Date.now().toString().slice(-8)}`;
    setFormData(prev => ({
      ...prev,
      scanned_barcode: scannedCode,
      internal_number: `MU-${scannedCode.split('-')[1]}`
    }));
  };

  const handleTestToggle = (test) => {
    setFormData(prev => ({
      ...prev,
      requested_tests: prev.requested_tests.includes(test)
        ? prev.requested_tests.filter(t => t !== test)
        : [...prev.requested_tests, test]
    }));
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      
      // Obtener nombres de análisis de la plantilla
      const templateAnalyses = analyses
        .filter(a => template.analysis_ids.includes(a.id))
        .map(a => a.name);
      
      setFormData(prev => ({
        ...prev,
        requested_tests: templateAnalyses
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const filteredTemplates = templates.filter(t => 
    t.sample_types && t.sample_types.includes(formData.sample_type)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {sample ? 'Editar Muestra' : 'Ingresar Nueva Muestra'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="internal_number">Número Interno</Label>
                <Input
                  id="internal_number"
                  value={formData.internal_number}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">Se genera automáticamente</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="barcode_scanner">Código de Barras</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode_scanner"
                    value={formData.scanned_barcode}
                    placeholder="Código escaneado aparecerá aquí"
                    readOnly
                  />
                  <Button type="button" variant="outline" onClick={handleBarcodeScanner}>
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={handleClientSelect}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sampling_point">Punto de Muestreo *</Label>
                <Select 
                  value={formData.sampling_point} 
                  onValueChange={(value) => handleInputChange('sampling_point', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar punto de muestreo" />
                  </SelectTrigger>
                  <SelectContent>
                    {samplingPoints.map((point) => (
                      <SelectItem key={point.value} value={point.value}>
                        {point.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sample_type">Tipo de Muestra *</Label>
                <Select 
                  value={formData.sample_type} 
                  onValueChange={(value) => {
                    handleInputChange('sample_type', value);
                    // Limpiar análisis seleccionados al cambiar tipo
                    setFormData(prev => ({ ...prev, requested_tests: [] }));
                    setSelectedTemplate(null);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Condiciones de transporte */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Condiciones de Transporte</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    value={formData.transport_conditions.temperature}
                    onChange={(e) => handleInputChange('transport_conditions.temperature', e.target.value)}
                    placeholder="Ej: 4°C"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="container_type">Tipo de Contenedor</Label>
                  <Select 
                    value={formData.transport_conditions.container_type} 
                    onValueChange={(value) => handleInputChange('transport_conditions.container_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar contenedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {containerTypes.map((container) => (
                        <SelectItem key={container.value} value={container.value}>
                          {container.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preservation">Preservación</Label>
                  <Select 
                    value={formData.transport_conditions.preservation} 
                    onValueChange={(value) => handleInputChange('transport_conditions.preservation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Método de preservación" />
                    </SelectTrigger>
                    <SelectContent>
                      {preservationMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Datos de recepción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reception_date">Fecha de Recepción *</Label>
                <Input
                  id="reception_date"
                  type="datetime-local"
                  value={formData.reception_date}
                  onChange={(e) => handleInputChange('reception_date', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="received_by">Recibida por *</Label>
                <Input
                  id="received_by"
                  value={formData.received_by}
                  onChange={(e) => handleInputChange('received_by', e.target.value)}
                  placeholder="Nombre del técnico"
                  required
                />
              </div>
            </div>

            {/* Análisis solicitados con tabs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <Label className="text-lg font-semibold">Análisis Solicitados *</Label>
              </div>
              
              <Tabs value={analysisSelectionMode} onValueChange={setAnalysisSelectionMode}>
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="individual" className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Individuales
                  </TabsTrigger>
                  <TabsTrigger value="template" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Por Plantilla
                  </TabsTrigger>
                </TabsList>

                {/* Tab de análisis individuales */}
                <TabsContent value="individual" className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Selecciona los análisis individuales que necesita esta muestra
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableTests.map((test) => (
                      <Badge
                        key={test}
                        variant={formData.requested_tests.includes(test) ? "default" : "outline"}
                        className="cursor-pointer px-4 py-3 text-sm hover:opacity-80 transition-opacity justify-center"
                        onClick={() => handleTestToggle(test)}
                      >
                        {test}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab de plantillas */}
                <TabsContent value="template" className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Selecciona una plantilla predefinida de análisis para este tipo de muestra
                  </p>
                  
                  {filteredTemplates.length === 0 ? (
                    <Card className="border-2 border-dashed">
                      <CardContent className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 mb-2">
                          No hay plantillas disponibles para muestras de tipo "{formData.sample_type}"
                        </p>
                        <p className="text-sm text-gray-500">
                          Cambia a "Individuales" para seleccionar análisis específicos
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredTemplates.map((template) => {
                        const templateAnalyses = analyses.filter(a => 
                          template.analysis_ids?.includes(a.id)
                        );
                        const isSelected = selectedTemplate?.id === template.id;
                        
                        return (
                          <Card 
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'border'
                            }`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {template.name}
                                  </h4>
                                  {template.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {template.description}
                                    </p>
                                  )}
                                </div>
                                {isSelected && (
                                  <Badge className="bg-blue-600 text-white">
                                    Seleccionada
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span>{templateAnalyses.length} análisis</span>
                                {template.total_price && (
                                  <span>${template.total_price.toLocaleString()}</span>
                                )}
                                {template.estimated_duration_days && (
                                  <span>{template.estimated_duration_days} días</span>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {templateAnalyses.slice(0, 5).map((analysis) => (
                                  <Badge 
                                    key={analysis.id} 
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {analysis.name}
                                  </Badge>
                                ))}
                                {templateAnalyses.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{templateAnalyses.length - 5} más
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {formData.requested_tests.length === 0 && (
                <p className="text-sm text-red-600">
                  Selecciona al menos un análisis o una plantilla
                </p>
              )}
              
              {formData.requested_tests.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      Análisis seleccionados ({formData.requested_tests.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.requested_tests.map((test) => (
                        <Badge key={test} className="bg-green-600 text-white">
                          {test}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                placeholder="Observaciones adicionales"
                className="h-24"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={formData.requested_tests.length === 0 || !formData.client_id}
              >
                {sample ? 'Actualizar Muestra' : 'Registrar Muestra'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}