import React, { useState, useEffect } from "react";
import { Analysis, AnalysisTemplate } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus,
  Search,
  FlaskConical,
  Package,
  Edit,
  Eye,
  Trash2
} from "lucide-react";

import AnalysisList from "../components/procedures/AnalysisList";
import AnalysisForm from "../components/procedures/AnalysisForm";
import AnalysisDetails from "../components/procedures/AnalysisDetails";
import TemplateList from "../components/procedures/TemplateList";
import TemplateForm from "../components/procedures/TemplateForm";
import TemplateDetails from "../components/procedures/TemplateDetails";

export default function ProceduresPage() {
  const [activeTab, setActiveTab] = useState("analyses");
  const [analyses, setAnalyses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [originalAnalysisId, setOriginalAnalysisId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading data: starting API calls...');
      const [analysesData, templatesData] = await Promise.all([
        Analysis.getAll(),
        AnalysisTemplate.getAll()
      ]);
      console.log('✅ Analysis data received:', analysesData);
      console.log('✅ Templates data received:', templatesData);
      console.log('📊 Templates count:', templatesData?.length || 0);
      
      setAnalyses(analysesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("❌ Error loading data:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      setError("Error al cargar los datos. Por favor intente nuevamente.");
    }
    setIsLoading(false);
  };

  const handleAnalysisSubmit = async (analysisData) => {
    try {
      // Transform the data to match backend format
      const backendData = {
        nombreAnalisis: analysisData.name,
        codigo: analysisData.code,
        descripcion: analysisData.description,
        categoria: analysisData.category,
        metodoEnsayo: analysisData.method,
        tiposMuestraAplicables: analysisData.sample_types || [],
        parametrosMedir: analysisData.parameters.reduce((acc, param) => {
          if (param.parameter_name) {
            acc[param.parameter_name] = {
              unidad: param.unit || '',
              limiteDeteccion: param.detection_limit || '',
              limiteMaximo: param.max_limit || ''
            };
          }
          return acc;
        }, {}),
        equiposRequeridos: analysisData.required_equipment.reduce((acc, equipment, index) => {
          if (equipment) {
            acc[`equipo${index + 1}`] = equipment;
          }
          return acc;
        }, {}),
        duracionEstimadaHoras: analysisData.estimated_duration_hours,
        precioClp: analysisData.price,
        diasEntrega: 3, // Default value
        estado: analysisData.status === 'activo' ? 'Activo' : 'Inactivo'
      };

      if (selectedAnalysis && originalAnalysisId) {
        await Analysis.update(originalAnalysisId, backendData);
      } else {
        await Analysis.create(backendData);
      }
      setShowAnalysisForm(false);
      setSelectedAnalysis(null);
      setOriginalAnalysisId(null);
      loadData();
    } catch (error) {
      console.error("Error saving analysis:", error);
    }
  };

  const handleTemplateSubmit = async (templateData) => {
    try {
      if (selectedTemplate) {
        await AnalysisTemplate.update(selectedTemplate.id, templateData);
      } else {
        await AnalysisTemplate.create(templateData);
      }
      setShowTemplateForm(false);
      setSelectedTemplate(null);
      loadData();
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleViewAnalysis = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowAnalysisDetails(true);
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (confirm("¿Estás seguro de eliminar este análisis?")) {
      try {
        await Analysis.delete(analysisId);
        loadData();
      } catch (error) {
        console.error("Error deleting analysis:", error);
      }
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (confirm("¿Estás seguro de eliminar esta plantilla?")) {
      try {
        await AnalysisTemplate.delete(templateId);
        loadData();
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.nombreAnalisis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.nombrePlantilla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.idPlantilla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Procedimientos</h1>
          <p className="text-gray-600">Administra análisis y plantillas de procedimientos de laboratorio</p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar análisis o plantillas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadData}
            className="text-red-600 hover:text-red-800"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabs para Análisis y Plantillas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="analyses" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Plantillas
          </TabsTrigger>
        </TabsList>

        {/* Tab de Análisis */}
        <TabsContent value="analyses" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowAnalysisForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Análisis
            </Button>
          </div>

          <AnalysisList
            analyses={filteredAnalyses}
            isLoading={isLoading}
            onView={handleViewAnalysis}
            onEdit={(analysis) => {
              // Transform backend data to form format
              const parameters = Object.entries(analysis.parametrosMedir || {}).map(([name, params]) => ({
                parameter_name: name,
                unit: params.unidad || '',
                detection_limit: params.limiteDeteccion || '',
                max_limit: params.limiteMaximo || ''
              }));
              
              const equipment = Object.values(analysis.equiposRequeridos || {}).filter(eq => eq);
              
              const formattedAnalysis = {
                name: analysis.nombreAnalisis,
                code: analysis.codigo,
                description: analysis.descripcion,
                category: analysis.categoria,
                method: analysis.metodoEnsayo,
                sample_types: analysis.tiposMuestraAplicables || [],
                parameters: parameters.length > 0 ? parameters : [{ parameter_name: '', unit: '', detection_limit: '', max_limit: '' }],
                required_equipment: equipment.length > 0 ? equipment : [''],
                estimated_duration_hours: analysis.duracionEstimadaHoras,
                price: analysis.precioClp,
                status: analysis.estado?.toLowerCase() === 'activo' ? 'activo' : 'inactivo'
              };
              setOriginalAnalysisId(analysis.idAnalisis);
              setSelectedAnalysis(formattedAnalysis);
              setShowAnalysisForm(true);
            }}
            onDelete={handleDeleteAnalysis}
          />
        </TabsContent>

        {/* Tab de Plantillas */}
        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowTemplateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </div>

          <TemplateList
            templates={filteredTemplates}
            analyses={analyses}
            isLoading={isLoading}
            onView={(template) => {
              setSelectedTemplate(template);
              setShowTemplateDetails(true);
            }}
            onEdit={(template) => {
              setSelectedTemplate(template);
              setShowTemplateForm(true);
            }}
            onDelete={handleDeleteTemplate}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de formulario de análisis */}
      {showAnalysisForm && (
        <AnalysisForm
          analysis={selectedAnalysis}
          onSubmit={handleAnalysisSubmit}
          onCancel={() => {
            setShowAnalysisForm(false);
            setSelectedAnalysis(null);
            setOriginalAnalysisId(null);
          }}
        />
      )}

      {/* Modal de detalles de análisis */}
      {showAnalysisDetails && selectedAnalysis && (
        <AnalysisDetails
          analysis={selectedAnalysis}
          onEdit={() => {
            setShowAnalysisDetails(false);
            // Transform the analysis data for editing
            const parameters = Object.entries(selectedAnalysis.parametrosMedir || {}).map(([name, params]) => ({
              parameter_name: name,
              unit: params.unidad || '',
              detection_limit: params.limiteDeteccion || '',
              max_limit: params.limiteMaximo || ''
            }));
            
            const equipment = Object.values(selectedAnalysis.equiposRequeridos || {}).filter(eq => eq);
            
            const formattedAnalysis = {
              name: selectedAnalysis.nombreAnalisis,
              code: selectedAnalysis.codigo,
              description: selectedAnalysis.descripcion,
              category: selectedAnalysis.categoria,
              method: selectedAnalysis.metodoEnsayo,
              sample_types: selectedAnalysis.tiposMuestraAplicables || [],
              parameters: parameters.length > 0 ? parameters : [{ parameter_name: '', unit: '', detection_limit: '', max_limit: '' }],
              required_equipment: equipment.length > 0 ? equipment : [''],
              estimated_duration_hours: selectedAnalysis.duracionEstimadaHoras,
              price: selectedAnalysis.precioClp,
              status: selectedAnalysis.estado?.toLowerCase() === 'activo' ? 'activo' : 'inactivo'
            };
            setOriginalAnalysisId(selectedAnalysis.idAnalisis);
            setSelectedAnalysis(formattedAnalysis);
            setShowAnalysisForm(true);
          }}
          onClose={() => {
            setShowAnalysisDetails(false);
            setSelectedAnalysis(null);
          }}
        />
      )}

      {/* Modal de formulario de plantilla */}
      {showTemplateForm && (
        <TemplateForm
          template={selectedTemplate}
          analyses={analyses}
          onSubmit={handleTemplateSubmit}
          onCancel={() => {
            setShowTemplateForm(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Modal de detalles de plantilla */}
      {showTemplateDetails && selectedTemplate && (
        <TemplateDetails
          template={selectedTemplate}
          analyses={analyses}
          onEdit={() => {
            setShowTemplateDetails(false);
            setShowTemplateForm(true);
          }}
          onClose={() => {
            setShowTemplateDetails(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}