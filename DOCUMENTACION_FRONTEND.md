# 📗 Documentación Frontend - LabFlow

**Versión:** 2.0 (Funcional)  
**Actualizado:** Abril 2026  
**Propósito:** Interfaz de usuario para laboratorio clínico  
**Público:** Técnicos, Administradores, Receptores, Clientes

---

## 📋 Tabla de Contenidos

1. [¿Qué es el Frontend de LabFlow?](#qué-es-el-frontend)
2. [Páginas Principales](#páginas-principales)
3. [Flujos de Usuario por Rol](#flujos-de-usuario-por-rol)
4. [Navegación General](#navegación-general)
5. [Funcionalidades de Cada Página](#funcionalidades-de-cada-página)
6. [Búsqueda y Filtrado](#búsqueda-y-filtrado)
7. [Cómo se Ve el Sistema](#cómo-se-ve-el-sistema)

---

## ¿Qué es el Frontend?

**El Frontend de LabFlow** es la pantalla que ves cuando entras al sistema. Es la "cara" del laboratorio digital.

Mientras que el Backend (servidor) guarda datos y hace cálculos "en silencio", el Frontend es lo que **ves, haces clic y usas cada día.**

### ¿Qué Hace el Frontend?

1. **Muestra en pantalla** → Técnicos ven su lista de órdenes, administradores ven estadísticas
2. **Captura información** → Cuando escribes valores de análisis, el frontend los agarra
3. **Envía al Backend** → El frontend le dice al servidor: "Guarda esto"
4. **Recibe respuestas** → El servidor responde "OK, guardado" o "Error, número duplicado"
5. **Valida antes de enviar** → Si escribes letras en un campo de números, alerta antes de enviar
6. **Mantiene privacidad** → Tu token de seguridad se guarda aquí (no en localStorage inseguro)
7. **Funciona offline parcialmente** → Algunos datos se guardan en caché local para consultas rápidas

---

## Páginas Principales

### 1. LOGIN (La Primera Pantalla)

**¿Cuándo ves esta página?**
- Primera vez que entras
- Cuando tu sesión expira (después de 24 horas)
- Cuando cierras sesión manualmente

**¿Qué haces aquí?**

```
┌─────────────────────────────────┐
│   LABFLOW - ACCESO AL SISTEMA    │
├─────────────────────────────────┤
│                                  │
│  Email:      [___________________]
│  Contraseña: [___________________]
│                                  │
│           [ENTRAR] [¿OLVIDASTE?] │
│                                  │
│  ℹ️ Ingresa tus credenciales      │
│     Seguridad: HTTPS cifrado      │
└─────────────────────────────────┘
```

**Posibles respuestas del sistema:**

| Situación | Qué pasa |
|-----------|----------|
| **Email correcto, contraseña correcta** | ✅ Entras al sistema |
| **Email no existe** | ❌ "Email o contraseña incorrecta" |
| **Contraseña incorrecta** | ❌ "Email o contraseña incorrecta" |
| **3 intentos fallidos** | 🔒 "Cuenta bloqueada por 15 minutos" |
| **Cuenta marcada como inactiva** | ❌ "Tu cuenta está desactivada" |

**"¿Olvidaste contraseña?"**
- Click ahí y recibe email con link para resetear
- El link expira en 15 minutos (seguridad)

---

### 2. DASHBOARD (Pantalla de Bienvenida)

**¿Qué ves aquí?** Depende de tu rol.

#### ADMIN - Dashboard Administrativo

```
╔════════════════════════════════════════════╗
║        PANEL DE ADMINISTRACIÓN             ║
╠════════════════════════════════════════════╣
║                                            ║
║  Buenos días, Carlos (ADMIN)               ║
║                                            ║
║  ESTADÍSTICAS DEL DÍA                      ║
║  ├─ Muestras procesadas: 156               ║
║  ├─ Análisis completados: 312              ║
║  ├─ Órdenes abiertas: 8                    ║
║  ├─ Errores en el sistema: 0               ║
║  └─ Sistema disponible: 99.8%              ║
║                                            ║
║  ACCIONES RÁPIDAS                          ║
║  ├─ [+ Crear Usuario]                      ║
║  ├─ [+ Crear Análisis]                     ║
║  ├─ [Ver Auditoría]                        ║
║  └─ [Reportes Mensuales]                   ║
║                                            ║
║  ALERTAS                                   ║
║  • 2 técnicos offline                      ║
║  • 3 muestras sin asignar                  ║
║  • Equipo C necesita mantenimiento         ║
║                                            ║
╚════════════════════════════════════════════╝
```

#### TÉCNICO - Mi Lista de Trabajo

```
╔════════════════════════════════════════════╗
║    ÓRDENES DE TRABAJO ASIGNADAS A TI       ║
╠════════════════════════════════════════════╣
║                                            ║
║  Buenos días, Juan (TÉCNICO)               ║
║                                            ║
║  ⚠️  URGENTES (3 órdenes)                  ║
║  ├─ OT-001: Hemograma paciente X           ║
║  │  └─ Asignada hace 30 min                ║
║  ├─ OT-002: Glucosa - CRÍTICA              ║
║  │  └─ Asignada hace 15 min                ║
║  └─ OT-003: Perfil hepático                ║
║     └─ Asignada hace 1 hora                ║
║                                            ║
║  NORMALES (5 órdenes)                      ║
║  ├─ OT-004: Hemograma de rutina            ║
║  ├─ OT-005: Química sanguínea              ║
║  └─ ... 3 más ...                          ║
║                                            ║
║  COMPLETADAS HOY                           ║
║  ├─ 12 órdenes ✓                           ║
║  └─ Promedio por orden: 45 minutos         ║
║                                            ║
╚════════════════════════════════════════════╝
```

#### CLIENTE - Mis Resultados

```
╔════════════════════════════════════════════╗
║    MIS MUESTRAS Y RESULTADOS               ║
╠════════════════════════════════════════════╣
║                                            ║
║  Hospital Central - Portal de Resultados  ║
║                                            ║
║  RESULTADOS LISTOS (3 muestras)            ║
║  ├─ M-001: Hemograma Dr. Pérez    [PDF ↓]  ║
║  │  Fecha: 03/04/2026                     ║
║  ├─ M-002: Química Dr. García      [PDF ↓]  ║
║  │  Fecha: 02/04/2026                     ║
║  └─ M-003: Serología Dr. López     [PDF ↓]  ║
║     Fecha: 01/04/2026                     ║
║                                            ║
║  EN PROCESO (2 muestras)                   ║
║  ├─ M-004: Hemograma Paciente Y            ║
║  │  Estado: En validación (90%)            ║
║  └─ M-005: Cultivo bacteriano              ║
║     Estado: En análisis (40%)              ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### 3. MUESTRAS (Gestión de Muestras)

**¿Para quién es?** RECEPTOR, TÉCNICO, ADMIN

**¿Qué ves?** Lista de todas las muestras registradas

```
╔════════════════════════════════════════════════════════╗
║              MUESTRAS DEL LABORATORIO                 ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  [+ Nueva Muestra]  [Buscar] [Filtrar] [Descargar]   ║
║                                                        ║
║  Filtros activos: Todas | Hoy | Esta semana | Mío   ║
║                                                        ║
║  ID    | Código     | Tipo    | Cliente      | Estado ║
║  ─────────────────────────────────────────────────── ║
║  M-001 | BC123456   | Sangre  | Hospital XYZ | ✓ OK   ║
║  M-002 | BC123457   | Orina   | Clínica ABC  | ⏳ Proceso
║  M-003 | BC123458   | Suero   | Centro Med   | ❌ Error
║  ...15 más...                                         ║
║                                                        ║
║  ✓ = Completada  ⏳ = En proceso  ❌ = Problema       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

**¿Qué puedo hacer en esta página?**

1. **Crear nueva muestra**
   - Click "+ Nueva Muestra"
   - Completa formulario: código barras, tipo, cliente
   - Click "Guardar"
   - Sistema verifica código único
   - ✓ Muestra registrada

2. **Buscar una muestra**
   - Escribe código o número en buscador
   - Sistema filtra en tiempo real
   - Click en muestra para ver detalles

3. **Filtrar por estado**
   - "Todas" = muestra todo
   - "Completadas" = solo término análisis
   - "En proceso" = aún analizando
   - "Con problemas" = necesita revisión

4. **Ver detalles de una muestra**
   - Click en la fila
   - Se abre panel lateral mostrando:
     - Código y tipo
     - Cliente y fecha recepción
     - Análisis solicitados
     - Estado actual
     - Histórico de cambios

---

### 4. ÓRDENES DE TRABAJO (El Centro del Laboratorio)

**¿Para quién es?** TÉCNICO, ADMIN

**¿Qué es una orden de trabajo?**
- Una instrucción: "Haz estos análisis en esta muestra"
- Tiene 4 etapas: Recepción → Análisis → Validación → Reporte
- Cada etapa completa desbloquea la siguiente

```
╔════════════════════════════════════════════════════════╗
║           MIS ÓRDENES DE TRABAJO                      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  [+ Nueva Orden]  [Buscar] [Mis órdenes] [Todas]      ║
║                                                        ║
║  URGENTES (Rojo)                                       ║
║  ┌────────────────────────────────────────────┐       ║
║  │ OT-2026-001: Hemograma - Hospital XYZ      │       ║
║  │ Paciente: Juan Pérez                       │       ║
║  │ Prioridad: ⚠️  URGENTE                      │       ║
║  │ Asignado a: Tú (Juan)                      │       ║
║  │ Creada: 03/04/2026 09:00                   │       ║
║  │                                            │       ║
║  │ Etapas:                                    │       ║
║  │ ✓ Recepción completada                    │       ║
║  │ ⏳ Análisis en curso (45 min)              │       ║
║  │ ⭕ Validación pendiente                    │       ║
║  │ ⭕ Reporte pendiente                       │       ║
║  │                                            │       ║
║  │         [Continuar Análisis]               │       ║
║  └────────────────────────────────────────────┘       ║
║                                                        ║
║  NORMALES (Gris)                                       ║
║  ├─ OT-2026-002: Química sanguínea...                 ║
║  ├─ OT-2026-003: Perfil hepático...                   ║
║  │                                            │       ║
╚════════════════════════════════════════════════════════╝
```

**¿Cómo completo una orden?**

```
1. Recibo orden en mi dashboard
2. Click en la orden
3. Lee: "Etapa actual: ANÁLISIS"
4. Hago el análisis en el equipo
5. Registro los valores testeados:
   - Hemoglobina: 14.2 g/dL
   - Hematocrito: 42.5%
   - etc.
6. Click "Completar análisis"
7. Sistema valida valores automáticamente:
   ✓ Dentro de rango normal
   Avanza automáticamente a "Validación"
8. Ahora otro técnico (supervisor) debe validar
9. Supervisor aprueba
10. Avanza a "Reporte"
11. Sistema genera PDF automático
12. Estado final: ✓ COMPLETADA
```

---

### 5. ANÁLISIS (Configuración de Análisis)

**¿Para quién es?** ADMIN

**¿Qué es?** Configuración de todos los tipos de análisis disponibles (Hemograma, Glucosa, etc.)

```
╔════════════════════════════════════════════════════════╗
║          ANÁLISIS DISPONIBLES EN EL LAB               ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  [+ Crear Análisis]  [Buscar]                         ║
║                                                        ║
║  Nombre           | Unidad    | Rango Normal | Crítico║
║  ─────────────────────────────────────────────────── ║
║  Hemoglobina      | g/dL      | 13-16        | <7    ║
║  Hematocrito      | %         | 38-46        | <20   ║
║  Glucosa          | mg/dL     | 70-100       | <50   ║
║  Triglicéridos    | mg/dL     | <150         | >500  ║
║  ... más análisis...                                  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

**¿Qué puedo configurar?**
- Nombre del análisis (debe ser único)
- Unidad de medida (g/dL, %, etc.)
- Rango mínimo y máximo normal
- Valores que activan alerta crítica
- Método de análisis (lo que hace el equipo)

---

### 6. USUARIOS (Gestión de Personal)

**¿Para quién es?** ADMIN

**¿Qué ves?** Lista de todos los usuarios del sistema

```
╔════════════════════════════════════════════════════════╗
║             USUARIOS DEL SISTEMA                      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  [+ Crear Usuario]  [Buscar] [Exportar]               ║
║                                                        ║
║  Email               | Nombre      | Rol      | Activo║
║  ───────────────────────────────────────────────────  ║
║  carlos@lab.com      | Carlos      | ADMIN    | ✓     ║
║  juan@lab.com        | Juan García  | TÉCNICO  | ✓     ║
║  maria@lab.com       | María       | TÉCNICO  | ✓     ║
║  pedro@lab.com       | Pedro López  | RECEPTOR | ✓     ║
║  cliente@hosp.com    | Hospital XYZ | CLIENTE  | ✓     ║
║  inactivo@lab.com    | Usuario Viejo| TÉCNICO  | ✗     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

**¿Qué puedo hacer?**

1. **Crear usuario**
   - Click "+ Crear Usuario"
   - Llena: nombre, email, rol
   - Sistema genera contraseña temporal
   - Usuario recibe email con credenciales
   - Puede cambiar contraseña al entrar

2. **Cambiar rol de usuario**
   - Click en usuario
   - Selecciona nuevo rol: ADMIN / TÉCNICO / RECEPTOR / CLIENTE
   - Click "Guardar"
   - Usuario obtiene nuevos permisos inmediatamente

3. **Desactivar usuario**
   - Click en usuario
   - Toggle "Activo" OFF
   - Usuario no puede entrar
   - Sus datos históricos quedan guardados

4. **Ver último login**
   - En listado, ves "12/04/2026 09:30"
   - Si dice "Nunca", usuario nunca entró

---

### 8. MI PERFIL (Configuración Personal)

**¿Para quién es?** TODOS

**¿Qué ves?**

```
╔════════════════════════════════════════╗
║        MI PERFIL - JUAN GARCÍA         ║
╠════════════════════════════════════════╣
║                                        ║
║ Información Personal                   ║
║ ├─ Nombre: Juan García                 ║
║ ├─ Email: juan@lab.com                 ║
║ ├─ Rol: TÉCNICO                        ║
║ └─ Activo desde: 15/02/2026            ║
║                                        ║
║ Seguridad                              ║
║ ├─ [Cambiar Contraseña]                ║
║ ├─ [Cerrar Todas las Sesiones]         ║
║ └─ Último login: 03/04/2026 08:45      ║
║                                        ║
║ Preferencias                           ║
║ ├─ Notificaciones por Email: ON        ║
║ ├─ Notificaciones por Sistema: ON      ║
║ └─ Idioma: Español                     ║
║                                        ║
║ [Guardar Cambios] [Cancelar]           ║
║                                        ║
╚════════════════════════════════════════╝
```

**¿Qué puedo hacer?**
- Ver mi información
- Cambiar contraseña
- Activar/desactivar notificaciones
- Cerrar sesiones abiertas en otros dispositivos

---

## Flujos de Usuario por Rol

### RECEPTOR: Flujo de Recepción de Muestra

```
Recepción llega muestra
    ↓
Receptor entra a página "MUESTRAS"
    ↓
Click "+ Nueva Muestra"
    ↓
Completa:
  • Escanea código de barras
  • Selecciona tipo: Sangre
  • Selecciona cliente: Hospital XYZ
  • Define prioridad: Alta
    ↓
Click "Guardar"
    ↓
Sistema verifica:
  ✓ Código es único (no duplicado)
  ✓ Formato código correcto
  ✓ Cliente existe
    ↓
✓ Muestra registrada
    ↓
Receptor escanea siguiente muestra...
```

### TÉCNICO: Flujo de Análisis

```
Técnico entra al Dashboard
    ↓
Ve: "3 órdenes urgentes"
    ↓
Click en "OT-2026-001: Hemograma"
    ↓
Lee: "Etapa: ANÁLISIS"
    ↓
Click "[Continuar Análisis]"
    ↓
Se abre formulario de valores:
  - Hemoglobina: _____ g/dL
  - Hematocrito: _____ %
  - Leucocitos: _____ /μL
    ↓
Técnico corre análisis en equipo
    ↓
Técnico ingresa valores medidos
    ↓
Click "Enviar resultados"
    ↓
Sistema valida automáticamente:
  ✓ Valores dentro de rango normal
  ✓ Formato correcto
    ↓
✓ Sistema avanza a "VALIDACIÓN"
    ↓
Sistema notifica a otro técnico:
  "OT-001 necesita tu validación"
    ↓
Técnico espera a que supervisor valide
```

### SUPERVISOR: Flujo de Validación

```
Supervisor recibe notificación:
  "OT-2026-001 necesita validación"
    ↓
Click en orden
    ↓
Lee resultados:
  Hemoglobina: 14.2 g/dL (Rango: 13-16) ✓
  Hematocrito: 42.5% (Rango: 38-46) ✓
  Leucocitos: 7200/μL (Rango: 4500-11000) ✓
    ↓
Valida checklist:
  ☑ Valores coherentes
  ☑ Técnica correcta
  ☑ Sin interferencias
    ↓
Click "[APROBAR]"
    ↓
✓ Sistema avanza a "REPORTE"
    ↓
Sistema genera PDF automático
    ↓
✓ Orden completada
    ↓
Sistema notifica a cliente:
  "Tu resultado está listo para descargar"
```

### CLIENTE: Flujo de Descarga de Resultados

```
Cliente entra a portal
    ↓
Ve:  "RESULTADOS LISTOS (3 muestras)"
    ↓
Click en "M-001: Hemograma"
    ↓
Abre PDF profesional con:
  - Sus datos
  - Valores medidos
  - Interpretación
  - Firma del análisis
    ↓
Click "[Descargar]" o "[Imprimir]"
    ↓
✓ Resultado en manos del cliente
    ↓
Sistema registra:
  • Quién lo descargó
  • Cuándo lo descargó
  • Desde qué dispositivo
  (Auditoría completa)
```

---

## Búsqueda y Filtrado

### Buscador Global

En casi todas las páginas hay un campo de búsqueda:

```
[Buscar...  🔍]
```

**¿Qué busca?**
- En Muestras: Código, número, cliente
- En Órdenes: Código OT, paciente
- En Usuarios: Nombre, email
- En Análisis: Nombre del análisis

**¿Cómo funciona?**
1. Escribes mientras escribes (real-time)
2. Sistema filtra automáticamente
3. Muestra coincidencias
4. Click en resultado para abrir

### Filtros Específicos

**En MUESTRAS:**
```
Filtrar por: [Todas ▼]
├─ Todas (muestra todas)
├─ Completadas (análisis listo)
├─ En proceso (analizando)
├─ Con error (problema encontrado)
└─ Pendiente asignación
```

**En ÓRDENES:**
```
Mi estado: [Mis órdenes ▼]
├─ Mis órdenes (asignadas a mí)
├─ Todas las órdenes  
├─ Urgentes (rojo)
├─ Normales (gris)
├─ Completadas hoy
└─ Atrasadas
```

**En USUARIOS:**
```
Estado: [Todos activos ▼]
├─ Todos activos (solo usuarios que pueden entrar)
├─ Todos (incluyendo inactivos)
├─ Solo Admins
├─ Solo Técnicos
├─ Solo Receptores
└─ Solo Clientes
```

---

## Validaciones (Alertas Inteligentes)

### Antes de Guardar

Cuando intentas completar un formulario, el sistema valida:

**MUESTRA - Código de barras:**
```
Escribes: "BC"
Sistema detiene: ❌ "Mínimo 8 caracteres"

Escribes: "BC123aaa"
Sistema detiene: ❌ "Solo números permitidos"

Escribes: "BC123456"
Sistema detiene: ❌ "Este código ya existe en el sistema"

Escribes: "BC123457"
Sistema aprueba: ✓ Código válido, puedes guardar
```

**ANÁLISIS - Valores numéricos:**
```
Escribes en "Hemoglobina": "catorce"
Sistema detiene: ❌ "Solo números con decimales permitidos"
Puedes escribir: 14.2

Escribes: "14.2"
Sistema aprueba: ✓ Formato correcto
```

**USUARIO - Email:**
```
Escribes: "usuario"
Sistema detiene: ❌ "Email inválido (falta @)"

Escribes: "usuario@"
Sistema detiene: ❌ "Email incompleto (falta dominio)"

Escribes: "usuario@lab.com"
Sistema verifica si email ya existe...
  Si existe: ❌ "Este email ya está registrado"
  Si NO existe: ✓ Email válido, puedes guardar
```

### Después de Guardar

El servidor valida de nuevo (seguridad):

```
Frontend envía: { "codigo": "BC123456" }
    ↓
Servidor verifica:
  ✓ Código es único en BD
  ✓ Formato correcto
  ✓ Usuario tiene permiso
    ↓
Si TODO OK:    ✓ Guardado exitosamente
Si HAY PROBLEMA: ❌ Error + motivo específico
                 (ej: "Código ya existe en BD")
```

---

## Notificaciones en Tiempo Real

El sistema te notifica cuando:

```
📩 Orden asignada a ti:
   "Nueva orden OT-001: Hemograma urgente"

✓ Análisis completado:
  "OT-001 completó análisis. Necesita validación"

⚠️ Valor crítico:
   "OT-002: Hemoglobina crítica 7.2 g/dL"

🔐 Acceso cambió:
   "Tu contraseña fue cambiada. Si no fuiste tú, contacta admins"

❌ Error en sistema:
   "Base de datos lenta. Algunos reportes pueden tardar"
```

Notificaciones aparecen:
- 🔔 Campana en la barra superior
- 📧 Email si lo tienes activado
- Banner en pantalla

---

## Cómo se Ve el Sistema

### Ejemplo: Página de Órdenes en Detalle

```
┌─────────────────────────────────────────────────────┐
│ LABFLOW | Mi Perfil > Mis Órdenes   (👤 ⚙️ 🚪)      │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ [+ Nueva Orden]  [Buscar...]  [Mis órdenes ▼]       │
│ [Estado: Urgentes ▼]  [Descargar Excel]             │
└──────────────────────────────────────────────────────┘

URGENTES (3 órdenes)
┌────────────────────────────────────────────────────┐
│ OT-2026-001 | Hemograma - Hospital XYZ             │
│ Paciente: Juan Pérez | Creada: 03/04/2026 09:00   │
│                                                    │
│ ⚠️ URGENTE                                          │
│ Asignado a: TÚ (Juan García, TÉCNICO)             │
│ Tiempo: 45 minutos en ejecución                    │
│                                                    │
│ Etapas:  [✓ Recepción] [⏳ Análisis] [⭕ Validación] [⭕ Reporte]
│                                                    │
│ Muestras: M-001 (Sangre)                           │
│ Análisis: Hemograma, Diferencial                   │
│                                                    │
│             [Continuar] [Pausa] [Reassignar]       │
└────────────────────────────────────────────────────┘

NORMALES (5 órdenes)
┌────────────────────────────────────────────────────┐
│ OT-2026-002 | Química sanguínea - Clínica ABC     │
│ Paciente: María García | Creada: 03/04/2026 10:15 │
│ ... (menos información visual)...                  │
└────────────────────────────────────────────────────┘

... (más órdenes) ...
```

---

## Responsividad (Funciona en Móvil)

El frontend funciona en:
- 💻 Desktop (pantalla grande)
- 📱 Tablet
- 📞 Celular

**En celular:**
```
Se colapsa el menú lateral
Se adapta el tamaño de tablas
Botones se agrupan
Buscar se agranda
```

Ejemplo en celular:
```
[☰] [LABFLOW]                   [🔔⚙️👤🚪]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ÓRBRENES DE TRABAJO

[+ Nueva Orden]
[Buscar...]

OT-2026-001
Hemograma - Hospital XYZ
Juan Pérez
⚠️ URGENTE - 45 min

[Continuar Análisis]

─────────────────

OT-2026-002
Química - Clínica ABC
...
```

---

**Última actualización:** Abril 2026  
**Frontend versión:** React 18.2, Vite 5.0  
**Documentación versión:** 2.0 (Funcional)  
**Contacto:** documentacion@labflow.com