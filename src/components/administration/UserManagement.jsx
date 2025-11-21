import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { administrationService } from "@/api/services";
import UserForm from "./UserForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState("todos");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    user: null,
    timeRemaining: 5
  });

  // Timer para el diálogo de confirmación
  useEffect(() => {
    let timer;
    if (confirmDialog.isOpen && confirmDialog.timeRemaining > 0) {
      timer = setInterval(() => {
        setConfirmDialog(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [confirmDialog.isOpen, confirmDialog.timeRemaining]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, activeRoleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await administrationService.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setIsLoading(false);
  };

  const filterUsers = async () => {
    let filtered = users;

    // Filter by role
    if (activeRoleFilter === "administradores") {
      filtered = filtered.filter(u => 
        u.rol?.nombre?.toUpperCase() === "ADMINISTRADOR"
      );
    } else if (activeRoleFilter === "trabajadores") {
      filtered = filtered.filter(u => 
        u.rol?.nombre?.toUpperCase() === "TRABAJADOR"
      );
    }

    // Apply search filter
    if (!searchTerm.trim()) {
      setFilteredUsers(filtered);
      return;
    }

    try {
      // Use the search endpoint from the backend
      const response = await administrationService.searchUsers(searchTerm);
      // Then filter by role
      if (activeRoleFilter === "administradores") {
        setFilteredUsers(response.filter(u => 
          u.rol?.nombre?.toUpperCase() === "ADMINISTRADOR"
        ));
      } else if (activeRoleFilter === "trabajadores") {
        setFilteredUsers(response.filter(u => 
          u.rol?.nombre?.toUpperCase() === "TRABAJADOR"
        ));
      } else {
        setFilteredUsers(response);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      // Fallback to client-side filtering if search endpoint fails
      const searchFiltered = filtered.filter(u =>
        u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(searchFiltered);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      isOpen: true,
      user: user,
      timeRemaining: 5
    });
  };

  const confirmDelete = async () => {
    try {
      await administrationService.deleteUser(confirmDialog.user.id);
      setConfirmDialog({ isOpen: false, user: null, timeRemaining: 5 });
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUserSaved = () => {
    setShowForm(false);
    setSelectedUser(null);
    loadUsers();
  };

  const getRoleBadgeColor = (rol) => {
    const rolName = rol?.nombre || rol;
    switch (rolName?.toUpperCase()) {
      case "ADMINISTRADOR":
        return "bg-red-100 text-red-800";
      case "TRABAJADOR":
        return "bg-orange-100 text-orange-800";
      case "TÉCNICO":
        return "bg-blue-100 text-blue-800";
      case "SUPERVISOR":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const countByRole = (roleName) => {
    return users.filter(u => 
      u.rol?.nombre?.toUpperCase() === roleName.toUpperCase()
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Role Filter Tabs */}
      <Tabs value={activeRoleFilter} onValueChange={setActiveRoleFilter}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
          <TabsTrigger value="todos" className="data-[state=active]:bg-white">
            Todos ({users.length})
          </TabsTrigger>
          <TabsTrigger value="administradores" className="data-[state=active]:bg-white">
            Administradores ({countByRole("ADMINISTRADOR")})
          </TabsTrigger>
          <TabsTrigger value="trabajadores" className="data-[state=active]:bg-white">
            Trabajadores ({countByRole("TRABAJADOR")})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search bar and Create button */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, email o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Users list */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando usuarios...</div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No hay usuarios disponibles</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.nombre} {user.apellido}
                      </h3>
                      <Badge className={getRoleBadgeColor(user.rol)}>
                        {user.rol?.nombre || user.rol}
                      </Badge>
                      {!user.activo && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {user.email}</p>
                      <p>Usuario: {user.username}</p>
                      {user.telefono && <p>Teléfono: {user.telefono}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showForm && (
        <UserForm
          user={selectedUser}
          onSave={handleUserSaved}
          onCancel={() => {
            setShowForm(false);
            setSelectedUser(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Eliminar Usuario"
        message={confirmDialog.user 
          ? `¿Estás seguro de que deseas eliminar al usuario "${confirmDialog.user.nombre}"?\n\nEsta acción no se puede deshacer.`
          : ''
        }
        confirmText={confirmDialog.timeRemaining > 0 ? `Eliminar (${confirmDialog.timeRemaining}s)` : "Eliminar"}
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, user: null, timeRemaining: 5 })}
        isConfirmDisabled={confirmDialog.timeRemaining > 0}
      />
    </div>
  );
}
