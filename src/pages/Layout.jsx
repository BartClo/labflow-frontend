import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/context/AuthContext";
import { WorkOrder } from "@/api/entities";
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  Settings,
  Bell,
  Search,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  Mail
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import logo from "/assets/image/LabFlow.svg";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ 
    otActivas: 0, 
    otUrgentes: 0, 
    otEnProceso: 0 
  });

  // Load system statistics from actual work orders data
  useEffect(() => {
    const loadStats = async () => {
      try {
        const orders = await WorkOrder.getAll();
        const ordersList = Array.isArray(orders) ? orders : (orders?.content || []);
        
        console.log('📊 Stats - Orders loaded:', ordersList.length, ordersList);
        
        // "Activas" = any OT not completed or cancelled
        const activas = ordersList.filter(o => {
          const status = (o.status || o.estado || '').toLowerCase();
          return status !== 'completada' && status !== 'cancelada';
        }).length;
        
        // "Urgentes" = priority is urgente or critica, and not completed/cancelled
        const urgentes = ordersList.filter(o => {
          const priority = (o.priority || o.prioridad || '').toLowerCase();
          const status = (o.status || o.estado || '').toLowerCase();
          return (priority === 'urgente' || priority === 'critica') &&
                 status !== 'completada' && status !== 'cancelada';
        }).length;
        
        // "En Proceso" = status is en_proceso
        const enProceso = ordersList.filter(o => {
          const status = (o.status || o.estado || '').toLowerCase();
          return status === 'en_proceso';
        }).length;
        
        console.log('📊 Stats computed:', { activas, urgentes, enProceso });
        setStats({ otActivas: activas, otUrgentes: urgentes, otEnProceso: enProceso });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };

    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check if user is admin
  const isAdmin = user?.rol?.nombre === "ADMINISTRADOR";

  // Build navigation items dynamically based on user role
  const navigationItems = [
    {
      title: "Panel Principal",
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
    },
    {
      title: "Clientes",
      url: createPageUrl("Clients"),
      icon: Users,
    },
    {
      title: "Muestras",
      url: createPageUrl("Samples"),
      icon: FlaskConical,
    },
    {
      title: "Órdenes de Trabajo",
      url: createPageUrl("OTGeneration"),
      icon: Settings,
    },
    {
      title: "Procedimientos",
      url: createPageUrl("Procedures"),
      icon: Settings,
    },
    ...(isAdmin ? [
      {
        title: "Administración",
        url: createPageUrl("Administration"),
        icon: Shield,
      },
    ] : []),
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    if (nombre && apellido) {
      return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    }
    return (nombre || user.email || 'U').charAt(0).toUpperCase();
  };

  // Get user display name - prioritize nombre/apellido, fallback to username/email
  const getUserDisplayName = () => {
    if (!user) return 'Usuario Lab';
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    // If nombre and apellido exist and aren't just the username repeated
    if (nombre && apellido && !(nombre.toLowerCase() === apellido.toLowerCase() && nombre.toLowerCase() === (user.username || '').toLowerCase())) {
      return `${nombre} ${apellido}`;
    }
    if (nombre && nombre.toLowerCase() !== (user.username || '').toLowerCase()) {
      return nombre;
    }
    if (apellido && apellido.toLowerCase() !== (user.username || '').toLowerCase()) {
      return apellido;
    }
    // If nombre/apellido are just the username, show email or formatted username
    if (user.email && user.email !== user.username) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return nombre || user.username || user.email || 'Usuario Lab';
  };

  // Get user role
  const getUserRole = () => {
    if (!user) return 'Usuario';
    // Check if rol is an object with nombre property or just a string
    if (user.rol) {
      return user.rol.nombre || user.rol.name || user.rol || 'Usuario';
    }
    return user.role || 'Usuario';
  };

  return (
    <SidebarProvider defaultOpen={sidebarOpen} open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <style>{`
        :root {
          --primary-blue: #1e40af;
          --primary-blue-light: #3b82f6;
          --primary-blue-dark: #1e3a8a;
          --success-green: #059669;
          --warning-amber: #d97706;
          --error-red: #dc2626;
          --gray-50: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-300: #cbd5e1;
          --gray-500: #64748b;
          --gray-700: #334155;
          --gray-900: #0f172a;
        }
      `}</style>
      
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 bg-white" collapsible="icon">
          <SidebarHeader className="border-b border-gray-100 p-6 group-data-[collapsible=icon]:p-4 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <img src={logo} alt="LabFlow Logo" className="w-full h-full object-contain" />
              </div> 
              <div className="group-data-[collapsible=icon]:hidden">
                
                <h2 className="font-bold text-gray-900 text-lg">LabFlow</h2>
                <p className="text-xs text-gray-500 font-medium">Sistema LIMS</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2 group-data-[collapsible=icon]:hidden">
                Navegación
              </SidebarGroupLabel>
              <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
                <SidebarMenu className="group-data-[collapsible=icon]:space-y-1 group-data-[collapsible=icon]:w-full">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.title}
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:mx-auto ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500 group-data-[collapsible=icon]:border-r-0 group-data-[collapsible=icon]:border-l-2 group-data-[collapsible=icon]:border-blue-500' : 'text-gray-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:justify-center">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="group-data-[collapsible=icon]:mt-4">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2 group-data-[collapsible=icon]:hidden">
                Estado del Sistema
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:space-y-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
                  <div className="flex items-center justify-between text-sm group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:w-full">
                    <span className="text-gray-600 group-data-[collapsible=icon]:hidden">OT Activas</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800" title="OT Activas">
                      {stats.otActivas}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:w-full">
                    <span className="text-gray-600 group-data-[collapsible=icon]:hidden">Urgentes</span>
                    <Badge variant="destructive" className="bg-red-100 text-red-800" title="Urgentes">
                      {stats.otUrgentes}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:w-full">
                    <span className="text-gray-600 group-data-[collapsible=icon]:hidden">En Proceso</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800" title="En Proceso">
                      {stats.otEnProceso}
                    </Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:py-3">
            {/* Footer vacío o con información adicional si es necesario */}
          </SidebarFooter>
        </Sidebar>

        {/* Botón de toggle flotante en la intersección */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex items-center justify-center w-8 h-8 bg-white hover:bg-blue-50 rounded-full transition-all duration-200 text-gray-600 hover:text-blue-700 border border-gray-200 hover:border-blue-400 shadow-md hover:shadow-lg fixed z-50"
          style={{
            left: sidebarOpen ? 'calc(16rem - 1rem)' : 'calc(3rem - 1rem)',
            top: '3.2rem',
            transition: 'left 200ms ease-linear'
          }}
          title={sidebarOpen ? "Colapsar sidebar" : "Expandir sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <main className="flex-1 flex flex-col">
          {/* Header superior */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Botón mobile */}
                <SidebarTrigger className="md:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                    3
                  </Badge>
                </Button>
                
                {/* Dropdown de usuario */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors duration-200">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-medium text-sm">{getUserInitials()}</span>
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="font-medium text-gray-900 text-sm">{getUserDisplayName()}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500">{getUserRole()}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" disabled>
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-xs truncate">{user?.email || user?.username || 'Sin correo'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Contenido principal */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

