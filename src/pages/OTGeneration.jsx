
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
  X,
  Archive,
  Ban,
  Eye,
  History
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/ui/confirm-dialog";

// Configuration for Work Order status badges
const statusConfig = {
  generada:    { label: "Generada",    color: "bg-blue-100 text-blue-800" },
  abierta:     { label: "Generada",    color: "bg-blue-100 text-blue-800" },
  en_analisis: { label: "En Análisis", color: "bg-yellow-100 text-yellow-800" },
  en_proceso:  { label: "En Análisis", color: "bg-yellow-100 text-yellow-800" },
  completada:  { label: "Completada",  color: "bg-green-100 text-green-800" },
  finalizada:  { label: "Finalizada",  color: "bg-green-100 text-green-800" },
  cancelada:   { label: "Cancelada",   color: "bg-red-100 text-red-800" },
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

  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [technicians, setTechnicians] = useState([]);

  // Generate OT dialog state
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [dialogTechnicianId, setDialogTechnicianId] = useState(null);
  const [dialogPriority, setDialogPriority] = useState('normal');

  // Delete confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  const loadData = useCallback(async () => {
    try {
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

      // Load technicians (all active users including admin)
      try {
        const users = await administrationService.getActiveUsers();
        setTechnicians(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error('Error loading technicians:', error);
        try {
          const allUsers = await administrationService.getAllUsers();
          setTechnicians((Array.isArray(allUsers) ? allUsers : []).filter(u => u.activo !== false));
        } catch (fallbackError) {
          console.error('Error loading users fallback:', fallbackError);
        }
      }

      try {
        analysesData = await Analysis.getAll();
      } catch (error) {
        console.error("Error loading analyses:", error);
      }

      try {
        templatesData = await AnalysisTemplate.getAll();
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
        required_equipment: Array.isArray(a.equiposRequeridos)
          ? a.equiposRequeridos
          : (a.equiposRequeridos && typeof a.equiposRequeridos === 'object'
              ? Object.values(a.equiposRequeridos).filter(Boolean)
              : (Array.isArray(a.required_equipment) ? a.required_equipment : [])),
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
      
      setPendingSamples(receivedSamples);
      setWorkOrders(sortedOrders);
      // Compute lastGeneration from the most recent work order's generated_at or created_date
      if (Array.isArray(sortedOrders) && sortedOrders.length > 0) {
        const mostRecent = sortedOrders[0];
        const genAt = mostRecent.generated_at || mostRecent.created_date || mostRecent.generatedAt || null;
        setLastGeneration(genAt ? new Date(genAt) : null);
      } else {
        setLastGeneration(null);
      }
      setAnalyses(transformedAnalyses);
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper: check if a sample has a PENDIENTE task for the given analysis
  const hasPendingTask = (sample, analysisId, analysisName) => {
    const details = sample.analysis_details || [];
    const tests = sample.requested_tests || [];
    
    // Check by index correlation (same as extractTareaIds)
    for (let i = 0; i < tests.length; i++) {
      if (tests[i] === analysisId || tests[i] === analysisName) {
        const detail = details[i];
        if (detail) {
          const status = (detail.status || '').toUpperCase();
          if (status === 'PENDIENTE' || status === '') {
            return true;
          }
        }
      }
    }
    
    // Fallback: check analysis_details by id/name
    const byField = details.find(ad => ad.id === analysisId || ad.name === analysisName);
    if (byField) {
      const status = (byField.status || '').toUpperCase();
      return status === 'PENDIENTE' || status === '';
    }
    
    return false;
  };

  // Filtrar muestras cuando se selecciona un análisis o plantilla
  // Solo muestra muestras con tareas PENDIENTE para el análisis seleccionado
  useEffect(() => {
    if (selectionMode === "individual" && selectedAnalysis) {
      const samplesForAnalysis = pendingSamples.filter(sample => {
        // Must have the analysis AND the task must be PENDIENTE
        const hasAnalysis = (Array.isArray(sample.requested_tests) && (
          sample.requested_tests.includes(selectedAnalysis.id) || sample.requested_tests.includes(selectedAnalysis.name)
        )) || (Array.isArray(sample.analysis_details) && sample.analysis_details.some(ad => (
          ad.id === selectedAnalysis.id || ad.name === selectedAnalysis.name
        )));
        
        if (!hasAnalysis) return false;
        return hasPendingTask(sample, selectedAnalysis.id, selectedAnalysis.name);
      });
      setFilteredSamples(samplesForAnalysis);
      setSelectedSamples([]);
    } else if (selectionMode === "template" && selectedTemplate) {
      const samplesForTemplate = pendingSamples.filter(sample => {
        // Must have ALL analyses of the template with PENDIENTE status
        return selectedTemplate.analysis_ids.every(aid => {
          const analysisObj = analyses.find(a => a.id === aid || a.name === aid);
          const name = analysisObj?.name || aid;
          const id = analysisObj?.id || aid;
          
          const hasAnalysis = (Array.isArray(sample.requested_tests) && (
            sample.requested_tests.includes(id) || sample.requested_tests.includes(name)
          )) || (Array.isArray(sample.analysis_details) && sample.analysis_details.some(ad => (
            ad.id === id || ad.name === name
          )));
          
          if (!hasAnalysis) return false;
          return hasPendingTask(sample, id, name);
        });
      });
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

  const openGenerateDialog = () => {
    if (selectedSamples.length === 0) return;
    const samples = filteredSamples.filter(s => selectedSamples.includes(s.id));
    const autoPriority = samples.some(s => s.priority === 'critica') ? 'critica'
                       : samples.some(s => s.priority === 'urgente') ? 'urgente' : 'normal';
    setDialogPriority(autoPriority);
    setDialogTechnicianId(null);
    setShowGenerateDialog(true);
  };

  const generateWorkOrder = async (technicianId, priority) => {
    if (selectedSamples.length === 0) return;
    if (!technicianId) {
      alert("Por favor, selecciona un técnico asignado antes de generar la OT.");
      return;
    }
    
    setShowGenerateDialog(false);
    setIsGenerating(true);
    try {
      const samples = filteredSamples.filter(s => selectedSamples.includes(s.id));

      // Helper: extract tarea_ids for a given analysis id/name from a sample.
      // Helper: extract tarea_ids for a given analysis id/name from a sample.
      // Only returns IDs for tasks that are still PENDIENTE.
      // requested_tests and analysis_details share indices (from backendSample.analisis).
      const extractTareaIds = (sample, analysisId, analysisName) => {
        const details = sample.analysis_details || [];
        const tests   = sample.requested_tests  || [];

        // PRIMARY STRATEGY: Use requested_tests index to find the matching detail.
        for (let i = 0; i < tests.length; i++) {
          if (tests[i] === analysisId) {
            const detail = details[i];
            if (detail) {
              if (detail.status && detail.status.toUpperCase() !== 'PENDIENTE') {
                return [];
              }
              const tareaId = detail.tarea_id || detail.id;
              if (tareaId) return [tareaId];
            }
          }
        }

        // FALLBACK 1: match by id or name in analysis_details
        const byField = details.find(ad => ad.id === analysisId || ad.name === analysisName);
        if (byField) {
          if (byField.status && byField.status.toUpperCase() !== 'PENDIENTE') return [];
          const tareaId = byField.tarea_id || byField.id;
          return tareaId ? [tareaId] : [];
        }

        // FALLBACK 2: if requested_tests contains analysisName
        const nameIdx = tests.indexOf(analysisName);
        if (nameIdx >= 0 && details[nameIdx]) {
          const d = details[nameIdx];
          if (d.status && d.status.toUpperCase() !== 'PENDIENTE') return [];
          const tareaId = d.tarea_id || d.id;
          return tareaId ? [tareaId] : [];
        }

        return [];
      };

      let otData;
      if (selectionMode === "individual" && selectedAnalysis) {
        const tareaIds = samples.flatMap(s => extractTareaIds(s, selectedAnalysis.id, selectedAnalysis.name));

        if (tareaIds.length === 0) {
          alert('No hay tareas pendientes disponibles para este análisis. Es posible que ya se haya generado una OT previamente.');
          setIsGenerating(false);
          return;
        }

        otData = {
          tarea_ids:           tareaIds,
          tecnico_asignado_id: technicianId || null,
          priority,
          ot_number:      `OT-${Date.now().toString().slice(-6)}-${selectedAnalysis.code || 'AN'}`,
          analysis_type:  selectedAnalysis.name,
          test_parameter: selectedAnalysis.name,
          sample_ids:     samples.map(s => s.id),
          sample_numbers: samples.map(s => s.internal_number).join(', '),
          sample_count:   samples.length,
        };
      } else if (selectionMode === "template" && selectedTemplate) {
        // Collect tarea_ids for all analyses belonging to this template
        const templateAnalysisIds = analyses
          .filter(a => selectedTemplate.analysis_ids?.includes(a.id))
          .map(a => a.id);
        const templateAnalysisNames = analyses
          .filter(a => selectedTemplate.analysis_ids?.includes(a.id))
          .map(a => a.name);

        const tareaIds = samples.flatMap(s =>
          templateAnalysisIds.flatMap((aid, idx) => extractTareaIds(s, aid, templateAnalysisNames[idx]))
        );

        if (tareaIds.length === 0) {
          alert('No hay tareas pendientes disponibles para esta plantilla. Es posible que ya se haya generado una OT previamente.');
          setIsGenerating(false);
          return;
        }

        otData = {
          tarea_ids:           tareaIds,
          tecnico_asignado_id: technicianId || null,
          priority,
          // kept for local reference / display
          ot_number:      `OT-${Date.now().toString().slice(-6)}-TPL`,
          analysis_type:  selectedTemplate.name,
          test_parameter: selectedTemplate.name,
          sample_ids:     samples.map(s => s.id),
          sample_numbers: samples.map(s => s.internal_number).join(', '),
          sample_count:   samples.length,
        };
      }
      
      await WorkOrder.create(otData);
      
      // Remove used samples from pending list immediately (optimistic update)
      const usedIds = new Set(samples.map(s => s.id));
      setPendingSamples(prev => prev.filter(s => !usedIds.has(s.id)));

      // Update sample status in backend - don't block on failure
      try {
        await Promise.all(samples.map(sample => Sample.updateStatus(sample.id, 'EN_PROCESO')));
      } catch (statusError) {
        console.warn('Sample status update failed (OT was created successfully):', statusError.message);
      }
      
      setLastGeneration(new Date());
      setSelectedSamples([]);
      setSelectedAnalysis(null);
      setSelectedTemplate(null);
      setActiveTab("list");
      loadData();
    } catch (error) {
      console.error("Error generating work order:", error);
      const serverMsg = error.response?.data?.message || error.message;
      alert(`Error al generar la OT: ${serverMsg}`);
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
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error || error.message;
      alert(`Error al guardar los cambios: ${serverMsg}`);
    }
  };

  const handleDeleteWorkOrder = async (orderId) => {
    setDeletingOrderId(orderId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteWorkOrder = async () => {
    if (!deletingOrderId) return;
    try {
      await WorkOrder.delete(deletingOrderId);
      setShowDeleteConfirm(false);
      setDeletingOrderId(null);
      loadData();
    } catch (error) {
      console.error("Error deleting work order:", error);
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error || error?.serverMessage || error.message;
      setShowDeleteConfirm(false);
      setDeletingOrderId(null);
      alert(`No se pudo eliminar la OT: ${serverMsg}`);
    }
  };

  const handleRecreateWorkOrder = async (order) => {
    if (!window.confirm("¿Volver a hacer una Orden de Trabajo con las muestras rechazadas/canceladas?")) return;
    try {
      await workOrdersService.crearOTRechazadas(order.id, {
        notas: "Recreada a partir de muestras rechazadas"
      });
      alert("Nueva Orden de Trabajo creada exitoamente.");
      loadData();
      setActiveTab("list");
    } catch (error) {
      console.error("Error recreating work order:", error);
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error || error?.serverMessage || error.message;
      alert(`No se pudo volver a generar la OT: ${serverMsg}`);
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
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Activas ({workOrders.filter(o => !['completada','finalizada','cancelada'].includes(o.status) && !o.has_rejected).length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completadas ({workOrders.filter(o => ['completada','finalizada'].includes(o.status)).length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <Ban className="w-4 h-4" />
            Canceladas ({workOrders.filter(o => o.status === 'cancelada' || o.has_rejected).length})
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Generar OT
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ PESTAÑA: OT ACTIVAS ═══════════ */}
        <TabsContent value="list" className="space-y-4 mt-6">
          {(() => {
            const activeOrders = workOrders.filter(o => !['completada','finalizada','cancelada'].includes(o.status) && !o.has_rejected);
            return activeOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay OT activas</h3>
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
                {activeOrders.map((order, index) => {
                  const currentStatus = order.status || 'generada';
                  const statusInfo = statusConfig[currentStatus] || statusConfig.generada;
                  const currentPriority = order.priority || 'normal';
                  const priorityInfo = priorityConfig[currentPriority] || priorityConfig.normal;
                  
                  return (
                    <Card key={order.id || `order-${index}`} className="hover:shadow-lg transition-shadow">
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
            );
          })()}
        </TabsContent>

        {/* ═══════════ PESTAÑA: HISTORIAL COMPLETADAS ═══════════ */}
        <TabsContent value="completed" className="space-y-4 mt-6">
          {(() => {
            const completedOrders = workOrders.filter(o => ['completada','finalizada'].includes(o.status));
            return completedOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Archive className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay OT completadas</h3>
                  <p className="text-gray-600">Las órdenes de trabajo finalizadas aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedOrders.map((order, index) => {
                  const currentPriority = order.priority || 'normal';
                  const priorityInfo = priorityConfig[currentPriority] || priorityConfig.normal;
                  
                  return (
                    <Card key={order.id || `completed-${index}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{order.ot_number}</h3>
                                <Badge className={`${priorityInfo.color} border`}>{priorityInfo.label}</Badge>
                                <Badge className="bg-green-100 text-green-800 border">Completada</Badge>
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
                                    <span>Creada: {format(new Date(order.generated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                                  </div>
                                )}
                                {order.completion_date && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Finalizada: {format(new Date(order.completion_date), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                                  </div>
                                )}
                                {order.assigned_technician && (
                                  <div className="flex items-center gap-1">
                                    <span>Técnico: {order.assigned_technician}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Link to={`${createPageUrl("SampleWorkflow")}?otId=${order.id}`}>
                              <Button variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalle
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </TabsContent>

        {/* ═══════════ PESTAÑA: CANCELADAS / NO COMPLETADAS ═══════════ */}
        <TabsContent value="cancelled" className="space-y-4 mt-6">
          {(() => {
            const cancelledOrders = workOrders.filter(o => o.status === 'cancelada' || o.has_rejected);
            return cancelledOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Ban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay OT canceladas o rechazadas</h3>
                  <p className="text-gray-600">Las órdenes de trabajo canceladas o con análisis rechazados aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {cancelledOrders.map((order, index) => {
                  const currentPriority = order.priority || 'normal';
                  const priorityInfo = priorityConfig[currentPriority] || priorityConfig.normal;
                  const isCancelled = order.status === 'cancelada';
                  const hasRejected = order.has_rejected && !isCancelled;
                  
                  return (
                    <Card key={order.id || `cancelled-${index}`} className={`hover:shadow-lg transition-shadow border-l-4 ${isCancelled ? 'border-l-red-400' : 'border-l-orange-400'}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCancelled ? 'bg-red-50' : 'bg-orange-50'}`}>
                              {isCancelled 
                                ? <Ban className="w-6 h-6 text-red-500" />
                                : <AlertCircle className="w-6 h-6 text-orange-500" />
                              }
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{order.ot_number}</h3>
                                <Badge className={`${priorityInfo.color} border`}>{priorityInfo.label}</Badge>
                                {isCancelled ? (
                                  <Badge className="bg-red-100 text-red-800 border">Cancelada</Badge>
                                ) : (
                                  <Badge className="bg-orange-100 text-orange-800 border">
                                    {order.rejected_tasks} análisis rechazado{order.rejected_tasks !== 1 ? 's' : ''}
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
                                    <span>Creada: {format(new Date(order.generated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                                  </div>
                                )}
                                {order.assigned_technician && (
                                  <div className="flex items-center gap-1">
                                    <span>Técnico: {order.assigned_technician}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {(order.has_rejected || isCancelled) && (
                              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleRecreateWorkOrder(order)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Volver a hacer
                              </Button>
                            )}
                            {isCancelled && (
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteWorkOrder(order.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Link to={`${createPageUrl("SampleWorkflow")}?otId=${order.id}`}>
                              <Button variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalle
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
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
                        const samplesCount = pendingSamples.filter(s => {
                          // Check if sample has the analysis AND has a PENDIENTE task
                          const hasAnalysis = (Array.isArray(s.requested_tests) && (
                            s.requested_tests.includes(analysis.id) || s.requested_tests.includes(analysis.name)
                          )) || (Array.isArray(s.analysis_details) && s.analysis_details.some(ad => (
                            ad.id === analysis.id || ad.name === analysis.name
                          )));
                          if (!hasAnalysis) return false;
                          return hasPendingTask(s, analysis.id, analysis.name);
                        }).length;
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
                        
                        const samplesCount = pendingSamples.filter(sample => {
                          // For templates, ensure the sample contains all template analyses with PENDIENTE status
                          return template.analysis_ids.every(aid => {
                            const analysisObj = analyses.find(a => a.id === aid || a.name === aid);
                            const name = analysisObj?.name || aid;
                            const id = analysisObj?.id || aid;

                            const hasAnalysis = (Array.isArray(sample.requested_tests) && (
                              sample.requested_tests.includes(id) || sample.requested_tests.includes(name)
                            )) || (Array.isArray(sample.analysis_details) && sample.analysis_details.some(ad => (
                              ad.id === id || ad.name === name
                            )));
                            if (!hasAnalysis) return false;
                            return hasPendingTask(sample, id, name);
                          });
                        }).length;
                        
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
                <div className="flex items-center justify-between gap-4">
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
                    onClick={openGenerateDialog}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 shrink-0"
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

      {/* Modal de confirmación de generación de OT */}
      <Dialog open={showGenerateDialog} onOpenChange={(open) => { if (!open) setShowGenerateDialog(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Generación de OT</DialogTitle>
            <DialogDescription>
              {selectedSamples.length} muestra{selectedSamples.length !== 1 ? 's' : ''} seleccionada{selectedSamples.length !== 1 ? 's' : ''} para{' '}
              {selectionMode === 'individual' ? selectedAnalysis?.name : selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Técnico Asignado <span className="text-red-500">*</span></Label>
              <Select value={dialogTechnicianId || ''} onValueChange={setDialogTechnicianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => {
                    const fullName = [tech.nombre, tech.apellido].filter(Boolean).join(' ') || tech.username || tech.email;
                    const rolLabel = tech.rol?.nombre || tech.rol?.name || '';
                    return (
                      <SelectItem key={tech.id} value={tech.id}>
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
              <Label>Prioridad</Label>
              <Select value={dialogPriority} onValueChange={setDialogPriority}>
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

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancelar</Button>
            <Button
              disabled={!dialogTechnicianId || isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => generateWorkOrder(dialogTechnicianId, dialogPriority)}
            >
              <Play className="w-4 h-4 mr-2" />
              Generar OT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={confirmDeleteWorkOrder}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingOrderId(null);
        }}
        title="Eliminar Orden de Trabajo"
        message="¿Estás seguro de eliminar esta Orden de Trabajo? Las muestras asociadas no serán eliminadas. Solo se pueden eliminar órdenes abiertas o canceladas."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}

// Componente modal para editar OT - usando Dialog de shadcn/ui
function WorkOrderEditModal({ open, workOrder, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    analysis_type: '',
    test_parameter: '',
    tecnico_asignado_id: '',
    equipment_used: '',
    status: 'abierta',
    priority: 'normal'
  });
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    if (workOrder) {
      setFormData({
        analysis_type: workOrder.analysis_type || '',
        test_parameter: workOrder.test_parameter || '',
        tecnico_asignado_id: workOrder.tecnico_asignado?.id_usuario || workOrder.tecnico_asignado?.id || '',
        equipment_used: workOrder.equipment_used || '',
        status: workOrder.status || 'generada',
        priority: workOrder.priority || 'normal'
      });
    }
  }, [workOrder]);

  // Load all active users (including admin)
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const users = await administrationService.getActiveUsers();
        setTechnicians(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error('Error loading technicians:', error);
        try {
          const allUsers = await administrationService.getAllUsers();
          setTechnicians((Array.isArray(allUsers) ? allUsers : []).filter(u => u.activo !== false));
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

            {/* Estado y prioridad actuales */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Estado actual</span>
                <div className="mt-1">
                  <Badge className={`${currentStatusInfo.color} border`}>{currentStatusInfo.label}</Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Prioridad actual</span>
                <div className="mt-1">
                  <Badge className={`${currentPriorityInfo.color} border`}>{currentPriorityInfo.label}</Badge>
                </div>
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
              <Label htmlFor="tecnico_asignado_id">Técnico Asignado</Label>
              <Select
                value={formData.tecnico_asignado_id}
                onValueChange={(value) => setFormData({...formData, tecnico_asignado_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => {
                    const fullName = [tech.nombre, tech.apellido].filter(Boolean).join(' ') || tech.username || tech.email;
                    const rolLabel = tech.rol?.nombre || tech.rol?.name || '';
                    return (
                      <SelectItem key={tech.id} value={tech.id}>
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
                    <SelectItem value="en_analisis">En Análisis</SelectItem>
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
