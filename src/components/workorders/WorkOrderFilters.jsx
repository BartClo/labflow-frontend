import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "generada", label: "Generada" },
  { value: "preparacion", label: "En Preparación" },
  { value: "en_ejecucion", label: "En Ejecución" },
  { value: "resultado_registrado", label: "Resultado Registrado" },
  { value: "validada", label: "Validada" },
  { value: "completada", label: "Completada" }
];

const priorityOptions = [
  { value: "all", label: "Todas las prioridades" },
  { value: "normal", label: "Normal" },
  { value: "urgente", label: "Urgente" },
  { value: "critica", label: "Crítica" }
];

const technicianOptions = [
  { value: "all", label: "Todos los técnicos" },
  { value: "Juan Pérez", label: "Juan Pérez" },
  { value: "Ana Martínez", label: "Ana Martínez" },
  { value: "Carlos Silva", label: "Carlos Silva" },
  { value: "María González", label: "María González" }
];

export default function WorkOrderFilters({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      priority: "all",
      assigned_technician: "all"
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "all");

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtros:</span>
      </div>
      
      <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={filters.assigned_technician} onValueChange={(value) => updateFilter('assigned_technician', value)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {technicianOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearFilters}
          className="text-gray-600 hover:text-gray-800"
        >
          <X className="w-4 h-4 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  );
}