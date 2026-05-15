# 🚗 Sistema de Control de Parqueo

Un sistema completo para gestionar la entrada, salida y facturación de vehículos en un parqueo.

## 📋 Características

- **Autenticación de Usuarios**: Login con usuario y contraseña
- **Roles de Usuario**: Administrador y Operador
- **Registro de Entrada**: Captura de placa y generación automática de ticket
- **Registro de Salida**: Búsqueda de vehículo y cálculo automático de tarifa
- **Generación de Tickets**: Impresión de tickets y recibos
- **Resumen Diario**: Dashboard con estadísticas y facturación del día (Solo Admin)
- **Historial Completo**: Registro de todas las transacciones
- **Interfaz Responsiva**: Diseño moderno y fácil de usar
- **Reimpresión de Documentos**: Reimprimir tickets y recibos desde el resumen

## 🛠️ Requisitos

- Node.js 16+
- npm o yarn

## 🚀 Instalación y Ejecución

### 1. Backend

```bash
cd backend
npm install
npm start
```

El servidor escuchará en `http://localhost:5000`

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📊 API Endpoints

### Autenticación
```
POST /api/login
Body: { "usuario": "admin", "clave": "admin123" }
Response: { "success": true, "token": "...", "usuario": {...} }
```

### Entrada de Vehículo
```
POST /api/entrada
Body: { "placa": "ABC123" }
```

### Salida de Vehículo
```
POST /api/salida
Body: { "placa": "ABC123" }
```

### Consultar Ticket Activo
```
GET /api/ticket/:placa
```

### Resumen del Día
```
GET /api/resumen-dia
```

### Historial Completo
```
GET /api/historial
```

### Verificar Sesión
```
GET /api/verificar
```

## 💰 Tarificación

- **Tarifa por hora**: $5.00
- **Tarifa mínima**: $2.00

La tarifa se calcula redondeando hacia arriba el número de horas estacionadas, con un mínimo de $2.00.

## 🔐 Autenticación y Roles

El sistema cuenta con dos tipos de usuarios:

### Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Permisos:**
  - Registrar entrada de vehículos
  - Registrar salida de vehículos
  - Ver resumen diario con facturación
  - Ver historial completo
  - Reimprimir tickets y recibos

### Operador
- **Usuario:** `operador`
- **Contraseña:** `oper123`
- **Permisos:**
  - Registrar entrada de vehículos
  - Registrar salida de vehículos
  - No puede ver resumen ni reportes

## 📁 Estructura del Proyecto

```
parqueo/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── parqueo.db (se crea automáticamente)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── Entrada.jsx
│   │       ├── Salida.jsx
│   │       └── Resumen.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

## 🐳 Usar con Docker (Opcional)

```bash
docker-compose up
```

## 🎯 Flujo de Uso

1. **Cliente llega**: Ingresa placa → Se genera ticket con hora de entrada → Se imprime
2. **Cliente sale**: Ingresa placa → Sistema calcula tarifa → Se genera recibo → Se imprime
3. **Administrador**: Visualiza resumen diario con total facturado y listado de transacciones

## 📝 Notas

- Los datos se guardan en SQLite (backend/parqueo.db)
- Los tickets se pueden imprimir automáticamente
- El sistema reinicia sin perder datos al ser persistentes en BD
- Para desarrollo: `npm run dev` en ambas carpetas

## 🔧 Configuración

Para cambiar las tarifas, edita `backend/server.js`:

```javascript
const TARIFA_POR_HORA = 5;      // Cambiar aquí
const TARIFA_MINIMA = 2;         // Cambiar aquí
```

## 📧 Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio.

---

**Versión 1.0.0** - 2026
