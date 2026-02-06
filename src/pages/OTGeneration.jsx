
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { WorkOrder, Analysis, AnalysisTemplate, Task } from "@/api/entities";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  X,
  User
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
  const { user } = useAuth();
  const [pendingTasks, setPendingTasks] = useState([]); // Tareas pendientes del backend
  const [pendingTasksByAnalysis, setPendingTasksByAnalysis] = useState({}); // Conteo por análisis
  const [workOrders, setWorkOrders] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]); // Tareas filtradas por análisis
  const [selectedTasks, setSelectedTasks] = useState([]); // IDs de tareas seleccionadas
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
      let ordersData = [];
      let analysesData = [];
      let templatesData = [];
      let tasksData = [];
      let tasksByAnalysisData = {};

      try {
        ordersData = await WorkOrder.getAll();
        console.log('📋 Órdenes de trabajo cargadas:', ordersData);
      } catch (error) {
        console.warn("Work orders endpoint not available yet:", error.message);
        ordersData = [];
      }

      try {
        analysesData = await Analysis.getAll();
        console.log('📊 Análisis cargados:', analysesData);
      } catch (error) {
        console.error("Error loading analyses:", error);
      }

      try {
        templatesData = await AnalysisTemplate.getAll();
        console.log('📦 Plantillas cargadas:', templatesData);
      } catch (error) {
        console.error("Error loading templates:", error);
      }

      // Cargar tareas pendientes (sin OT asignada)
      try {
        tasksData = await Task.getPendingTasks();
        console.log('📝 Tareas pendientes cargadas:', tasksData);
      } catch (error) {
        console.error("Error loading pending tasks:", error);
      }

      // Cargar conteo de tareas por análisis
      try {
        tasksByAnalysisData = await Task.getPendingTasksByAnalysis();
        console.log('📊 Tareas por análisis:', tasksByAnalysisData);
      } catch (error) {
        console.error("Error loading tasks by analysis:", error);
      }

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
      console.log('✅ Tareas pendientes:', tasksData.length);
      
      setPendingTasks(tasksData);
      setPendingTasksByAnalysis(tasksByAnalysisData);
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

  // Función para ordenar tareas por prioridad y fecha
  const sortTasksByPriorityAndDate = (tasks) => {
    const priorityOrder = { 'alta': 0, 'critica': 0, 'media': 1, 'urgente': 1, 'baja': 2, 'normal': 2 };
    
    return [...tasks].sort((a, b) => {
      // Primero ordenar por prioridad (alta/crítica > media/urgente > baja/normal)
      const priorityA = priorityOrder[a.priority?.toLowerCase()] ?? 2;
      const priorityB = priorityOrder[b.priority?.toLowerCase()] ?? 2;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Si tienen la misma prioridad, ordenar por fecha (más antiguas primero)
      const dateA = new Date(a.date_added || 0);
      const dateB = new Date(b.date_added || 0);
      return dateA - dateB;
    });
  };

  // Filtrar tareas cuando se selecciona un análisis
  useEffect(() => {
    if (selectionMode === "individual" && selectedAnalysis) {
      console.log('🔍 Buscando tareas para análisis:', selectedAnalysis.name, 'ID:', selectedAnalysis.id);
      console.log('🔍 Total tareas pendientes:', pendingTasks.length);
      
      // Filtrar tareas que corresponden al análisis seleccionado
      const tasksForAnalysis = pendingTasks.filter(task => 
        task.analysis_name === selectedAnalysis.name ||
        task.analysis_code === selectedAnalysis.code ||
        task.analysis_name?.toLowerCase() === selectedAnalysis.name?.toLowerCase()
      );
      
      // Ordenar por prioridad y fecha
      const sortedTasks = sortTasksByPriorityAndDate(tasksForAnalysis);
      
      console.log('✅ Tareas encontradas para análisis:', sortedTasks.length);
      console.log('📊 Tareas ordenadas:', sortedTasks.map(t => ({
        id: t.id, 
        sample: t.sample_number,
        priority: t.priority, 
        date: t.date_added
      })));
      
      setFilteredTasks(sortedTasks);
      setSelectedTasks([]);
    } else if (selectionMode === "template" && selectedTemplate) {
      console.log('🔍 Plantilla seleccionada:', selectedTemplate);
      // Para plantillas, por ahora mostrar todas las tareas pendientes
      // TODO: Filtrar por los análisis de la plantilla
      const sortedTasks = sortTasksByPriorityAndDate(pendingTasks);
      setFilteredTasks(sortedTasks);
      setSelectedTasks([]);
    } else {
      setFilteredTasks([]);
      setSelectedTasks([]);
    }
  }, [selectedAnalysis, selectedTemplate, pendingTasks, selectionMode]);

  const handleAnalysisSelect = (analysis) => {
    setSelectedAnalysis(analysis);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSelectedAnalysis(null);
  };

  const handleTaskToggle = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  const generateWorkOrder = async () => {
    if (selectedTasks.length === 0) {
      alert('Por favor selecciona al menos una tarea');
      return;
    }
    
    // Verificar que hay un usuario autenticado para asignar como técnico
    if (!user?.id) {
      alert('No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    setIsGenerating(true);
    try {
      console.log('🚀 Generando OT con tareas:', selectedTasks);
      console.log('👤 Usuario asignado:', user);
      
      // Crear la orden de trabajo usando el endpoint del backend
      const otData = {
        tarea_ids: selectedTasks,
        tecnico_asignado_id: user.id
      };
      
      console.log('📤 Enviando datos al backend:', otData);
      
      const createdOrder = await WorkOrder.create(otData);
      
      console.log('✅ Orden de trabajo creada:', createdOrder);
      
      setLastGeneration(new Date());
      setSelectedTasks([]);
      setSelectedAnalysis(null);
      setSelectedTemplate(null);
      setActiveTab("list");
      loadData();
    } catch (error) {
      console.error("Error generating work order:", error);
      console.error("Server response:", error.response?.data);
      const errorMsg = error.serverMessage || error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al generar la OT: ${errorMsg}`);
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
                              <Badge className={`${statusInfo.color} border`}>
                                {statusInfo.label}
                              </Badge>
                              {order.priority !== 'normal' && (
                                <Badge className={`${priorityInfo.color} border`}>
                                  {priorityInfo.label}
                                </Badge>
                              )}
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
                    <p className="text-sm text-gray-600">Tareas Pendientes</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingTasks.length}</p>
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
                        // Contar tareas pendientes para este análisis
                        const tasksCount = pendingTasks.filter(t => 
                          t.analysis_name === analysis.name ||
                          t.analysis_code === analysis.code ||
                          t.analysis_name?.toLowerCase() === analysis.name?.toLowerCase()
                        ).length;
                        
                        // También usar el conteo del backend si está disponible
                        const backendCount = pendingTasksByAnalysis[analysis.name] || 0;
                        const displayCount = tasksCount || backendCount;
                        
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
                                    <Badge className={displayCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                      {displayCount} tarea{displayCount !== 1 ? 's' : ''} pendiente{displayCount !== 1 ? 's' : ''}
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
                        // Obtener los análisis de la plantilla
                        const templateAnalyses = analyses.filter(a => template.analysis_ids?.includes(a.id));
                        
                        // Contar tareas pendientes que coinciden con los análisis de la plantilla
                        const tasksCount = pendingTasks.filter(task => 
                          templateAnalyses.some(analysis => 
                            task.nombre_analisis === analysis.name || task.id_analisis === analysis.id
                          )
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
                                    <Badge className={tasksCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                      {tasksCount} {tasksCount === 1 ? 'tarea' : 'tareas'}
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
                <CardTitle>2. Selecciona Tareas para la OT</CardTitle>
                {filteredTasks.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleSelectAllTasks}>
                    {selectedTasks.length === filteredTasks.length ? 'Deseleccionar' : 'Seleccionar'} Todas
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
                      Primero debes seleccionar un análisis o plantilla para ver las tareas pendientes
                    </p>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay tareas pendientes
                    </h3>
                    <p className="text-gray-600">
                      No hay tareas pendientes para {selectionMode === 'individual' ? 'este análisis' : 'esta plantilla'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {/* Indicador de ordenamiento */}
                    <div className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>Ordenado por: Prioridad (alta → media → baja) y Fecha (más antigua primero)</span>
                    </div>
                    
                    {filteredTasks.map((task, index) => (
                      <Card
                        key={task.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTasks.includes(task.id) ? 'border-2 border-blue-500 bg-blue-50' : 'border'
                        } ${task.priority === 'alta' ? 'border-l-4 border-l-red-500' : 
                            task.priority === 'media' ? 'border-l-4 border-l-orange-500' : ''}`}
                        onClick={() => handleTaskToggle(task.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedTasks.includes(task.id)}
                              onCheckedChange={() => handleTaskToggle(task.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-400">#{index + 1}</span>
                                <span className="font-semibold text-gray-900">{task.sample_number}</span>
                                {task.priority === 'alta' && (
                                  <Badge className="bg-red-100 text-red-800 border border-red-300">
                                    🔴 Alta
                                  </Badge>
                                )}
                                {task.priority === 'media' && (
                                  <Badge className="bg-orange-100 text-orange-800 border border-orange-300">
                                    🟠 Media
                                  </Badge>
                                )}
                                {task.priority === 'baja' && (
                                  <Badge className="bg-gray-100 text-gray-600">
                                    Baja
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="text-gray-500">Análisis:</span> {task.analysis_name}</p>
                                {task.client && (
                                  <p><span className="text-gray-500">Cliente:</span> {task.client.name}</p>
                                )}
                                {task.barcode && (
                                  <p><span className="text-gray-500">Código:</span> <span className="font-mono text-xs">{task.barcode}</span></p>
                                )}
                                {task.date_added && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>Agregado: {format(new Date(task.date_added), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</span>
                                  </div>
                                )}
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

          {selectedTasks.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      OT Lista para Generar
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedTasks.length} tarea{selectedTasks.length !== 1 ? 's' : ''} seleccionada{selectedTasks.length !== 1 ? 's' : ''} para{' '}
                      {selectionMode === 'individual' ? selectedAnalysis?.name : selectedTemplate?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Técnico asignado: {user?.nombre || user?.email || 'Usuario actual'}
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
      {showEditModal && editingWorkOrder && (
        <WorkOrderEditModal
          workOrder={editingWorkOrder}
          onSave={handleUpdateWorkOrder}
          onCancel={() => {
            setShowEditModal(false);
            setEditingWorkOrder(null);
          }}
        />
      )}
    </div>
  );
}

// Componente modal para editar OT completo
function WorkOrderEditModal({ workOrder, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    analysis_type: workOrder.analysis_type || '',
    test_parameter: workOrder.test_parameter || '',
    test_method: workOrder.test_method || '',
    assigned_technician: workOrder.assigned_technician || '',
    equipment_used: workOrder.equipment_used || '',
    status: workOrder.status || 'generada',
    priority: workOrder.priority || 'normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-xl">Editar Orden de Trabajo</CardTitle>
            <p className="text-sm text-gray-600 mt-1">OT: {workOrder.ot_number}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información de solo lectura */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-gray-900 mb-2">Información de la OT</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Número de OT:</span>
                  <p className="font-medium text-gray-900">{workOrder.ot_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">Muestras:</span>
                  <p className="font-medium text-gray-900">{workOrder.sample_numbers}</p>
                </div>
                <div>
                  <span className="text-gray-600">Cantidad de muestras:</span>
                  <p className="font-medium text-gray-900">{workOrder.sample_count}</p>
                </div>
                <div>
                  <span className="text-gray-600">Generada:</span>
                  <p className="font-medium text-gray-900">
                    {workOrder.generated_at ? format(new Date(workOrder.generated_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Campos editables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="test_parameter">Parámetro a Ensayar *</Label>
                <Input
                  id="test_parameter"
                  value={formData.test_parameter}
                  onChange={(e) => setFormData({...formData, test_parameter: e.target.value})}
                  placeholder="Ej: Coliformes Totales"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test_method">Método de Ensayo *</Label>
              <Input
                id="test_method"
                value={formData.test_method}
                onChange={(e) => setFormData({...formData, test_method: e.target.value})}
                placeholder="Ej: NCh 409/1, APHA 3120"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_technician">Técnico Asignado</Label>
              <Input
                id="assigned_technician"
                value={formData.assigned_technician}
                onChange={(e) => setFormData({...formData, assigned_technician: e.target.value})}
                placeholder="Nombre del técnico responsable"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment_used">Equipos Utilizados</Label>
              <Textarea
                id="equipment_used"
                value={formData.equipment_used}
                onChange={(e) => setFormData({...formData, equipment_used: e.target.value})}
                placeholder="Ej: Espectrofotómetro, Autoclave, etc."
                className="h-20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
