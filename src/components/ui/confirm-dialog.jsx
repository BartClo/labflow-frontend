import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirmar acción", 
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  type = "danger", // 'danger' | 'warning' | 'info'
  isConfirmDisabled = false
}) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: "text-red-500",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400 disabled:cursor-not-allowed"
    },
    warning: {
      icon: "text-yellow-500", 
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white disabled:bg-yellow-400 disabled:cursor-not-allowed"
    },
    info: {
      icon: "text-blue-500",
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 disabled:cursor-not-allowed"
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertTriangle className={`w-12 h-12 ${currentStyle.icon}`} />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="min-w-[100px]"
            >
              {cancelText}
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className={`min-w-[100px] ${currentStyle.confirmButton}`}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}