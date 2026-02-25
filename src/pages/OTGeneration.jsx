
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sample, WorkOrder, Analysis, AnalysisTemplate } from "@/api/entities";
import { administrationService } from "@/api/services/administration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Play,
  RefreshCw,
  FlaskConical,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
  Search,
  ClipboardList,
  Calendar,
  Activity,
  Edit,
  Trash2,
  X
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Configuration for Work Order status badges
const statusConfig = {
  generada: { label: "Generada", color: "bg-blue-100 text-blue-800" },
  en_proceso: { label: "En Proceso", color: "bg-yellow-100 text-yellow-800" },
  completada: { label: "Completada", color: "bg-green-100 text-green-800" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

// Configuration for Work Order priority badges
const priorityConfig = {
  normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
  urgente: { label: "Urgente", color: "bg-orange-100 text-orange-800" },
  critica: { label: "Crítica", color: "bg-red-100 text-red-800" },
};

export default function OTGenerationPage() {
  const [pendingSamples, setPendingSamples] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectionMode, setSelectionMode] = useState("individual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneration, setLastGeneration] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // Set initial active tab to 'list'

  const [editingWorkOrder, setEditingWorkOrder] = useState(null); // Stores the WO being edited for the modal
  const [showEditModal, setShowEditModal] = useState(false); // Controls edit modal visibility

  const loadData = useCallback(async () => {
    try {
      // Cargar datos de forma independiente para que un error no bloquee todo
      let samples = [];
      let ordersData = [];
      let analysesData = [];
      let templatesData = [];

      try {
        samples = await Sample.getAll();
      } catch (error) {
        console.error("Error loading samples:", error);
      }

      try {
        ordersData = await WorkOrder.getAll();
      } catch (error) {
        console.warn("Work orders endpoint not available yet:", error.message);
        ordersData = [];
      }

      try {
        analysesData = await Analysis.getAll();
        console.log('📊 Análisis cargados:', analysesData);
        console.log('📊 Total análisis:', analysesData?.length);
      } catch (error) {
        console.error("Error loading analyses:", error);
      }

      try {
        templatesData = await AnalysisTemplate.getAll();
        console.log('📦 Plantillas cargadas:', templatesData);
        console.log('📦 Total plantillas:', templatesData?.length);
      } catch (error) {
        console.error("Error loading templates:", error);
      }

      // Filtrar muestras con estado 'recibida' en el frontend
      const receivedSamples = Array.isArray(samples) ? samples.filter(s => s.status === 'recibida') : [];
      
      // Ordenar las órdenes por fecha de creación (más recientes primero) en el frontend
      const sortedOrders = Array.isArray(ordersData) ? 
        [...ordersData].sort((a, b) => {
          const dateA = new Date(a.created_date || a.generated_at || 0);
          const dateB = new Date(b.created_date || b.generated_at || 0);
          return dateB - dateA;
        }) : [];
      
      // Transformar análisis y plantillas del formato backend al formato que espera el componente
      const transformedAnalyses = Array.isArray(analysesData) ? analysesData.map(a => ({
        id: a.idAnalisis || a.id,
        name: a.nombreAnalisis || a.name,
        code: a.codigo || a.code,
        method: a.metodoEnsayo || a.method,
        category: a.categoria || a.category,
        required_equipment: a.equiposRequeridos || a.required_equipment || [],
        status: a.estado || a.status
      })) : [];
      
      const transformedTemplates = Array.isArray(templatesData) ? templatesData.map(t => {
        const analisisIncluidos = t.analisisIncluidos || [];
        const analysisIds = Array.isArray(analisisIncluidos) 
          ? analisisIncluidos.map(a => a.idAnalisis || a.id || a)
          : [];
        
        return {
          id: t.idPlantilla || t.id,
          name: t.nombrePlantilla || t.name,
          description: t.descripcion || t.description,
          analysis_ids: analysisIds,
          status: t.estado || t.status
        };
      }) : [];
      
      console.log('✅ Análisis transformados:', transformedAnalyses.length);
      console.log('✅ Plantillas transformadas:', transformedTemplates.length);
      console.log('🔍 Primera plantilla transformada:', transformedTemplates[0]);
      
      setPendingSamples(receivedSamples);
      setWorkOrders(sortedOrders);
      setAnalyses(transformedAnalyses);
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar muestras cuando se selecciona un análisis o plantilla
  useEffect(() => {
    if (selectionMode === "individual" && selectedAnalysis) {
      console.log('🔍 Buscando muestras para análisis:', selectedAnalysis.name);
      console.log('🔍 Muestras pendientes:', pendingSamples.length);
      console.log('🔍 Primera muestra requested_tests:', pendingSamples[0]?.requested_tests);
      
      const samplesForAnalysis = pendingSamples.filter(sample => 
        sample.requested_tests && 
        Array.isArray(sample.requested_tests) &&
        sample.requested_tests.includes(selectedAnalysis.name)
      );
      console.log('✅ Muestras encontradas para análisis:', samplesForAnalysis.length);
      setFilteredSamples(samplesForAnalysis);
      setSelectedSamples([]);
    } else if (selectionMode === "template" && selectedTemplate) {
      console.log('🔍 Plantilla seleccionada:', selectedTemplate);
      console.log('🔍 analysis_ids de plantilla:', selectedTemplate.analysis_ids);
      console.log('🔍 Todos los análisis disponibles:', analyses.length);
      
      const templateAnalysisNames = analyses
        .filter(a => selectedTemplate.analysis_ids?.includes(a.id))
        .map(a => a.name);
      
      console.log('🔍 Nombres de análisis en plantilla:', templateAnalysisNames);
      console.log('🔍 Primera muestra requested_tests:', pendingSamples[0]?.requested_tests);
      
      const samplesForTemplate = pendingSamples.filter(sample => 
        sample.requested_tests && 
        Array.isArray(sample.requested_tests) &&
        templateAnalysisNames.every(analysisName => 
          sample.requested_tests.includes(analysisName)
        )
      );
      console.log('✅ Muestras encontradas para plantilla:', samplesForTemplate.length);
      setFilteredSamples(samplesForTemplate);
      setSelectedSamples([]);
    } else {
      setFilteredSamples([]);
      setSelectedSamples([]);
    }
  }, [selectedAnalysis, selectedTemplate, pendingSamples, selectionMode, analyses]);

  const handleAnalysisSelect = (analysis) => {
    setSelectedAnalysis(analysis);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSelectedAnalysis(null);
  };

  const handleSampleToggle = (sampleId) => {
    setSelectedSamples(prev => 
      prev.includes(sampleId)
        ? prev.filter(id => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSamples.length === filteredSamples.length) {
      setSelectedSamples([]);
    } else {
      setSelectedSamples(filteredSamples.map(s => s.id));
    }
  };

  const generateWorkOrder = async () => {
    if (selectedSamples.length === 0) return;
    
    setIsGenerating(true);
    try {
      const samples = filteredSamples.filter(s => selectedSamples.includes(s.id));
      
      let otData;
      if (selectionMode === "individual" && selectedAnalysis) {
        const otNumber = `OT-${Date.now().toString().slice(-6)}-${selectedAnalysis.code || 'AN'}`;
        
        otData = {
          ot_number: otNumber,
          analysis_type: selectedAnalysis.name,
          sample_ids: samples.map(s => s.id),
          sample_numbers: samples.map(s => s.internal_number).join(', '),
          sample_count: samples.length,
          test_parameter: selectedAnalysis.name,
          test_method: selectedAnalysis.method,
          status: "generada",
          priority: samples.some(s => s.priority === 'critica') ? 'critica' : 
                    samples.some(s => s.priority === 'urgente') ? 'urgente' : 'normal',
          generated_at: new Date().toISOString(),
          equipment_used: selectedAnalysis.required_equipment?.join('; ') || ''
        };
      } else if (selectionMode === "template" && selectedTemplate) {
        const otNumber = `OT-${Date.now().toString().slice(-6)}-TPL`;
        
        otData = {
          ot_number: otNumber,
          analysis_type: selectedTemplate.name,
          sample_ids: samples.map(s => s.id),
          sample_numbers: samples.map(s => s.internal_number).join(', '),
          sample_count: samples.length,
          test_parameter: selectedTemplate.name,
          test_method: `Plantilla: ${selectedTemplate.name}`,
          status: "generada",
          priority: samples.some(s => s.priority === 'critica') ? 'critica' : 
                    samples.some(s => s.priority === 'urgente') ? 'urgente' : 'normal',
          generated_at: new Date().toISOString()
        };
      }
      
      await WorkOrder.create(otData);
      
      const updatePromises = samples.map(sample => 
        Sample.update(sample.id, { status: 'en_preparacion' })
      );
      await Promise.all(updatePromises);
      
      setLastGeneration(new Date());
      setSelectedSamples([]);
      setSelectedAnalysis(null);
      setSelectedTemplate(null);
      setActiveTab("list");
      loadData();
    } catch (error) {
      console.error("Error generating work order:", error);
    }
    setIsGenerating(false);
  };

  const handleEditWorkOrder = (order) => {
    setEditingWorkOrder(order);
    setShowEditModal(true);
  };

  const handleUpdateWorkOrder = async (updatedData) => {
    if (!editingWorkOrder) return;
    try {
      await WorkOrder.update(editingWorkOrder.id, updatedData);
      setShowEditModal(false);
      setEditingWorkOrder(null);
      loadData(); // Refresh the list
    } catch (error) {
      console.error("Error updating work order:", error);
    }
  };

  const handleDeleteWorkOrder = async (orderId) => {
    if (confirm("¿Estás seguro de eliminar esta Orden de Trabajo? Las muestras asociadas no serán eliminadas.")) {
      try {
        await WorkOrder.delete(orderId);
        loadData();
      } catch (error) {
        console.error("Error deleting work order:", error);
      }
    }
  };

  const filteredAnalyses = analyses.filter(a =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplatesList = templates.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Órdenes de Trabajo</h1>
          <p className="text-gray-600">Genera y administra las OT del laboratorio</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={loadData}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            OT Generadas ({workOrders.length})
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Generar OT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          {workOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay OT generadas</h3>
                <p className="text-gray-600 mb-4">
                  Comienza generando tu primera orden de trabajo
                </p>
                <Button onClick={() => setActiveTab("generate")}>
                  <Play className="w-4 h-4 mr-2" />
                  Generar OT
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {workOrders.map((order) => {
                const currentStatus = order.status || 'generada';
                const statusInfo = statusConfig[currentStatus] || statusConfig.generada;
                const currentPriority = order.priority || 'normal';
                const priorityInfo = priorityConfig[currentPriority] || priorityConfig.normal;
                
                return (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {order.ot_number}
                              </h3>
                              <Badge className={`${priorityInfo.color} border`}>
                                {priorityInfo.label}
                              </Badge>
                              <Badge variant="outline" className={`${statusInfo.color} border text-xs`}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <FlaskConical className="w-4 h-4" />
                                <span>{order.sample_count} muestra{order.sample_count !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Análisis: {order.test_parameter}</span>
                              </div>
                              {order.generated_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {format(new Date(order.generated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditWorkOrder(order)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteWorkOrder(order.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Link to={`${createPageUrl("SampleWorkflow")}?otId=${order.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Activity className="w-4 h-4 mr-2" />
                              Ver Workflow
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Muestras Pendientes</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingSamples.length}</p>
                  </div>
                  <FlaskConical className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Análisis Disponibles</p>
                    <p className="text-3xl font-bold text-green-600">{analyses.length}</p>
                  </div>
                  <Package className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Última Generación</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lastGeneration ? format(lastGeneration, 'HH:mm', { locale: es }) : 'Nunca'}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Selecciona Análisis o Plantilla</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectionMode} onValueChange={setSelectionMode}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="individual" className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" />
                      Análisis Individual
                    </TabsTrigger>
                    <TabsTrigger value="template" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Plantilla
                    </TabsTrigger>
                  </TabsList>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <TabsContent value="individual" className="space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredAnalyses.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600">No hay análisis disponibles</p>
                      </div>
                    ) : (
                      filteredAnalyses.map((analysis) => {
                        const samplesCount = pendingSamples.filter(s => 
                          s.requested_tests?.includes(analysis.name)
                        ).length;
                        const isSelected = selectedAnalysis?.id === analysis.id;
                        
                        return (
                          <Card
                            key={analysis.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'border'
                            }`}
                            onClick={() => handleAnalysisSelect(analysis)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{analysis.name}</h4>
                                    <Badge variant="outline" className="text-xs">{analysis.code}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{analysis.method}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge className={samplesCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                      {samplesCount} muestras
                                    </Badge>
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-6 h-6 text-blue-600" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>

                  <TabsContent value="template" className="space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredTemplatesList.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600">No hay plantillas disponibles</p>
                      </div>
                    ) : (
                      filteredTemplatesList.map((template) => {
                        const templateAnalysisNames = analyses
                          .filter(a => template.analysis_ids?.includes(a.id))
                          .map(a => a.name);
                        
                        const samplesCount = pendingSamples.filter(sample => 
                          sample.requested_tests && 
                          templateAnalysisNames.every(name => sample.requested_tests.includes(name))
                        ).length;
                        
                        const isSelected = selectedTemplate?.id === template.id;
                        
                        return (
                          <Card
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'border'
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                                  {template.description && (
                                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {template.analysis_ids?.length || 0} análisis
                                    </Badge>
                                    <Badge className={samplesCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                      {samplesCount} muestras
                                    </Badge>
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-6 h-6 text-blue-600" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>2. Selecciona Muestras</CardTitle>
                {filteredSamples.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedSamples.length === filteredSamples.length ? 'Deseleccionar' : 'Seleccionar'} Todas
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!selectedAnalysis && !selectedTemplate ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecciona un análisis o plantilla
                    </h3>
                    <p className="text-gray-600">
                      Primero debes seleccionar un análisis o plantilla para ver las muestras compatibles
                    </p>
                  </div>
                ) : filteredSamples.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay muestras pendientes
                    </h3>
                    <p className="text-gray-600">
                      No hay muestras que requieran {selectionMode === 'individual' ? 'este análisis' : 'esta plantilla'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {filteredSamples.map((sample) => (
                      <Card
                        key={sample.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedSamples.includes(sample.id) ? 'border-2 border-blue-500 bg-blue-50' : 'border'
                        }`}
                        onClick={() => handleSampleToggle(sample.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedSamples.includes(sample.id)}
                              onCheckedChange={() => handleSampleToggle(sample.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{sample.internal_number}</span>
                                {sample.priority !== 'normal' && (
                                  <Badge className={
                                    sample.priority === 'critica' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                  }>
                                    {sample.priority}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Cliente: {sample.client_name}</p>
                                <p>Tipo: {sample.sample_type}</p>
                                <p className="text-xs">
                                  {format(new Date(sample.reception_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedSamples.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      OT Lista para Generar
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedSamples.length} muestra{selectedSamples.length !== 1 ? 's' : ''} seleccionada{selectedSamples.length !== 1 ? 's' : ''} para{' '}
                      {selectionMode === 'individual' ? selectedAnalysis?.name : selectedTemplate?.name}
                    </p>
                  </div>
                  <Button 
                    onClick={generateWorkOrder}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Generar OT
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de edición de OT */}
      <WorkOrderEditModal
        open={showEditModal}
        workOrder={editingWorkOrder}
        onSave={handleUpdateWorkOrder}
        onCancel={() => {
          setShowEditModal(false);
          setEditingWorkOrder(null);
        }}
      />
    </div>
  );
}

// Componente modal para editar OT - usando Dialog de shadcn/ui
function WorkOrderEditModal({ open, workOrder, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    analysis_type: '',
    test_parameter: '',
    assigned_technician: '',
    equipment_used: '',
    status: 'generada',
    priority: 'normal'
  });
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    if (workOrder) {
      setFormData({
        analysis_type: workOrder.analysis_type || '',
        test_parameter: workOrder.test_parameter || '',
        assigned_technician: workOrder.assigned_technician || '',
        equipment_used: workOrder.equipment_used || '',
        status: workOrder.status || 'generada',
        priority: workOrder.priority || 'normal'
      });
    }
  }, [workOrder]);

  // Load technicians (non-admin users) for the assignment dropdown
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const users = await administrationService.getActiveUsers();
        const nonAdminUsers = (Array.isArray(users) ? users : []).filter(u => {
          const rolName = (u.rol?.nombre || u.rol?.name || u.rol || '').toUpperCase();
          return rolName !== 'ADMINISTRADOR' && rolName !== 'ADMIN';
        });
        setTechnicians(nonAdminUsers);
      } catch (error) {
        console.error('Error loading technicians:', error);
        // Fallback: try with getAllUsers
        try {
          const allUsers = await administrationService.getAllUsers();
          const nonAdminUsers = (Array.isArray(allUsers) ? allUsers : []).filter(u => {
            const rolName = (u.rol?.nombre || u.rol?.name || u.rol || '').toUpperCase();
            return rolName !== 'ADMINISTRADOR' && rolName !== 'ADMIN' && u.activo !== false;
          });
          setTechnicians(nonAdminUsers);
        } catch (fallbackError) {
          console.error('Error loading users fallback:', fallbackError);
        }
      }
    };
    if (open) loadTechnicians();
  }, [open]);

  if (!workOrder) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const currentStatusInfo = statusConfig[formData.status] || statusConfig.generada;
  const currentPriorityInfo = priorityConfig[formData.priority] || priorityConfig.normal;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Orden de Trabajo</DialogTitle>
          <DialogDescription>OT: {workOrder.ot_number}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Información de solo lectura */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Información de la OT</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Número de OT</span>
                <p className="font-medium text-gray-900">{workOrder.ot_number}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Fecha de generación</span>
                <p className="font-medium text-gray-900">
                  {workOrder.generated_at ? format(new Date(workOrder.generated_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Muestras asociadas */}
            <div>
              <span className="text-gray-500 text-xs">Muestras asociadas</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {workOrder.sample_numbers ? 
                  workOrder.sample_numbers.split(',').map((num, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-white">
                      {num.trim()}
                    </Badge>
                  )) : (
                    <span className="text-sm text-gray-600">{workOrder.sample_count || 0} muestra(s)</span>
                  )
                }
              </div>
            </div>
          </div>

          {/* Campos editables */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analysis_type">Tipo de Análisis *</Label>
              <Input
                id="analysis_type"
                value={formData.analysis_type}
                onChange={(e) => setFormData({...formData, analysis_type: e.target.value})}
                placeholder="Ej: Análisis Microbiológico"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_technician">Técnico Asignado</Label>
              <Select
                value={formData.assigned_technician}
                onValueChange={(value) => setFormData({...formData, assigned_technician: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => {
                    const fullName = [tech.nombre, tech.apellido].filter(Boolean).join(' ') || tech.username || tech.email;
                    const rolLabel = tech.rol?.nombre || tech.rol?.name || '';
                    return (
                      <SelectItem key={tech.id} value={fullName}>
                        {fullName}{rolLabel ? ` (${rolLabel})` : ''}
                      </SelectItem>
                    );
                  })}
                  {technicians.length === 0 && (
                    <SelectItem value="_none" disabled>No hay técnicos disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment_used">Equipos Utilizados</Label>
              <Textarea
                id="equipment_used"
                value={formData.equipment_used}
                onChange={(e) => setFormData({...formData, equipment_used: e.target.value})}
                placeholder="Ej: Espectrofotómetro, Autoclave, etc."
                className="h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generada">Generada</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({...formData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
