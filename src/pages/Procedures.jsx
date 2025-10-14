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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analysesData, templatesData] = await Promise.all([
        Analysis.list('-created_date'),
        AnalysisTemplate.list('-created_date')
      ]);
      setAnalyses(analysesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleAnalysisSubmit = async (analysisData) => {
    try {
      if (selectedAnalysis) {
        await Analysis.update(selectedAnalysis.id, analysisData);
      } else {
        await Analysis.create(analysisData);
      }
      setShowAnalysisForm(false);
      setSelectedAnalysis(null);
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
    analysis.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            onEdit={(analysis) => {
              setSelectedAnalysis(analysis);
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