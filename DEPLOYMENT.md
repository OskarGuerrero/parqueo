# Instrucciones de Despliegue en Railway

## Opción 1: Sin Docker (Recomendado - Más Simple)

Railway auto-detectará que es una aplicación Node.js y la desplegará automáticamente.

### Pasos en Railway:

1. **Conecta tu repositorio** a Railway
2. **Crea un nuevo servicio** seleccionando tu repositorio
3. **Deja las opciones por defecto** - Railway auto-detectará que es Node.js
4. **Variables de entorno** (Optional):
   ```
   NODE_ENV=production
   ```
5. ¡Listo! Railway automáticamente:
   - Ejecutará `npm install` en la raíz
   - Ejecutará el script `build` (que compila frontend)
   - Ejecutará el script `start` (que inicia el backend)

### Cómo funciona:

- `package.json` (raíz) ejecuta: 
  ```bash
  npm run build    # Compila: frontend con Vite + instala backend
  npm start        # Inicia: backend en puerto 5000 sirviendo frontend
  ```

---

## Opción 2: Con Docker (Alternativa)

Si prefieres más control, usa el `Dockerfile`:

1. En Railway → **Settings** → **Dockerfile**
2. Asegúrate que:
   - **Dockerfile**: `Dockerfile`
   - **Build Context**: `.`
3. Railway construirá la imagen Docker

---

## Verificar el Despliegue

1. Railway expondrá una URL pública (ej: `https://parqueo.railway.app`)
2. Abre la URL en tu navegador
3. Deberías ver la página de login
4. Prueba con:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## Variables de Entorno en Producción

| Variable | Valor | Ubicación |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Railway Settings |
| `VITE_API_URL` | (automático `/api`) | No necesaria |

---

## Troubleshooting

### Error "Cannot find module"
- Railway necesita ejecutar `npm install`
- Verifica que `package.json` está en la raíz

### Error al compilar frontend
- Asegúrate que `frontend/package.json` tiene script `build`
- Verifica que Vite y plugins están en `devDependencies`

### Error "index.html no encontrado"
- El backend compila el frontend a `frontend/dist/`
- El backend sirve archivos estáticos desde ahí automáticamente

---

## Archivos de Configuración

- `package.json` (raíz): Configuración para Railway Buildpacks
- `Dockerfile`: Alternativa para despliegue con Docker
- `Procfile`: Configuración adicional para Railway
- `.npmrc`: Optimización de instalación de npm


