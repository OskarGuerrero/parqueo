# Instrucciones Rápidas para Ejecutar el Sistema

## Opción 1: Ejecución Manual (Recomendado para desarrollo)

### Terminal 1 - Backend
```powershell
cd c:\Users\Programador0\Documents\Proyectos WEB\parqueo\backend
npm install
npm start
```

### Terminal 2 - Frontend
```powershell
cd c:\Users\Programador0\Documents\Proyectos WEB\parqueo\frontend
npm install
npm run dev
```

Luego abre tu navegador en: `http://localhost:3000`

---

## 🔐 Credenciales de Prueba

### Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Acceso:** Entrada, Salida, Resumen y Reportes

### Operador
- **Usuario:** `operador`
- **Contraseña:** `oper123`
- **Acceso:** Entrada y Salida solamente

---

## Opción 2: Usar Docker Compose

```powershell
cd c:\Users\Programador0\Documents\Proyectos WEB\parqueo
docker-compose up
```

---

## 🎮 Cómo Usar el Sistema

### 1. LOGIN
Ingresa con una de las credenciales de prueba

### ENTRADA DE VEHÍCULO
1. Haz clic en la pestaña "Entrada"
2. Ingresa la placa del vehículo (ej: ABC123)
3. Haz clic en "Registrar Entrada"
4. El sistema genera un ticket que se imprime automáticamente

### SALIDA DE VEHÍCULO
1. Haz clic en la pestaña "Salida"
2. Ingresa la placa del vehículo
3. Haz clic en "Procesar Salida"
4. El sistema calcula la tarifa y genera un recibo
5. El recibo se imprime automáticamente

### VER RESUMEN DEL DÍA (Solo Admin)
1. Haz clic en la pestaña "Resumen"
2. Verás:
   - Total de vehículos facturados
   - Total facturado ($)
   - Promedio por vehículo
   - Tabla con detalles de cada transacción
   - Botones para reimprimir tickets y recibos

---

## 📋 Prueba Rápida

1. Login con admin/admin123
2. Entrada: ABC123
3. Entrada: XYZ789
4. Salida: ABC123 (calcula tarifa)
5. Ver Resumen para confirmar

---

## ⚠️ Solución de Problemas

**Puerto 5000 o 3000 en uso:**
```powershell
# Matar proceso en puerto 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**npm no reconocido:**
- Instala Node.js desde https://nodejs.org/

**Base de datos corrupta:**
- Elimina `backend/parqueo.db`
- Reinicia el servidor

---

**¡El sistema está listo para usar!** 🚗✨
