import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

const colorVariants = {
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600"
  },
  green: {
    bg: "bg-green-500", 
    light: "bg-green-50",
    text: "text-green-600"
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-50", 
    text: "text-purple-600"
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600"
  }
};

export default function StatsCard({ title, value, icon: Icon, color, isLoading, trend }) {
  const colors = colorVariants[color];

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${colors.bg} rounded-full opacity-5`} />
      
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colors.light}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-green-600 font-medium">{trend}</span>
            <span className="text-gray-500 ml-1">vs mes anterior</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}