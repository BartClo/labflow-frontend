import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlaskConical, Mail, Lock, AlertCircle, Loader } from "lucide-react";

import logo from "/assets/image/LabFlow.svg";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email) {
        setError("Por favor ingresa tu correo electrónico");
        setIsLoading(false);
        return;
      }

      console.log("Attempting login with:", { email });
      const result = await login(email, password);
      console.log("Login successful:", result);

      // Wait a bit for state to update
      setTimeout(() => {
        navigate("/Dashboard");
      }, 100);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
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

      <div className="w-full max-w-md">
        {/* Logo y Encabezado */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="LabFlow Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LabFlow</h1>
          <p className="text-gray-600 text-sm mt-2">Sistema LIMS</p>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Iniciar Sesión
            </h2>
              <p className="text-gray-600 text-sm mb-6 text-center">
                Ingresa tus credenciales para acceder
              </p>
          </div>
          {/* Mensaje de Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña{" "}
                <span className="text-gray-400 text-sm">
                  (temporal - no requerida)
                </span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Usuario de prueba */}
            {/* <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">Solo se requiere el email:</p>
              <p className="text-xs text-blue-700">Email: admin@admin.cl</p>
              <p className="text-xs text-blue-600">La contraseña es opcional por ahora</p>
            </div> */}

            {/* Botón Iniciar Sesión */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Pie de página */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              ¿Problemas para acceder?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Contacta al administrador
              </button>
            </p>
          </div>
        </div>

        {/* Información de Sistema */}
        {/* <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            LabManager v1.0 • Sistema de Laboratorio
          </p>
        </div> */}
      </div>
    </div>
  );
}
