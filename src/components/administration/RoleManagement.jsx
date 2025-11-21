import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { administrationService } from "@/api/services";
import RoleForm from "./RoleForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    role: null
  });

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    filterRoles();
  }, [searchTerm, roles]);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const response = await administrationService.getAllRoles();
      setRoles(response);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
    setIsLoading(false);
  };

  const filterRoles = async () => {
    if (!searchTerm.trim()) {
      setFilteredRoles(roles);
      return;
    }

    try {
      // Use the search endpoint from the backend
      const response = await administrationService.searchRoles(searchTerm);
      setFilteredRoles(response);
    } catch (error) {
      console.error("Error searching roles:", error);
      // Fallback to client-side filtering if search endpoint fails
      const filtered = roles.filter(r =>
        r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowForm(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleDeleteRole = (role) => {
    setConfirmDialog({
      isOpen: true,
      role: role
    });
  };

  const confirmDelete = async () => {
    try {
      await administrationService.deleteRole(confirmDialog.role.id);
      setConfirmDialog({ isOpen: false, role: null });
      loadRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const handleRoleSaved = () => {
    setShowForm(false);
    setSelectedRole(null);
    loadRoles();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateRole} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando roles...</div>
        ) : filteredRoles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No hay roles disponibles</p>
            </CardContent>
          </Card>
        ) : (
          filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {role.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{role.descripcion}</p>
                    {role.permisos && role.permisos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Permisos:</p>
                        <div className="flex flex-wrap gap-2">
                          {role.permisos.map((permiso) => (
                            <span
                              key={permiso}
                              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {permiso}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {role.cantidadUsuarios && (
                      <p className="text-xs text-gray-500 mt-3">
                        {role.cantidadUsuarios} usuario(s) con este rol
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
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
        <RoleForm
          role={selectedRole}
          onSave={handleRoleSaved}
          onCancel={() => {
            setShowForm(false);
            setSelectedRole(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Eliminar Rol"
        message={confirmDialog.role 
          ? `¿Estás seguro de que deseas eliminar el rol "${confirmDialog.role.nombre}"?`
          : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, role: null })}
      />
    </div>
  );
}
