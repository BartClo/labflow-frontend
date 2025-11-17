import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export default function NotificationDialog({ 
  isOpen, 
  onClose, 
  title, 
  message,
  type = "info", // 'success' | 'error' | 'warning' | 'info'
  buttonText = "Aceptar"
}) {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      buttonStyle: "bg-green-600 hover:bg-green-700 text-white"
    },
    error: {
      icon: XCircle,
      iconColor: "text-red-500",
      buttonStyle: "bg-red-600 hover:bg-red-700 text-white"
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      buttonStyle: "bg-yellow-600 hover:bg-yellow-700 text-white"
    },
    info: {
      icon: Info,
      iconColor: "text-blue-500",
      buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <IconComponent className={`w-12 h-12 ${config.iconColor}`} />
          </div>
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {message}
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={onClose}
              className={`min-w-[100px] ${config.buttonStyle}`}
            >
              {buttonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}