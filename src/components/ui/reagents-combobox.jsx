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
import { reagentsService } from "@/api/services";

export function ReagentsCombobox({ value, onValueChange, placeholder = "Seleccionar reactivo..." }) {
  const [open, setOpen] = useState(false);
  const [reagents, setReagents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load reagents data on component mount
  useEffect(() => {
    const loadReagents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reagentsService.getReagents();
        // Ensure data is an array and has the expected structure
        const reagentsArray = Array.isArray(data) ? data : [];
        setReagents(reagentsArray);
      } catch (err) {
        console.error('Error loading reagents:', err);
        setError('Error al cargar los reactivos');
        setReagents([]);
      } finally {
        setLoading(false);
      }
    };

    loadReagents();
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
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Buscar reactivo..." />
          <CommandList>
            <CommandEmpty>
              {error ? error : "No se encontraron reactivos."}
            </CommandEmpty>
            <CommandGroup>
              {reagents.map((item, index) => {
                // Handle different possible object structures
                const itemName = item.nombre || item.name || item.reagentName || `Reactivo ${index + 1}`;
                
                return (
                  <CommandItem
                    key={`reagent-${index}-${itemName}`}
                    value={`reagent-${index}`}
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
                    <div className="flex flex-col">
                      <span>{itemName}</span>
                      {(item.codigo || item.code) && (
                        <span className="text-xs text-gray-500">
                          Código: {item.codigo || item.code}
                        </span>
                      )}
                      {(item.marca || item.brand) && (
                        <span className="text-xs text-gray-500">
                          Marca: {item.marca || item.brand}
                        </span>
                      )}
                    </div>
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