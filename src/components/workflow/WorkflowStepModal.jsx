import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  User, 
  Calendar,
  Clock,
  Settings,
  FlaskConical,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  pendiente: { 
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
    label: "Pendiente"
  },
  en_progreso: { 
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
    label: "En Progreso"
  },
  completado: { 
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Completado"
  },
  pausado: { 
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
    label: "Pausado"
  },
  fallido: { 
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
    label: "Fallido"
  }
};

export default function WorkflowStepModal({ step, workOrder, onClose, onStatusUpdate }) {
  if (!step) return null;

  const config = statusConfig[step.status] || statusConfig.pendiente;
  const StatusIcon = config.icon;

  // Extract task results from the work order data
  const tareas = workOrder?.tasks || workOrder?.tareas || [];
  const tareasConResultado = tareas.filter(t => {
    const val = t.valor_medido ?? t.valorMedido;
    return val !== null && val !== undefined && val !== '';
  });

  // Check if this step is a quality/validation step that would have results
  const stepNameNorm = (step.step_name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const isResultsStep =
    stepNameNorm.includes('control') ||
    stepNameNorm.includes('calidad') ||
    stepNameNorm.includes('validacion') ||
    stepNameNorm.includes('resultado');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                step.status === 'completado' ? 'bg-green-100' :
                step.status === 'en_progreso' ? 'bg-blue-100' :
                'bg-gray-100'
              }`}>
                <StatusIcon className={`w-6 h-6 ${
                  step.status === 'completado' ? 'text-green-600' :
                  step.status === 'en_progreso' ? 'text-blue-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div>
                <CardTitle className="text-xl">{step.step_name}</CardTitle>
                <Badge className={`${config.color} mt-2`}>
                  {config.label}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Información del Paso</h3>
              
              {step.assigned_to && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Asignado a</p>
                    <p className="font-medium">{step.assigned_to}</p>
                  </div>
                </div>
              )}
              
              {step.started_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Inicio</p>
                    <p className="font-medium">
                      {format(new Date(step.started_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              )}
              
              {step.completed_at && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Completado</p>
                    <p className="font-medium">
                      {format(new Date(step.completed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              )}
              
              {step.duration_minutes && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Duración</p>
                    <p className="font-medium">{step.duration_minutes} minutos</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Detalles Técnicos</h3>
              
              {step.method_used && (
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Método</p>
                    <p className="font-medium">{step.method_used}</p>
                  </div>
                </div>
              )}
              
              {step.equipment_used && step.equipment_used.length > 0 && (
                <div className="flex items-start gap-3">
                  <FlaskConical className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Equipos</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {step.equipment_used.map((eq, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Show task parameters and results for QC/validation steps */}
              {tareas.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-500" />
                    <p className="text-sm text-gray-600 font-medium">Parámetros de la OT</p>
                  </div>
                  <div className="space-y-2">
                    {tareas.map((tarea, idx) => {
                      const nombre = tarea.nombre_analisis || tarea.nombreAnalisis || 'Análisis';
                      const parametro = tarea.nombre_parametro || tarea.nombreParametro || nombre;
                      const normativa = tarea.normativa || tarea.norma || tarea.codigo_norma || tarea.codigoNorma;
                      const unidad = tarea.unidad_medida || tarea.unidadMedida || '';
                      const valor = tarea.valor_medido ?? tarea.valorMedido;
                      const cumple = tarea.cumple_normativa ?? tarea.cumpleNormativa;
                      const obs = tarea.observaciones || '';
                      const muestra = tarea.numero_muestra || tarea.numeroMuestra || '';
                      const barcode = tarea.codigo_barras || tarea.codigoBarras || '';

                      return (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">{muestra}</span>
                            {barcode && (
                              <span className="text-xs text-gray-400 font-mono">[{barcode}]</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Parámetro:</span>{' '}
                              <span className="font-medium text-gray-800">{parametro}</span>
                            </div>
                            {normativa && (
                              <div>
                                <span className="text-gray-500">Normativa:</span>{' '}
                                <span className="font-medium text-gray-800">{normativa}</span>
                              </div>
                            )}
                            {valor !== null && valor !== undefined && valor !== '' ? (
                              <>
                                <div>
                                  <span className="text-gray-500">Valor medido:</span>{' '}
                                  <span className="font-semibold text-gray-900">{valor}{unidad ? ` ${unidad}` : ''}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Cumple:</span>{' '}
                                  {cumple === true && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">Sí</Badge>
                                  )}
                                  {cumple === false && (
                                    <Badge className="bg-red-100 text-red-800 text-xs">No</Badge>
                                  )}
                                  {(cumple === null || cumple === undefined) && (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </div>
                                {obs && (
                                  <div className="col-span-2">
                                    <span className="text-gray-500">Observaciones:</span>{' '}
                                    <span className="text-gray-700">{obs}</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="col-span-2">
                                <span className="text-gray-400 italic">Sin resultado registrado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fallback if no data at all */}
              {!step.method_used && !(step.equipment_used?.length > 0) && tareas.length === 0 && (
                <p className="text-sm text-gray-400 italic">Sin detalles técnicos disponibles</p>
              )}
            </div>
          </div>

          {/* Resultados */}
          {step.results && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Resultados</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Parámetro</p>
                    <p className="font-medium">{step.results.parameter}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="font-medium">
                      {step.results.value} {step.results.unit}
                    </p>
                  </div>
                  {step.results.limit && (
                    <div>
                      <p className="text-sm text-gray-600">Límite</p>
                      <p className="font-medium">{step.results.limit}</p>
                    </div>
                  )}
                  {step.results.within_limits !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <Badge className={
                        step.results.within_limits 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {step.results.within_limits ? 'Dentro de límites' : 'Fuera de límites'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {step.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Observaciones</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{step.notes}</p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {step.status === 'en_progreso' && (
              <Button
                onClick={() => {
                  onStatusUpdate && onStatusUpdate(step.id, 'completado');
                  onClose();
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Completado
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}