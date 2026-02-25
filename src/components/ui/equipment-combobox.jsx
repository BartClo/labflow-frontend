import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { equipmentService } from "@/api/services";

export function EquipmentCombobox({ value, onValueChange, placeholder = "Seleccionar equipo..." }) {
  const [open, setOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load equipment data on component mount
  useEffect(() => {
    const loadEquipment = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await equipmentService.getEquipment();
        // Ensure data is an array and has the expected structure
        const equipmentArray = Array.isArray(data) ? data : [];
        setEquipment(equipmentArray);
      } catch (err) {
        console.error('Error loading equipment:', err);
        setError('Error al cargar los equipos');
        setEquipment([]);
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {loading ? (
            "Cargando..."
          ) : value ? (
            value
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-[9999999]" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Buscar equipo..." />
          <CommandList>
            <CommandEmpty>
              {error ? error : "No se encontraron equipos."}
            </CommandEmpty>
            <CommandGroup>
              {equipment.map((item, index) => {
                // Handle different possible object structures
                const itemName = item.name || item.nombre || item.equipmentName || item.equipment_name || `Equipo ${index + 1}`;
                
                return (
                  <CommandItem
                    key={`equipment-${index}-${itemName}`}
                    value={`equipment-${index}`}
                    keywords={[itemName]}
                    onSelect={() => {
                      onValueChange(itemName);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === itemName ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {itemName}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}