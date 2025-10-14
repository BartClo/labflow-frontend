import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "recibida", label: "Recibida" },
  { value: "en_preparacion", label: "En Preparación" },
  { value: "en_analisis", label: "En Análisis" },
  { value: "completada", label: "Completada" },
  { value: "entregada", label: "Entregada" }
];

const typeOptions = [
  { value: "all", label: "Todos los tipos" },
  { value: "agua", label: "Agua" },
  { value: "suelo", label: "Suelo" },
  { value: "aire", label: "Aire" },
  { value: "alimentos", label: "Alimentos" },
  { value: "otros", label: "Otros" }
];

const priorityOptions = [
  { value: "all", label: "Todas las prioridades" },
  { value: "normal", label: "Normal" },
  { value: "urgente", label: "Urgente" },
  { value: "critica", label: "Crítica" }
];

export default function SampleFilters({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      sample_type: "all", 
      priority: "all"
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
      
      <Select value={filters.sample_type} onValueChange={(value) => updateFilter('sample_type', value)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((option) => (
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