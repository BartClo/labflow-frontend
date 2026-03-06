import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  FlaskConical,
  User,
  Calendar,
  Settings,
  Building2,
  FileText,
  Clock,
  Droplet,
  CheckCircle,
  XCircle,
  Barcode
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  abierta: { color: "bg-blue-100 text-blue-800", label: "Abierta" },
  generada: { color: "bg-gray-100 text-gray-800", label: "Generada" },
  preparacion: { color: "bg-blue-100 text-blue-800", label: "En Preparación" },
  en_proceso: { color: "bg-orange-100 text-orange-800", label: "En Proceso" },
  en_ejecucion: { color: "bg-orange-100 text-orange-800", label: "En Ejecución" },
  resultado_registrado: { color: "bg-purple-100 text-purple-800", label: "Resultado Registrado" },
  validada: { color: "bg-green-100 text-green-800", label: "Validada" },
  completada: { color: "bg-green-100 text-green-800", label: "Completada" },
  finalizada: { color: "bg-green-100 text-green-800", label: "Finalizada" },
  cancelada: { color: "bg-red-100 text-red-800", label: "Cancelada" }
};

const priorityConfig = {
  normal: { color: "bg-gray-100 text-gray-800", label: "Normal" },
  baja: { color: "bg-gray-100 text-gray-800", label: "Baja" },
  media: { color: "bg-yellow-100 text-yellow-800", label: "Media" },
  urgente: { color: "bg-orange-100 text-orange-800", label: "Urgente" },
  alta: { color: "bg-orange-100 text-orange-800", label: "Alta" },
  critica: { color: "bg-red-100 text-red-800", label: "Crítica" }
};

const InfoCard = ({ icon: Icon, title, value, iconColor = "text-gray-500" }) => (
  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 font-medium mb-1">{title}</p>
        <p className="text-sm text-gray-900 font-semibold truncate">{value || 'N/A'}</p>
      </div>
    </div>
  </div>
);

export default function WorkOrderInfoModal({ workOrder, onClose }) {
  if (!workOrder) return null;

  // Use normalized tasks (workOrder.tasks) which have consistent field names
  const tareas = workOrder.tasks || workOrder.tareas || [];
  const sampleNumbers = tareas
    .map(t => t.numero_muestra || t.numeroMuestra)
    .filter(Boolean)
    .join(', ') || workOrder.sample_numbers || 'N/A';
  const analysisNames = [...new Set(
    tareas.map(t => t.nombre_analisis || t.nombreAnalisis).filter(Boolean)
  )].join(', ') || workOrder.test_parameter || 'N/A';
  const priority = workOrder.priority || 'normal';

  // Technician info from transform
  const tecnicoNombre = workOrder.tecnico_asignado?.nombre_completo
    || workOrder.assigned_technician
    || 'Sin asignar';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Información de la OT</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm text-gray-600">
                  {workOrder.ot_number}
                </p>
                <Badge className={`${statusConfig[workOrder.status?.toLowerCase()]?.color || 'bg-gray-100 text-gray-800'} border`}>
                  {statusConfig[workOrder.status?.toLowerCase()]?.label || workOrder.status}
                </Badge>
                <Badge className={`${priorityConfig[priority]?.color || 'bg-gray-100 text-gray-800'} border`}>
                  {priorityConfig[priority]?.label || priority}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Grid de información - 3 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Muestra(s) */}
            <InfoCard
              icon={Droplet}
              title="Muestra(s)"
              value={sampleNumbers}
              iconColor="text-blue-600"
            />

            {/* Códigos de barras (todos los tasks) */}
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Barcode className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 font-medium mb-1">Códigos de Barras</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tareas.map((t, i) => {
                      // Use codigo_barras if available, fallback to numero_muestra (which is what gets encoded as barcode)
                      const bc = t.codigo_barras || t.codigoBarras || t.numero_muestra || t.numeroMuestra;
                      if (!bc) return null;
                      return (
                        <Badge key={i} variant="outline" className="text-xs bg-white font-mono">
                          {bc}
                        </Badge>
                      );
                    })}
                    {!tareas.some(t => t.codigo_barras || t.codigoBarras || t.numero_muestra || t.numeroMuestra) && (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Total de muestras */}
            <InfoCard
              icon={FlaskConical}
              title="Total Muestras"
              value={`${tareas.length} muestra${tareas.length !== 1 ? 's' : ''}`}
              iconColor="text-purple-600"
            />

            {/* Análisis */}
            <InfoCard
              icon={FlaskConical}
              title="Análisis"
              value={analysisNames}
              iconColor="text-purple-600"
            />

            {/* Estado */}
            <InfoCard
              icon={Settings}
              title="Estado"
              value={statusConfig[workOrder.status?.toLowerCase()]?.label || workOrder.status || 'N/A'}
              iconColor="text-orange-600"
            />

            {/* Fecha de creación de OT */}
            <InfoCard
              icon={Calendar}
              title="OT Creada"
              value={workOrder.created_date 
                ? format(new Date(workOrder.created_date), 'dd/MM/yyyy HH:mm', { locale: es })
                : 'N/A'}
              iconColor="text-indigo-600"
            />

            {/* Fecha de finalización */}
            <InfoCard
              icon={FileText}
              title="Fecha Finalización"
              value={workOrder.completion_date 
                ? format(new Date(workOrder.completion_date), 'dd/MM/yyyy HH:mm', { locale: es })
                : 'En curso'}
              iconColor="text-gray-600"
            />

            {/* Técnico asignado */}
            <InfoCard
              icon={User}
              title="Técnico Asignado"
              value={tecnicoNombre}
              iconColor="text-green-600"
            />

            {/* Tareas completadas */}
            <InfoCard
              icon={Clock}
              title="Progreso"
              value={`${workOrder.completed_tasks || 0} de ${tareas.length} completadas`}
              iconColor="text-blue-600"
            />
          </div>

          {/* Lista de tareas si hay más de una */}
          {tareas.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tareas Incluidas</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tareas.map((tarea, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="text-sm font-medium">{tarea.nombre_analisis || tarea.nombreAnalisis || 'Análisis'}</span>
                        <span className="text-xs text-gray-500 ml-2">{tarea.numero_muestra || tarea.numeroMuestra}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(tarea.codigo_barras || tarea.codigoBarras) && (
                        <span className="text-xs text-gray-400">[{tarea.codigo_barras || tarea.codigoBarras}]</span>
                      )}
                            {
                              (() => {
                                const rawState = tarea.estado_analisis || tarea.estadoAnalisis || 'PENDIENTE';
                                const normalized = String(rawState).toLowerCase();
                                // Create a human-friendly label: replace underscores, lowercase, capitalize first letter
                                const label = normalized.replace(/_/g, ' ');
                                const labelFormatted = label.charAt(0).toUpperCase() + label.slice(1);

                                let colorClass = 'bg-gray-100 text-gray-800';
                                if (normalized.includes('complet')) colorClass = 'bg-green-100 text-green-800';
                                else if (normalized.includes('proceso') || normalized.includes('ejecucion')) colorClass = 'bg-yellow-100 text-yellow-800';
                                else if (normalized.includes('valid') || normalized.includes('finaliz')) colorClass = 'bg-green-100 text-green-800';
                                else if (normalized.includes('cancel')) colorClass = 'bg-red-100 text-red-800';

                                return (
                                  <Badge className={`text-xs ${colorClass}`}>
                                    {labelFormatted}
                                  </Badge>
                                );
                              })()
                            }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados registrados (visible cuando la OT está completada/finalizada o hay resultados) */}
          {(() => {
            const tareasConResultado = tareas.filter(t => {
              const val = t.valor_medido ?? t.valorMedido;
              return val !== null && val !== undefined && val !== '';
            });
            if (tareasConResultado.length === 0) return null;
            return (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Resultados Registrados
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-700">Muestra</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-700">Análisis</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-700">Valor Medido</th>
                        <th className="text-center px-4 py-2 font-medium text-gray-700">Cumple</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-700">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tareasConResultado.map((tarea, idx) => {
                        const valor = tarea.valor_medido ?? tarea.valorMedido;
                        const cumple = tarea.cumple_normativa ?? tarea.cumpleNormativa;
                        const obs = tarea.observaciones || '';
                        const unidad = tarea.unidad_medida || tarea.unidadMedida || '';
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">
                              {tarea.numero_muestra || tarea.numeroMuestra || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {tarea.nombre_analisis || tarea.nombreAnalisis || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-semibold">
                              {valor}{unidad ? ` ${unidad}` : ''}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {cumple === true && (
                                <span className="inline-flex items-center gap-1 text-green-700">
                                  <CheckCircle className="w-4 h-4" /> Sí
                                </span>
                              )}
                              {cumple === false && (
                                <span className="inline-flex items-center gap-1 text-red-700">
                                  <XCircle className="w-4 h-4" /> No
                                </span>
                              )}
                              {cumple === null || cumple === undefined ? (
                                <span className="text-gray-400">—</span>
                              ) : null}
                            </td>
                            <td className="px-4 py-2 text-gray-500 text-xs max-w-[200px] truncate">
                              {obs || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}