Estoy trabajando en un proyecto React + Vite + TypeScript que se comunica con un backend Spring Boot.

Quiero que todo el código generado por GitHub Copilot siga estas reglas:

🔧 1. Configuración Axios

Existe una instancia centralizada de Axios en src/api/index.ts.

baseURL SIEMPRE debe ser "/api" porque uso un proxy en Vite.

Nunca debe usarse http://localhost:8080 en ningún archivo del frontend.

🧱 2. Interceptors

Tengo una carpeta:

src/api/interceptors/
    requestInterceptor.ts
    responseInterceptor.ts


Los interceptors deben incluir:

✔ Request Interceptor

Leer el token desde localStorage.getItem("token").

Si existe, agregar:

config.headers.Authorization = `Bearer ${token}`;


Aplicar a todas las requests.

✔ Response Interceptor

Si la respuesta es 401 (token expirado):

Borrar token del localStorage

Redirigir a /login:

window.location.href = "/login";

📦 3. Servicios HTTP

Los servicios deben estar en:

src/services/
    clientesService.ts
    usuariosService.ts
    authService.ts
    ...


Cada servicio debe usar SIEMPRE la instancia Axios central api así:

import api from "../api";

export const crearCliente = (nombreCliente: string) => {
  return api.post("/clientes", { nombreCliente });
};

🎯 4. Objetivo principal

Generar código consistente usando:

Importaciones ES Modules (import ...)

Axios con instancia global

Rutas relativas (/api/...)

Arquitectura limpia basada en servicios

Nada de require(...)

Nada de pegarle directo al backend

📌 5. Ejemplo que Copilot debe seguir
Postman snippet (NO usar directamente):
url: "http://localhost:8080/api/clientes"

Versión correcta:
api.post("/clientes", body)

Objetivo del asistente (Copilot)

Cuando genere código de llamadas HTTP, componentes que hagan fetch de datos o servicios, debe usar esta arquitectura obligatoriamente.