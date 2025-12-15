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
import { suppliesService } from "@/api/services";

export function SuppliesCombobox({ value, onValueChange, placeholder = "Seleccionar insumo..." }) {
  const [open, setOpen] = useState(false);
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load supplies data on component mount
  useEffect(() => {
    const loadSupplies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await suppliesService.getSupplies();
        // Ensure data is an array and has the expected structure
        const suppliesArray = Array.isArray(data) ? data : [];
        setSupplies(suppliesArray);
      } catch (err) {
        console.error('Error loading supplies:', err);
        setError('Error al cargar los insumos');
        setSupplies([]);
      } finally {
        setLoading(false);
      }
    };

    loadSupplies();
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
          <CommandInput placeholder="Buscar insumo..." />
          <CommandList>
            <CommandEmpty>
              {error ? error : "No se encontraron insumos."}
            </CommandEmpty>
            <CommandGroup>
              {supplies.map((item, index) => {
                // Handle different possible object structures
                const itemName = item.nombre || item.name || item.supplyName || `Insumo ${index + 1}`;
                
                return (
                  <CommandItem
                    key={`supply-${index}-${itemName}`}
                    value={itemName}
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