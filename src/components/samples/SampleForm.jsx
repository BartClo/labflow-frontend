import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  { value: "otros", label: "Otros" },
];

const priorities = [
  { value: "normal", label: "Normal" },
  { value: "urgente", label: "Urgente" },
  { value: "critica", label: "Crítica" },
];

const samplingPoints = [
  {
    value: "laboratorio_uss_santiago",
    label: "Laboratorio Universidad San Sebastián - Sede Santiago",
  },
  { value: "efluente_planta", label: "Efluente Planta Procesamiento" },
  { value: "pozo_agua", label: "Pozo de Agua Potable" },
  { value: "suelo_agricola", label: "Suelo Agrícola" },
  { value: "aire_ambiente", label: "Aire Ambiente" },
];

const containerTypes = [
  { value: "frasco_vidrio", label: "Frasco de vidrio" },
  { value: "frasco_plastico", label: "Frasco de plástico" },
  { value: "bolsa_esteril", label: "Bolsa estéril" },
  { value: "tubo_ensayo", label: "Tubo de ensayo" },
  { value: "otro", label: "Otro" },
];

const preservationMethods = [
  { value: "refrigerado", label: "Refrigerado" },
  { value: "congelado", label: "Congelado" },
  { value: "acidificado", label: "Acidificado" },
  { value: "sin_preservacion", label: "Sin preservación" },
  { value: "otro", label: "Otro" },
];

// Análisis individuales disponibles - ahora se cargan dinámicamente del backend

export default function SampleForm({ sample, clients, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    internal_number: sample?.internal_number || "",
    scanned_barcode: sample?.scanned_barcode || "",
    client_id: sample?.client_id || "",
    client_name: sample?.client_name || "",
    sampling_point: sample?.sampling_point || "",
    sample_type: sample?.sample_type || "agua",
    reception_date:
      sample?.reception_date || new Date().toISOString().slice(0, 16),
    transport_conditions: {
      temperature: sample?.transport_conditions?.temperature || "",
      container_type: sample?.transport_conditions?.container_type || "",
      preservation: sample?.transport_conditions?.preservation || "",
    },
    received_by: sample?.received_by || "",
    sample_condition: sample?.sample_condition || "aceptable",
    requested_tests: sample?.requested_tests || [],
    completion_date: sample?.completion_date || "",
    observations: sample?.observations || "",
    priority: sample?.priority || "normal",
    status: sample?.status || "recibida",
  });

  const [templates, setTemplates] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [analysisSelectionMode, setAnalysisSelectionMode] =
    useState("individual");
  const [analysisSearch, setAnalysisSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");

  useEffect(() => {
    loadTemplatesAndAnalyses();
  }, []);

  useEffect(() => {
    if (!sample && !formData.internal_number) {
      setFormData((prev) => ({
        ...prev,
        internal_number: `MU-${Date.now().toString().slice(-6)}`,
      }));
    }
  }, [sample, formData.internal_number]);

  const loadTemplatesAndAnalyses = async () => {
    try {
      const [templatesData, analysesData] = await Promise.all([
        AnalysisTemplate.getAll(),
        Analysis.getAll(),
      ]);

      console.log("🔬 Raw templates data:", templatesData);
      console.log("🧪 Raw analyses data:", analysesData);

      const activeTemplates = (templatesData || []).filter(
        (t) => t.status === "activo" || t.activo !== false
      );
      const activeAnalyses = (analysesData || []).filter(
        (a) => a.status === "activo" || a.activo !== false
      );

      console.log("✅ Active templates:", activeTemplates);
      console.log("✅ Active analyses:", activeAnalyses);

      setTemplates(activeTemplates);
      setAnalyses(activeAnalyses);
    } catch (error) {
      console.error("❌ Error loading templates and analyses:", error);
      // Set empty arrays as fallback
      setTemplates([]);
      setAnalyses([]);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleClientSelect = (clientId) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (selectedClient) {
      setFormData((prev) => ({
        ...prev,
        client_id: clientId,
        client_name: selectedClient.name,
      }));
    }
  };

  const handleBarcodeScanner = () => {
    const scannedCode = `BC-${Date.now().toString().slice(-8)}`;
    setFormData((prev) => ({
      ...prev,
      scanned_barcode: scannedCode,
      internal_number: `MU-${scannedCode.split("-")[1]}`,
    }));
  };

  // Manejar selección/deselección de análisis
  const handleAnalysisToggle = (analysisId) => {
    setFormData((prev) => ({
      ...prev,
      requested_tests: prev.requested_tests.includes(analysisId)
        ? prev.requested_tests.filter((id) => id !== analysisId)
        : [...prev.requested_tests, analysisId],
    }));
  };

  // Función legacy - mantener por compatibilidad
  const handleTestToggle = handleAnalysisToggle;

  const handleTemplateSelect = (templateId) => {
    const template = templates.find((t) => t.idPlantilla === templateId);
    if (template) {
      // Alternar selección - si ya está seleccionada, deseleccionarla
      if (selectedTemplate?.idPlantilla === templateId) {
        setSelectedTemplate(null);
        setFormData((prev) => ({
          ...prev,
          requested_tests: [],
        }));
      } else {
        setSelectedTemplate(template);

        // Obtener IDs de análisis de la plantilla
        const templateAnalysisIds = template.analisisIncluidos || [];

        setFormData((prev) => ({
          ...prev,
          requested_tests: templateAnalysisIds,
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Filtrar análisis por búsqueda
  const filteredAnalyses = analyses.filter((analysis) => {
    if (!analysisSearch) return true;
    const searchLower = analysisSearch.toLowerCase();
    return (
      analysis.nombreAnalisis?.toLowerCase().includes(searchLower) ||
      analysis.codigo?.toLowerCase().includes(searchLower) ||
      analysis.categoria?.toLowerCase().includes(searchLower) ||
      analysis.metodoEnsayo?.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar plantillas por búsqueda - mostrando todas las plantillas disponibles
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      !templateSearch ||
      (t.nombrePlantilla &&
        t.nombrePlantilla
          .toLowerCase()
          .includes(templateSearch.toLowerCase())) ||
      (t.descripcion &&
        t.descripcion.toLowerCase().includes(templateSearch.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {sample ? "Editar Muestra" : "Ingresar Nueva Muestra"}
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
                <p className="text-sm text-gray-500">
                  Se genera automáticamente
                </p>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBarcodeScanner}
                  >
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
                    {clients && clients.length > 0 ? (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.company}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="">
                        No hay clientes disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampling_point">Punto de Muestreo *</Label>
                <Select
                  value={formData.sampling_point}
                  onValueChange={(value) =>
                    handleInputChange("sampling_point", value)
                  }
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
                    handleInputChange("sample_type", value);
                    // Limpiar análisis seleccionados al cambiar tipo
                    setFormData((prev) => ({ ...prev, requested_tests: [] }));
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
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
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
              <h3 className="text-lg font-semibold">
                Condiciones de Transporte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    value={formData.transport_conditions.temperature}
                    onChange={(e) =>
                      handleInputChange(
                        "transport_conditions.temperature",
                        e.target.value
                      )
                    }
                    placeholder="Ej: 4°C"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="container_type">Tipo de Contenedor</Label>
                  <Select
                    value={formData.transport_conditions.container_type}
                    onValueChange={(value) =>
                      handleInputChange(
                        "transport_conditions.container_type",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar contenedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {containerTypes.map((container) => (
                        <SelectItem
                          key={container.value}
                          value={container.value}
                        >
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
                    onValueChange={(value) =>
                      handleInputChange(
                        "transport_conditions.preservation",
                        value
                      )
                    }
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
                  onChange={(e) =>
                    handleInputChange("reception_date", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="received_by">Recibida por *</Label>
                <Input
                  id="received_by"
                  value={formData.received_by}
                  onChange={(e) =>
                    handleInputChange("received_by", e.target.value)
                  }
                  placeholder="Nombre del técnico"
                  required
                />
              </div>
            </div>

            {/* Análisis solicitados con tabs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <Label className="text-lg font-semibold">
                  Análisis Solicitados *
                </Label>
              </div>

              <Tabs
                value={analysisSelectionMode}
                onValueChange={setAnalysisSelectionMode}
              >
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger
                    value="individual"
                    className="flex items-center gap-2"
                  >
                    <FlaskConical className="w-4 h-4" />
                    Individuales
                  </TabsTrigger>
                  <TabsTrigger
                    value="template"
                    className="flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Por Plantilla
                  </TabsTrigger>
                </TabsList>

                {/* Tab de análisis individuales */}
                <TabsContent value="individual" className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Selecciona los análisis individuales que necesita esta
                    muestra
                  </p>

                  {/* Buscador de análisis */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar análisis..."
                      value={analysisSearch}
                      onChange={(e) => setAnalysisSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Lista de análisis */}
                  {filteredAnalyses.length === 0 ? (
                    <div className="text-center py-8">
                      {analysisSearch ? (
                        <p className="text-sm text-gray-500">
                          No se encontraron análisis que coincidan con "
                          {analysisSearch}"
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No hay análisis disponibles
                        </p>
                      )}
                    </div>
                  ) : (
                    <Card className="border-2">
                      <CardContent className="p-0">
                        <div className="max-h-80 overflow-y-auto">
                          <div className="divide-y">
                            {filteredAnalyses.map((analysis) => {
                              const isSelected =
                                formData.requested_tests.includes(
                                  analysis.idAnalisis
                                );
                              return (
                                <div
                                  key={analysis.idAnalisis}
                                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex-shrink-0">
                                      <div
                                        className={`w-4 h-4 rounded border ${
                                          isSelected
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-gray-300"
                                        } flex items-center justify-center cursor-pointer`}
                                        onClick={() =>
                                          handleAnalysisToggle(
                                            analysis.idAnalisis
                                          )
                                        }
                                      >
                                        {isSelected && (
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      className="flex-1"
                                      onClick={() =>
                                        handleAnalysisToggle(
                                          analysis.idAnalisis
                                        )
                                      }
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium">
                                          {analysis.nombreAnalisis}
                                        </p>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {analysis.codigo}
                                        </Badge>
                                        <Badge className="text-xs bg-purple-100 text-purple-800">
                                          {analysis.categoria}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {analysis.metodoEnsayo ||
                                          "No especificado"}
                                      </p>
                                      {analysis.parametrosMedir?.parametros &&
                                        analysis.parametrosMedir.parametros
                                          .length > 0 && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs text-gray-500">
                                              {
                                                analysis.parametrosMedir
                                                  .parametros.length
                                              }{" "}
                                              parámetros
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="font-semibold text-lg">
                                      $
                                      {analysis.precioClp?.toLocaleString() ||
                                        0}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {analysis.duracionEstimadaHoras || 0}h
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Análisis seleccionados */}
                  {formData.requested_tests.length > 0 && (
                    <div className="space-y-2 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        Análisis seleccionados ({formData.requested_tests.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.requested_tests.map((analysisId) => {
                          const analysis = analyses.find(
                            (a) => a.idAnalisis === analysisId
                          );
                          return analysis ? (
                            <div
                              key={analysisId}
                              className="flex items-center bg-white rounded border px-3 py-1"
                            >
                              <span className="text-xs font-medium text-blue-900">
                                {analysis.nombreAnalisis}
                              </span>
                              {analysis.precioClp && (
                                <span className="text-xs text-gray-600 ml-2">
                                  ${analysis.precioClp.toLocaleString()}
                                </span>
                              )}
                            </div>
                          ) : null;
                        })}
                      </div>
                      {/* Total estimado */}
                      {analyses.length > 0 && (
                        <div className="text-sm font-semibold text-blue-900 pt-2 border-t border-blue-200">
                          Total estimado: $
                          {formData.requested_tests
                            .reduce((total, analysisId) => {
                              const analysis = analyses.find(
                                (a) => a.idAnalisis === analysisId
                              );
                              return total + (analysis?.precioClp || 0);
                            }, 0)
                            .toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Tab de plantillas */}
                <TabsContent value="template" className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Selecciona una plantilla predefinida de análisis para este
                    tipo de muestra
                  </p>

                  {/* Buscador de plantillas */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar plantillas..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Lista de plantillas */}
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 mb-2">
                        {templateSearch
                          ? `No se encontraron plantillas que coincidan con "${templateSearch}"`
                          : "No hay plantillas disponibles"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cambia a "Individuales" para seleccionar análisis
                        específicos
                      </p>
                    </div>
                  ) : (
                    <Card className="border-2">
                      <CardContent className="p-0">
                        <div className="max-h-80 overflow-y-auto">
                          <div className="divide-y">
                            {filteredTemplates.map((template) => {
                              const isSelected =
                                selectedTemplate?.idPlantilla ===
                                template.idPlantilla;
                              const templateAnalyses = analyses.filter((a) =>
                                template.analisisIncluidos?.includes(
                                  a.idAnalisis
                                )
                              );
                              return (
                                <div
                                  key={template.id}
                                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex-shrink-0">
                                      <div
                                        className={`w-4 h-4 rounded border ${
                                          isSelected
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-gray-300"
                                        } flex items-center justify-center cursor-pointer`}
                                        onClick={() =>
                                          handleTemplateSelect(
                                            template.idPlantilla
                                          )
                                        }
                                      >
                                        {isSelected && (
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      className="flex-1"
                                      onClick={() =>
                                        handleTemplateSelect(
                                          template.idPlantilla
                                        )
                                      }
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium">
                                          {template.nombrePlantilla}
                                        </p>
                                        <Badge className="text-xs bg-green-100 text-green-800">
                                          Plantilla
                                        </Badge>
                                      </div>
                                      {template.descripcion && (
                                        <p className="text-sm text-gray-600 mb-2">
                                          {template.descripcion}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                        <span>
                                          {template.analisisIncluidos?.length ||
                                            0}{" "}
                                          análisis incluidos
                                        </span>
                                        <span
                                          className={`text-xs px-2 py-1 rounded ${
                                            template.estado === "Activo"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-600"
                                          }`}
                                        >
                                          {template.estado}
                                        </span>
                                      </div>
                                      {templateAnalyses.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {templateAnalyses
                                            .slice(0, 3)
                                            .map((analysis) => (
                                              <Badge
                                                key={analysis.idAnalisis}
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                {analysis.nombreAnalisis}
                                              </Badge>
                                            ))}
                                          {templateAnalyses.length > 3 && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              +{templateAnalyses.length - 3} más
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    {template.precioPaquete ? (
                                      <p className="font-semibold text-lg">
                                        $
                                        {template.precioPaquete.toLocaleString()}
                                      </p>
                                    ) : (
                                      templateAnalyses.length > 0 && (
                                        <p className="font-semibold text-lg">
                                          $
                                          {templateAnalyses
                                            .reduce(
                                              (total, analysis) =>
                                                total +
                                                (analysis.precioClp || 0),
                                              0
                                            )
                                            .toLocaleString()}
                                        </p>
                                      )
                                    )}
                                    {template.codigoPaquete && (
                                      <p className="text-sm text-gray-600">
                                        {template.codigoPaquete}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Plantilla seleccionada */}
                  {selectedTemplate && (
                    <div className="space-y-2 bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        Plantilla seleccionada:{" "}
                        {selectedTemplate.nombrePlantilla}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analyses
                          .filter((a) =>
                            selectedTemplate.analisisIncluidos?.includes(
                              a.idAnalisis
                            )
                          )
                          .map((analysis) => (
                            <div
                              key={analysis.idAnalisis}
                              className="flex items-center bg-white rounded border px-3 py-1"
                            >
                              <span className="text-xs font-medium text-green-900">
                                {analysis.nombreAnalisis}
                              </span>
                              {analysis.precioClp && (
                                <span className="text-xs text-gray-600 ml-2">
                                  ${analysis.precioClp.toLocaleString()}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                      {/* Total de la plantilla */}
                      <div className="text-sm font-semibold text-green-900 pt-2 border-t border-green-200">
                        Total plantilla: $
                        {selectedTemplate.precioPaquete
                          ? selectedTemplate.precioPaquete.toLocaleString()
                          : analyses
                              .filter((a) =>
                                selectedTemplate.analisisIncluidos?.includes(
                                  a.idAnalisis
                                )
                              )
                              .reduce(
                                (total, analysis) =>
                                  total + (analysis.precioClp || 0),
                                0
                              )
                              .toLocaleString()}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {formData.requested_tests.length === 0 && (
                <p className="text-sm text-red-600">
                  Selecciona al menos un análisis o una plantilla
                </p>
              )}
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) =>
                  handleInputChange("observations", e.target.value)
                }
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
                disabled={
                  formData.requested_tests.length === 0 || !formData.client_id
                }
              >
                {sample ? "Actualizar Muestra" : "Registrar Muestra"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
