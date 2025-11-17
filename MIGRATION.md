# Migración de Base44 a Backend Propio

Este documento explica la migración del frontend de LabFlow desde la API de Base44 a un backend personalizado.

## 📋 Cambios Realizados

### 1. Nueva Estructura de API

Se ha creado una nueva estructura modular en `src/api/`:

```
src/api/
├── client.js              # Cliente Axios configurado
├── entities.js            # Exportaciones compatibles con código legacy
├── integrations.js        # Servicios de integración (email, archivos, AI)
└── services/
    ├── auth.js           # Autenticación
    ├── clients.js        # Gestión de clientes
    ├── samples.js        # Gestión de muestras
    ├── workOrders.js     # Órdenes de trabajo
    ├── workflows.js      # Flujos de trabajo
    ├── analysis.js       # Análisis y plantillas
    ├── quotes.js         # Cotizaciones
    ├── files.js          # Gestión de archivos
    └── index.js          # Exportación centralizada
```

### 2. Configuración

#### Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

Para producción, actualiza estas variables según tu servidor:

```env
VITE_API_BASE_URL=https://api.tudominio.com/api
VITE_API_TIMEOUT=30000
```

### 3. Cliente HTTP (Axios)

El cliente HTTP configurado en `src/api/client.js` incluye:

- **Interceptores de Request**: Añade automáticamente el token de autenticación
- **Interceptores de Response**: Maneja errores globalmente
- **Configuración Base**: URL base y timeout configurables
- **Manejo de Autenticación**: Redirección automática en caso de 401

## 🔧 Uso de los Servicios

### Autenticación

```javascript
import { authService } from '@/api/services';

// Login
const { token, user } = await authService.login('email@example.com', 'password');

// Registro
await authService.register({
  email: 'email@example.com',
  password: 'password',
  name: 'Usuario'
});

// Logout
await authService.logout();

// Obtener usuario actual
const user = await authService.getCurrentUser();

// Verificar si está autenticado
const isAuth = authService.isAuthenticated();
```

### Clientes

```javascript
import { clientsService } from '@/api/services';

// Obtener todos los clientes
const clients = await clientsService.getAll();

// Obtener cliente por ID
const client = await clientsService.getById(clientId);

// Crear cliente
const newClient = await clientsService.create({
  name: 'Cliente Ejemplo',
  email: 'cliente@example.com',
  // ... otros campos
});

// Actualizar cliente
await clientsService.update(clientId, { name: 'Nuevo Nombre' });

// Eliminar cliente
await clientsService.delete(clientId);

// Buscar clientes
const results = await clientsService.search('query');
```

### Muestras

```javascript
import { samplesService } from '@/api/services';

// Obtener todas las muestras
const samples = await samplesService.getAll();

// Con filtros
const filteredSamples = await samplesService.getAll({
  status: 'pending',
  clientId: '123'
});

// Obtener muestra por ID
const sample = await samplesService.getById(sampleId);

// Crear muestra
const newSample = await samplesService.create({
  name: 'Muestra 1',
  type: 'water',
  // ... otros campos
});

// Actualizar estado
await samplesService.updateStatus(sampleId, 'in_progress');

// Muestras por cliente
const clientSamples = await samplesService.getByClientId(clientId);

// Muestras por orden de trabajo
const workOrderSamples = await samplesService.getByWorkOrderId(workOrderId);
```

### Órdenes de Trabajo

```javascript
import { workOrdersService } from '@/api/services';

// Obtener todas las órdenes
const workOrders = await workOrdersService.getAll();

// Crear orden de trabajo
const newWorkOrder = await workOrdersService.create({
  clientId: '123',
  samples: ['sample1', 'sample2'],
  // ... otros campos
});

// Actualizar estado
await workOrdersService.updateStatus(workOrderId, 'completed');

// Estadísticas
const stats = await workOrdersService.getStats();
```

### Flujos de Trabajo

```javascript
import { workflowsService } from '@/api/services';

// Obtener pasos del flujo
const steps = await workflowsService.getStepsBySampleId(sampleId);

// Actualizar estado de un paso
await workflowsService.updateStepStatus(stepId, 'completed', 'Notas opcionales');

// Completar paso
await workflowsService.completeStep(stepId, { data: 'resultado' });

// Obtener timeline
const timeline = await workflowsService.getTimeline(sampleId);
```

### Análisis

```javascript
import { analysisService, analysisTemplatesService } from '@/api/services';

// Análisis
const analyses = await analysisService.getAll();
const analysis = await analysisService.getById(analysisId);
await analysisService.create({ /* datos */ });

// Plantillas
const templates = await analysisTemplatesService.getAll();
const template = await analysisTemplatesService.getById(templateId);
await analysisTemplatesService.duplicate(templateId);
```

### Archivos

```javascript
import { filesService } from '@/api/services';

// Subir archivo
const uploadedFile = await filesService.upload(file, {
  entityType: 'sample',
  entityId: sampleId
});

// Subir múltiples archivos
const uploadedFiles = await filesService.uploadMultiple(files);

// Descargar archivo
const blob = await filesService.download(fileId);

// Obtener URL firmada
const { url } = await filesService.getSignedUrl(fileId, 3600);

// Archivos por entidad
const files = await filesService.getByEntity('sample', sampleId);
```

### Integraciones

```javascript
import { SendEmail, InvokeLLM, UploadFile } from '@/api/integrations';

// Enviar email
await SendEmail({
  to: 'destinatario@example.com',
  subject: 'Asunto',
  body: 'Contenido del email'
});

// Usar IA/LLM
const response = await InvokeLLM('Tu prompt aquí', {
  model: 'gpt-4',
  temperature: 0.7
});

// Subir archivo
const file = await UploadFile(fileObject, { /* metadata */ });
```

## 🔄 Compatibilidad con Código Legacy

Para facilitar la migración, se mantiene compatibilidad con el código existente:

```javascript
// Esto sigue funcionando (importa desde entities.js)
import { Client, Sample, WorkOrder } from '@/api/entities';

// Ahora Client, Sample, etc. son los servicios correspondientes
const clients = await Client.getAll();
const samples = await Sample.getAll();
```

## 🚀 Pasos para Completar la Migración

### 1. Backend

Necesitarás crear un backend que implemente los siguientes endpoints:

#### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `POST /api/auth/password-reset`

#### Clientes
- `GET /api/clients`
- `GET /api/clients/:id`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET /api/clients/search`

#### Muestras
- `GET /api/samples`
- `GET /api/samples/:id`
- `POST /api/samples`
- `PUT /api/samples/:id`
- `DELETE /api/samples/:id`
- `PATCH /api/samples/:id/status`
- `GET /api/samples/client/:clientId`
- `GET /api/samples/work-order/:workOrderId`

#### Órdenes de Trabajo
- `GET /api/work-orders`
- `GET /api/work-orders/:id`
- `POST /api/work-orders`
- `PUT /api/work-orders/:id`
- `DELETE /api/work-orders/:id`
- `PATCH /api/work-orders/:id/status`
- `GET /api/work-orders/client/:clientId`
- `GET /api/work-orders/stats`

#### Flujos de Trabajo
- `GET /api/workflow-steps`
- `GET /api/workflow-steps/:id`
- `POST /api/workflow-steps`
- `PUT /api/workflow-steps/:id`
- `DELETE /api/workflow-steps/:id`
- `PATCH /api/workflow-steps/:id/status`
- `POST /api/workflow-steps/:id/complete`
- `GET /api/workflow-steps/sample/:sampleId`
- `GET /api/workflows/timeline/:sampleId`

#### Análisis
- `GET /api/analyses`
- `GET /api/analyses/:id`
- `POST /api/analyses`
- `PUT /api/analyses/:id`
- `DELETE /api/analyses/:id`
- `GET /api/analysis-templates`
- `GET /api/analysis-templates/:id`
- `POST /api/analysis-templates`
- `PUT /api/analysis-templates/:id`
- `DELETE /api/analysis-templates/:id`
- `POST /api/analysis-templates/:id/duplicate`

#### Cotizaciones
- `GET /api/quotes`
- `GET /api/quotes/:id`
- `POST /api/quotes`
- `PUT /api/quotes/:id`
- `DELETE /api/quotes/:id`
- `PATCH /api/quotes/:id/status`
- `POST /api/quotes/:id/convert`

#### Archivos
- `POST /api/files/upload`
- `POST /api/files/upload-multiple`
- `GET /api/files/:id`
- `GET /api/files/:id/download`
- `DELETE /api/files/:id`
- `GET /api/files/:id/signed-url`
- `GET /api/files/:entityType/:entityId`

#### Integraciones
- `POST /api/integrations/email/send`
- `POST /api/integrations/ai/invoke`
- `POST /api/integrations/ai/generate-image`
- `POST /api/integrations/files/:fileId/extract`

### 2. Actualizar Componentes

Revisa y actualiza tus componentes para usar los nuevos servicios. La mayoría debería funcionar sin cambios si usabas las importaciones desde `entities.js`.

### 3. Manejo de Errores

Implementa manejo de errores en tus componentes:

```javascript
try {
  const data = await clientsService.getAll();
} catch (error) {
  if (error.response) {
    // Error del servidor
    console.error('Error:', error.response.data.message);
  } else if (error.request) {
    // No hay respuesta
    console.error('No response from server');
  } else {
    // Error en la configuración
    console.error('Error:', error.message);
  }
}
```

### 4. Testing

Prueba todas las funcionalidades:

1. Autenticación (login, logout, registro)
2. CRUD de cada entidad
3. Subida y descarga de archivos
4. Flujos de trabajo
5. Integraciones

## 📝 Notas Importantes

1. **Tokens de Autenticación**: Se almacenan en `localStorage` con la clave `authToken`
2. **Redirección Automática**: Si el token expira (401), se redirige a `/login`
3. **CORS**: Asegúrate de configurar CORS en tu backend para permitir peticiones desde tu frontend
4. **Variables de Entorno**: No olvides crear el archivo `.env` con la URL de tu backend
5. **Archivos Legacy**: Los archivos `base44Client.js` ya no se usan pero se mantienen por ahora

## 🗑️ Limpieza (Opcional)

Una vez que todo funcione correctamente, puedes:

1. Eliminar `@base44/sdk` de las dependencias:
   ```bash
   npm uninstall @base44/sdk
   ```

2. Eliminar o renombrar `src/api/base44Client.js`

3. Actualizar todas las importaciones para usar directamente desde `services/`

## 🆘 Soporte

Si encuentras problemas durante la migración, verifica:

1. Que el archivo `.env` esté configurado correctamente
2. Que tu backend esté corriendo y accesible
3. Que los endpoints del backend coincidan con los esperados
4. Los logs de la consola del navegador para errores específicos
