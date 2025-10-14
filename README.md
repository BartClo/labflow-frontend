## LabFlow - Frontend (LabManager)

Este repositorio contiene el frontend de un sistema LIMS (Lab Information Management System) basado en React y Vite. El proyecto usa el SDK de Base44 para comunicarse con la API y expone páginas para gestión de clientes, muestras, órdenes de trabajo y procedimientos.

Fecha del análisis: 13-Oct-2025

---

## Resumen rápido

- Stack: React 18 + Vite
- UI: Tailwind CSS, componentes Radix (varios paquetes), Lucide icons
- Rutas: React Router (en `src/pages/index.jsx`)
- Cliente API: `@base44/sdk` configurado en `src/api/base44Client.js`
- Estado: Aplicación con UI y rutas principales implementadas; integra con Base44 SDK. Falta añadir pruebas automatizadas y CI, y revisar rotas/urls generadas (ver secciones "Estado actual" y "Pendientes").

---

## Estado actual (detallado)

- Páginas implementadas (en `src/pages` y montadas en el Router):
	- Dashboard (`/` y `/Dashboard`)
	- Samples (`/Samples`)
	- Clients (`/Clients`)
	- SampleWorkflow (`/SampleWorkflow`)
	- Analysis (`/Analysis`)
	- Procedures (`/Procedures`)
	- OTGeneration (`/OTGeneration`)
- Layout y navegación: `src/pages/Layout.jsx` contiene la barra lateral, menú y header con búsqueda/fecha.
- Cliente Base44: `src/api/base44Client.js` crea el cliente con appId hardcodeado: `68da8678f2a70ca422390491` y `requiresAuth: true`.
- Entidades exportadas: `src/api/entities.js` expone `Client`, `Sample`, `WorkOrder`, `Analysis`, `AnalysisTemplate`, entre otras.
- Integraciones: `src/api/integrations.js` exporta helpers para `Core` y funciones como `InvokeLLM`, `SendEmail`, `UploadFile`, etc.
- Utilidades: `src/utils/index.ts` contiene `createPageUrl` que normaliza nombres de página a rutas en minúsculas con guiones.

---

## Archivos clave

- `package.json` - dependencias y scripts (dev: vite, build: vite build, lint: eslint)
- `src/main.jsx` - punto de entrada
- `src/App.jsx` - montaje del `Pages` y `Toaster`
- `src/pages` - páginas y layout
- `src/components` - biblioteca de componentes UI reutilizables (sidebar, inputs, badges, etc.)
- `src/api` - cliente Base44 y wrappers de entidades/integraciones

---

## Cómo ejecutar (desarrollo)

Recomendado: Node 16+ (Node 18+ recomendado). Desde la raíz del repositorio:

```powershell
npm install
npm run dev
```

Si quieres probar el build:

```powershell
npm run build
npm run preview
```

Scripts disponibles (ver `package.json`):
- `dev` - inicia Vite en modo desarrollo
- `build` - genera build para producción
- `preview` - sirve el build generado
- `lint` - ejecuta ESLint

---

## Configuración y secretos

- Actualmente el `appId` de Base44 está embebido en `src/api/base44Client.js`. Para producción se recomienda extraerlo a variables de entorno y no dejar valores hardcodeados.
- `requiresAuth: true` está habilitado en el cliente; la app asume flujo de autenticación vía el SDK de Base44. Revisa el módulo `base44.auth` si necesitas personalizar el login.

---

## Dependencias principales

- `react`, `react-dom`, `vite`, `tailwindcss`
- `@base44/sdk` - cliente para la API
- `react-router-dom` - enrutamiento
- Radix UI packages y utilidades de UI (lucide-react, framer-motion, sonner, etc.)

---

## Observaciones / puntos pendientes

- Seguridad: mover `appId` a variables de entorno.
- Autenticación: verificar y documentar flujo de login/refresh tokens. Hoy `requiresAuth` está activo, pero no hay documentación sobre cómo iniciar sesión desde la UI.
- Tests: no hay tests unitarios o de integración; añadir cobertura mínima (Jest + React Testing Library o Vitest).
- CI/CD: falta pipeline para lint/build/deploy.
- Accesibilidad y transiciones: revisar componentes personalizados para accesibilidad (aria-*), keyboard navigation.
- Español/Internacionalización: la mayor parte de la UI está en español, pero revisar strings y posibilidades de i18n si hace falta.
- Rutas: `createPageUrl` transforma a `'/pagename'` en minúsculas con guiones; verificar que los enlaces en `Layout` y `Pages` coincidan exactamente con las rutas definidas.

---

## Siguientes pasos recomendados

1. Extraer configuración sensible a variables de entorno y documentar `.env.example`.
2. Añadir instrucciones de autenticación (o un stub/mock) para desarrollo cuando `requiresAuth` esté activo.
3. Añadir pruebas básicas (componentes principales y utilidades como `createPageUrl`).
4. Añadir CI (GitHub Actions) que ejecute `npm ci`, `npm run lint` y `npm run build`.
5. Revisar y completar cualquier formulario o llamada API que devuelva errores visibles en la UI.

---

## Contacto y soporte

Para preguntas sobre el SDK de Base44, puedes contactar a su soporte (según lo indicado en el paquete) o revisar la documentación interna de Base44.

---

## Estado del requerimiento

- Petición del usuario: "Analiza todo el proyecto y actualiza el README con su estado actual" — Resultado: He actualizado este `README.md` con un análisis del repositorio, instrucciones de ejecución y lista de pendientes.
