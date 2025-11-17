import React, { useState, useEffect, useCallback } from "react";
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
  Edit,
  Eye,
  Copy,
  Beaker,
  Package
} from "lucide-react";

import AnalysisForm from "../components/procedures/AnalysisForm";
import AnalysisDetails from "../components/procedures/AnalysisDetails";
import TemplateForm from "../components/procedures/TemplateForm";
import TemplateDetails from "../components/procedures/TemplateDetails";

const categoryConfig = {
  microbiologico: { color: "bg-green-100 text-green-800", label: "Microbiológico" },
  fisico_quimico: { color: "bg-blue-100 text-blue-800", label: "Físico-Químico" },
  metales_pesados: { color: "bg-red-100 text-red-800", label: "Metales Pesados" },
  organicos: { color: "bg-purple-100 text-purple-800", label: "Orgánicos" },
  otros: { color: "bg-gray-100 text-gray-800", label: "Otros" }
};

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState("analyses");
  const [isLoading, setIsLoading] = useState(true);

  const applyAnalysisFilters = useCallback(() => {
    let filtered = analyses;
    
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAnalyses(filtered);
  }, [analyses, searchTerm]);

  const applyTemplateFilters = useCallback(() => {
    let filtered = templates;
    
    if (templateSearchTerm) {
      filtered = filtered.filter(template => 
        template.name?.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(templateSearchTerm.toLowerCase())
      );
    }
    
    setFilteredTemplates(filtered);
  }, [templates, templateSearchTerm]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyAnalysisFilters();
  }, [applyAnalysisFilters]);

  useEffect(() => {
    applyTemplateFilters();
  }, [applyTemplateFilters]);

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

  const duplicateAnalysis = async (analysis) => {
    try {
      const duplicatedData = {
        ...analysis,
        name: `${analysis.name} (Copia)`,
        code: `${analysis.code}_COPY_${Date.now().toString().slice(-4)}`
      };
      delete duplicatedData.id;
      delete duplicatedData.created_date;
      delete duplicatedData.updated_date;
      
      await Analysis.create(duplicatedData);
      loadData();
    } catch (error) {
      console.error("Error duplicating analysis:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Análisis</h1>
          <p className="text-gray-600">Configura análisis individuales y plantillas estándar</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyses" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Análisis Individuales
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Plantillas de Análisis
          </TabsTrigger>
        </TabsList>

        {/* Tab de Análisis Individuales */}
        <TabsContent value="analyses" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar análisis por nombre, código o método..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setShowAnalysisForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Análisis
            </Button>
          </div>

          {/* Lista de análisis */}
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
            ) : filteredAnalyses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FlaskConical className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay análisis</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? "No se encontraron análisis que coincidan con la búsqueda"
                      : "Comienza creando tu primer análisis"}
                  </p>
                  <Button onClick={() => setShowAnalysisForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Análisis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredAnalyses.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                          <Beaker className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {analysis.name}
                            </h3>
                            <Badge className="text-xs bg-gray-100 text-gray-800">
                              {analysis.code}
                            </Badge>
                            <Badge className={`${categoryConfig[analysis.category]?.color || categoryConfig.otros.color}`}>
                              {categoryConfig[analysis.category]?.label || "Otros"}
                            </Badge>
                            {analysis.status === 'inactivo' && (
                              <Badge variant="secondary">
                                Inactivo
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Método: {analysis.method}</span>
                            {analysis.estimated_duration_hours && (
                              <span>Duración: {analysis.estimated_duration_hours}h</span>
                            )}
                            {analysis.price && (
                              <span>Precio: ${analysis.price}</span>
                            )}
                          </div>
                          
                          {analysis.parameters && analysis.parameters.length > 0 && (
                            <div className="text-sm text-gray-500">
                              Parámetros: {analysis.parameters.slice(0, 3).map(p => p.parameter_name).join(', ')}
                              {analysis.parameters.length > 3 && ` (+${analysis.parameters.length - 3} más)`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateAnalysis(analysis)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAnalysis(analysis)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAnalysis(analysis);
                            setShowAnalysisForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab de Plantillas */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar plantillas por nombre o descripción..."
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setShowTemplateForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </div>

          {/* Lista de plantillas */}
          <div className="grid gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
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
            ) : filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
                  <p className="text-gray-600 mb-4">
                    {templateSearchTerm 
                      ? "No se encontraron plantillas que coincidan con la búsqueda"
                      : "Crea plantillas para agrupar análisis frecuentes"}
                  </p>
                  <Button onClick={() => setShowTemplateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Plantilla
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-green-600" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {template.name}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              {template.analysis_ids?.length || 0} análisis
                            </Badge>
                            {template.status === 'inactivo' && (
                              <Badge variant="secondary">
                                Inactivo
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {template.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {template.sample_types && (
                              <span>Tipos: {template.sample_types.join(', ')}</span>
                            )}
                            {template.total_price && (
                              <span>Precio: ${template.total_price}</span>
                            )}
                            {template.estimated_duration_days && (
                              <span>Duración: {template.estimated_duration_days} días</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowTemplateForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modales de formularios */}
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

      {/* Modales de detalles */}
      {selectedAnalysis && !showAnalysisForm && (
        <AnalysisDetails
          analysis={selectedAnalysis}
          onEdit={() => setShowAnalysisForm(true)}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}

      {selectedTemplate && !showTemplateForm && (
        <TemplateDetails
          template={selectedTemplate}
          analyses={analyses}
          onEdit={() => setShowTemplateForm(true)}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}