# 🔐 Gestión de Usuarios - Sistema de Parqueo

## Usuarios por Defecto

El sistema crea automáticamente dos usuarios de prueba:

### Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Rol:** administrador

### Operador
- **Usuario:** `operador`
- **Contraseña:** `oper123`
- **Rol:** operador

---

## 🔧 Agregar Nuevos Usuarios

Actualmente el sistema no tiene una interfaz gráfica para crear usuarios. Para agregar nuevos usuarios, sigue estos pasos:

### Opción 1: Modificar el Backend

Edita el archivo `backend/server.js` y agrega usuarios adicionales en la sección de inicialización:

```javascript
// En la función db.serialize(), después de crear usuarios existentes:

db.get('SELECT * FROM usuarios WHERE usuario = ?', ['nuevouser'], (err, row) => {
  if (!row) {
    const userId = uuidv4();
    db.run(
      'INSERT INTO usuarios (id, usuario, clave, rol) VALUES (?, ?, ?, ?)',
      [userId, 'nuevouser', 'contraseña123', 'operador']
    );
    console.log('✓ Usuario nuevouser creado');
  }
});
```

### Opción 2: Usar SQL Directo (SQLite)

1. Instala SQLite Browser (gratuito)
2. Abre `backend/parqueo.db`
3. Ve a la tabla `usuarios`
4. Inserta un nuevo registro:

```sql
INSERT INTO usuarios (id, usuario, clave, rol) 
VALUES (UUID(), 'nuevouser', 'contraseña123', 'operador');
```

---

## 📋 Estructura de la Tabla Usuarios

```sql
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  usuario TEXT UNIQUE NOT NULL,
  clave TEXT NOT NULL,
  rol TEXT DEFAULT 'operador',
  creado DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Campos:
- **id**: UUID único del usuario
- **usuario**: Nombre de usuario (único, no puede repetirse)
- **clave**: Contraseña en texto plano
- **rol**: Tipo de usuario (`administrador` o `operador`)
- **creado**: Fecha y hora de creación

---

## 🔑 Roles y Permisos

### Administrador
```
✓ Acceso a entrada
✓ Acceso a salida
✓ Ver resumen diario
✓ Ver historial
✓ Reimprimir documentos
```

### Operador
```
✓ Acceso a entrada
✓ Acceso a salida
✗ Ver resumen (prohibido)
✗ Ver historial (prohibido)
```

---

## 🔒 Seguridad (Mejoras Futuras)

Para producción, se recomienda:

1. **Hashear contraseñas** con bcrypt
2. **Usar JWT tokens** en lugar de UUID simple
3. **Implementar HTTPS**
4. **Agregar logs de acceso**
5. **Implementar expiración de sesiones**
6. **Agregar interfaz gráfica de admin** para crear/editar usuarios

---

## 📝 Ejemplo: Insertar Usuario Programador

**Usuario:** `programador`
**Contraseña:** `prog2026`
**Rol:** `operador`

En `backend/server.js`, en la función `db.serialize()`:

```javascript
db.get('SELECT * FROM usuarios WHERE usuario = ?', ['programador'], (err, row) => {
  if (!row) {
    const userId = uuidv4();
    db.run(
      'INSERT INTO usuarios (id, usuario, clave, rol) VALUES (?, ?, ?, ?)',
      [userId, 'programador', 'prog2026', 'operador']
    );
    console.log('✓ Usuario programador creado: usuario=programador, clave=prog2026');
  }
});
```

Luego reinicia el servidor y el usuario estará disponible.

---

**Versión 1.0.0** - 2026
