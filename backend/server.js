import express from 'express';
import cors from 'cors';
import Database from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new Database.Database(join(__dirname, 'parqueo.db'));

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend compilado
const frontendDistPath = join(__dirname, '..', 'frontend', 'dist');
console.log(`📁 Frontend dist path: ${frontendDistPath}`);

app.use(express.static(frontendDistPath, {
  maxAge: '1d',
  etag: false
}));

// Ruta raíz
app.get('/', (req, res) => {
  const indexPath = join(frontendDistPath, 'index.html');
  console.log(`📄 Sirviendo index.html desde: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`❌ Error sirviendo index.html:`, err);
      res.status(404).json({ error: 'index.html no encontrado', path: indexPath });
    }
  });
});

// Fallback para rutas no encontradas (para SPA React)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`❌ Error en fallback:`, err);
      res.status(404).json({ error: 'Página no encontrada' });
    }
  });
});

// Variables globales de tarifa (se cargan de la BD)
let tarifaPorHora = 5;
let tarifaMinima = 2;

// Inicializar base de datos
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS configuracion (
      clave TEXT PRIMARY KEY,
      valor REAL,
      actualizado DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      usuario TEXT UNIQUE NOT NULL,
      clave TEXT NOT NULL,
      rol TEXT DEFAULT 'operador',
      creado DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      placa TEXT NOT NULL,
      entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
      salida DATETIME,
      tarifa_pagada REAL,
      estado TEXT DEFAULT 'activo'
    )
  `);

  // Cargar tarifas de configuración
  db.get('SELECT valor FROM configuracion WHERE clave = ?', ['tarifa_por_hora'], (err, row) => {
    if (row) {
      tarifaPorHora = row.valor;
    } else {
      // Crear configuración inicial
      db.run('INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)', 
        ['tarifa_por_hora', 5]);
    }
  });

  db.get('SELECT valor FROM configuracion WHERE clave = ?', ['tarifa_minima'], (err, row) => {
    if (row) {
      tarifaMinima = row.valor;
    } else {
      db.run('INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)', 
        ['tarifa_minima', 2]);
    }
  });

  // Crear usuario admin por defecto si no existe
  db.get('SELECT * FROM usuarios WHERE usuario = ?', ['admin'], (err, row) => {
    if (!row) {
      const adminId = uuidv4();
      db.run(
        'INSERT INTO usuarios (id, usuario, clave, rol) VALUES (?, ?, ?, ?)',
        [adminId, 'admin', 'admin123', 'administrador']
      );
      console.log('✓ Usuario admin creado: usuario=admin, clave=admin123');
    }
  });

  // Crear usuario operador por defecto si no existe
  db.get('SELECT * FROM usuarios WHERE usuario = ?', ['operador'], (err, row) => {
    if (!row) {
      const opId = uuidv4();
      db.run(
        'INSERT INTO usuarios (id, usuario, clave, rol) VALUES (?, ?, ?, ?)',
        [opId, 'operador', 'oper123', 'operador']
      );
      console.log('✓ Usuario operador creado: usuario=operador, clave=oper123');
    }
  });
});

// ===================== RUTAS =====================

// Endpoint: Registrar entrada
app.post('/api/entrada', (req, res) => {
  const { placa } = req.body;

  if (!placa) {
    return res.status(400).json({ error: 'Placa requerida' });
  }

  const placa_normalizada = placa.toUpperCase().trim();

  // Verificar si la placa ya está estacionada
  db.get(
    'SELECT * FROM tickets WHERE placa = ? AND estado = ?',
    [placa_normalizada, 'activo'],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        return res.status(409).json({
          error: 'Vehículo ya estacionado',
          ticket_id: row.id,
          entrada: row.entrada
        });
      }

      const ticketId = uuidv4();
      const ahora = new Date().toISOString();

      db.run(
        'INSERT INTO tickets (id, placa, entrada) VALUES (?, ?, ?)',
        [ticketId, placa_normalizada, ahora],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.status(201).json({
            success: true,
            ticket: {
              id: ticketId,
              placa: placa_normalizada,
              entrada: ahora,
              mensaje: 'Bienvenido al parqueo'
            }
          });
        }
      );
    }
  );
});

// Endpoint: Registrar salida
app.post('/api/salida', (req, res) => {
  const { placa } = req.body;

  if (!placa) {
    return res.status(400).json({ error: 'Placa requerida' });
  }

  const placa_normalizada = placa.toUpperCase().trim();

  // Buscar ticket activo
  db.get(
    'SELECT * FROM tickets WHERE placa = ? AND estado = ?',
    [placa_normalizada, 'activo'],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: 'Vehículo no encontrado en el parqueo' });
      }

      // Calcular tarifa
      const entrada = new Date(row.entrada);
      const salida = new Date();
      const minutos = Math.ceil((salida - entrada) / (1000 * 60));
      let tarifa;

      if (minutos <= 60) {
        tarifa = tarifaMinima; // Aplica tarifa mínima si el tiempo es menor o igual a 1 hora
      } else {
        const horas = Math.ceil(minutos / 60);
        tarifa = Math.max(horas * tarifaPorHora, tarifaMinima); // Calcula tarifa por horas, respetando la tarifa mínima
      }

      const salidaISO = salida.toISOString();

      // Actualizar ticket
      db.run(
        'UPDATE tickets SET salida = ?, tarifa_pagada = ?, estado = ? WHERE id = ?',
        [salidaISO, tarifa, 'pagado', row.id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            success: true,
            recibo: {
              ticket_id: row.id,
              placa: placa_normalizada,
              entrada: row.entrada,
              salida: salidaISO,
              minutos_estacionado: minutos,
              tarifa: tarifa,
              mensaje: 'Gracias por usar nuestro servicio'
            }
          });
        }
      );
    }
  );
});

// Endpoint: Consultar ticket activo
app.get('/api/ticket/:placa', (req, res) => {
  const placa_normalizada = req.params.placa.toUpperCase().trim();

  db.get(
    'SELECT * FROM tickets WHERE placa = ? AND estado = ?',
    [placa_normalizada, 'activo'],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: 'Ticket no encontrado' });
      }

      res.json(row);
    }
  );
});

// Endpoint: Resumen del día
app.get('/api/resumen-dia', (req, res) => {
  // Permitir filtrar por fecha recibida como query param (?fecha=yyyy-mm-dd)
  let fecha = req.query.fecha;
  if (!fecha) {
    fecha = new Date().toISOString().split('T')[0];
  }

  db.all(
    `SELECT * FROM tickets 
     WHERE DATE(entrada) = ? 
     ORDER BY entrada DESC`,
    [fecha],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const pagadas = rows.filter(row => row.estado === 'pagado');
      const totalFacturado = pagadas.reduce((sum, row) => sum + row.tarifa_pagada, 0);
      const totalVehiculos = pagadas.length;

      res.json({
        fecha: fecha,
        total_ingresados: rows.length,
        total_vehiculos: totalVehiculos,
        total_facturado: totalFacturado,
        detalles: rows // Devuelve todas las transacciones del día (activas y pagadas)
      });
    }
  );
});

// Endpoint: Historial completo
app.get('/api/historial', (req, res) => {
  db.all(
    'SELECT * FROM tickets ORDER BY entrada DESC LIMIT 100',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

// Endpoint: Borrar todo (solo para desarrollo)
app.delete('/api/reset', (req, res) => {
  db.run('DELETE FROM tickets', function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Base de datos reiniciada' });
  });
});

// ===================== AUTENTICACIÓN =====================

// Endpoint: Login
app.post('/api/login', (req, res) => {
  const { usuario, clave } = req.body;

  if (!usuario || !clave) {
    return res.status(400).json({ error: 'Usuario y clave requeridos' });
  }

  db.get(
    'SELECT * FROM usuarios WHERE usuario = ? AND clave = ?',
    [usuario, clave],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(401).json({ error: 'Usuario o clave incorrectos' });
      }

      // Crear token simple (en producción usar JWT)
      const token = uuidv4();

      res.json({
        success: true,
        token: token,
        usuario: {
          id: row.id,
          usuario: row.usuario,
          rol: row.rol
        }
      });
    }
  );
});

// Endpoint: Verificar sesión
app.get('/api/verificar', (req, res) => {
  res.json({ success: true });
});

// ===================== CONFIGURACIÓN =====================

// Endpoint: Obtener tarifas
app.get('/api/configuracion/tarifas', (req, res) => {
  res.json({
    tarifa_por_hora: tarifaPorHora,
    tarifa_minima: tarifaMinima
  });
});

// Endpoint: Actualizar tarifas (Solo Admin)
app.post('/api/configuracion/tarifas', (req, res) => {
  const { tarifa_por_hora, tarifa_minima } = req.body;

  if (!tarifa_por_hora || !tarifa_minima) {
    return res.status(400).json({ error: 'Ambas tarifas son requeridas' });
  }

  if (tarifa_por_hora <= 0 || tarifa_minima <= 0) {
    return res.status(400).json({ error: 'Las tarifas deben ser mayores a 0' });
  }

  // Actualizar variable global
  tarifaPorHora = tarifa_por_hora;
  tarifaMinima = tarifa_minima;

  // Guardar en BD
  db.run(
    'INSERT OR REPLACE INTO configuracion (clave, valor, actualizado) VALUES (?, ?, CURRENT_TIMESTAMP)',
    ['tarifa_por_hora', tarifa_por_hora],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.run(
        'INSERT OR REPLACE INTO configuracion (clave, valor, actualizado) VALUES (?, ?, CURRENT_TIMESTAMP)',
        ['tarifa_minima', tarifa_minima],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            success: true,
            message: 'Tarifas actualizadas correctamente',
            tarifa_por_hora: tarifaPorHora,
            tarifa_minima: tarifaMinima
          });
        }
      );
    }
  );
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 Servidor de parqueo ejecutándose en puerto ${PORT}`);
  console.log(`✓ Escuchando en 0.0.0.0:${PORT}`);
});
