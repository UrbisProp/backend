const express = require('express');
const cors = require('cors');
const path = require('path');
const { propiedadesService, consultasService } = require('./supabase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 1337;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== RUTAS DE PROPIEDADES ====================

// GET /api/propiedades - Obtener todas las propiedades con filtros opcionales
app.get('/api/propiedades', async (req, res) => {
  try {
    const filtros = {
      estado: req.query.estado,
      tipo: req.query.tipo,
      comuna: req.query.comuna,
      precioMin: req.query.precioMin ? parseFloat(req.query.precioMin) : undefined,
      precioMax: req.query.precioMax ? parseFloat(req.query.precioMax) : undefined,
      dormitorios: req.query.dormitorios ? parseInt(req.query.dormitorios) : undefined,
      banos: req.query.banos ? parseInt(req.query.banos) : undefined
    };

    // Remover filtros undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined) {
        delete filtros[key];
      }
    });

    const resultado = await propiedadesService.obtenerPropiedades(filtros);

    if (!resultado.success) {
      return res.status(500).json({
        error: 'Error al obtener propiedades',
        details: resultado.error
      });
    }

    // Formatear propiedades para mantener compatibilidad con el frontend
    const propiedadesFormateadas = resultado.data.map(prop => 
      propiedadesService.formatearPropiedadParaAPI(prop)
    );

    res.json({
      data: propiedadesFormateadas,
      meta: {
        total: resultado.total,
        filtros: filtros
      }
    });
  } catch (error) {
    console.error('Error en GET /api/propiedades:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// GET /api/propiedades/:id - Obtener una propiedad específica
app.get('/api/propiedades/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID de propiedad inválido'
      });
    }

    const resultado = await propiedadesService.obtenerPropiedadPorId(id);

    if (!resultado.success) {
      return res.status(404).json({
        error: 'Propiedad no encontrada',
        details: resultado.error
      });
    }

    const propiedadFormateada = propiedadesService.formatearPropiedadParaAPI(resultado.data);

    res.json({
      data: propiedadFormateada
    });
  } catch (error) {
    console.error('Error en GET /api/propiedades/:id:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// POST /api/propiedades - Crear una nueva propiedad
app.post('/api/propiedades', async (req, res) => {
  try {
    // Validar datos requeridos
    const { titulo, precio, tipo, estado } = req.body;
    
    if (!titulo || !precio || !tipo || !estado) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['titulo', 'precio', 'tipo', 'estado']
      });
    }

    if (!['venta', 'arriendo'].includes(estado)) {
      return res.status(400).json({
        error: 'Estado debe ser "venta" o "arriendo"'
      });
    }

    const resultado = await propiedadesService.crearPropiedad(req.body);

    if (!resultado.success) {
      return res.status(500).json({
        error: 'Error al crear propiedad',
        details: resultado.error
      });
    }

    res.status(201).json({
      message: 'Propiedad creada exitosamente',
      data: resultado.data
    });
  } catch (error) {
    console.error('Error en POST /api/propiedades:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// PUT /api/propiedades/:id - Actualizar una propiedad existente
app.put('/api/propiedades/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID de propiedad inválido'
      });
    }

    const resultado = await propiedadesService.actualizarPropiedad(id, req.body);

    if (!resultado.success) {
      if (resultado.error.includes('No rows')) {
        return res.status(404).json({
          error: 'Propiedad no encontrada'
        });
      }
      return res.status(500).json({
        error: 'Error al actualizar propiedad',
        details: resultado.error
      });
    }

    res.json({
      message: 'Propiedad actualizada exitosamente',
      data: resultado.data
    });
  } catch (error) {
    console.error('Error en PUT /api/propiedades/:id:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// DELETE /api/propiedades/:id - Eliminar una propiedad
app.delete('/api/propiedades/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID de propiedad inválido'
      });
    }

    const resultado = await propiedadesService.eliminarPropiedad(id);

    if (!resultado.success) {
      return res.status(500).json({
        error: 'Error al eliminar propiedad',
        details: resultado.error
      });
    }

    res.json({
      message: resultado.message
    });
  } catch (error) {
    console.error('Error en DELETE /api/propiedades/:id:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ==================== RUTAS DE CONSULTAS ====================

// POST /api/consultas - Crear una nueva consulta
app.post('/api/consultas', async (req, res) => {
  try {
    // Validar datos requeridos
    const { nombre, apellido, email, telefono, tipoServicio } = req.body;
    
    if (!nombre || !apellido || !email || !telefono || !tipoServicio) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['nombre', 'apellido', 'email', 'telefono', 'tipoServicio']
      });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    const resultado = await consultasService.crearConsulta(req.body);

    if (!resultado.success) {
      return res.status(500).json({
        error: 'Error al crear consulta',
        details: resultado.error
      });
    }

    res.status(201).json({
      message: 'Consulta enviada exitosamente',
      data: resultado.data
    });
  } catch (error) {
    console.error('Error en POST /api/consultas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// GET /api/consultas - Obtener todas las consultas
app.get('/api/consultas', async (req, res) => {
  try {
    const filtros = {
      estado: req.query.estado,
      tipoServicio: req.query.tipoServicio
    };

    // Remover filtros undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined) {
        delete filtros[key];
      }
    });

    const resultado = await consultasService.obtenerConsultas(filtros);

    if (!resultado.success) {
      return res.status(500).json({
        error: 'Error al obtener consultas',
        details: resultado.error
      });
    }

    res.json({
      data: resultado.data,
      meta: {
        total: resultado.total,
        filtros: filtros
      }
    });
  } catch (error) {
    console.error('Error en GET /api/consultas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ==================== RUTAS DE ESTADÍSTICAS ====================

// GET /api/stats - Obtener estadísticas generales
app.get('/api/stats', async (req, res) => {
  try {
    const [propiedadesStats, consultasStats] = await Promise.all([
      propiedadesService.obtenerEstadisticas(),
      consultasService.obtenerEstadisticasConsultas()
    ]);

    if (!propiedadesStats.success || !consultasStats.success) {
      return res.status(500).json({
        error: 'Error al obtener estadísticas'
      });
    }

    res.json({
      propiedades: propiedadesStats.data,
      consultas: consultasStats.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en GET /api/stats:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// GET /api/consultas/stats - Obtener estadísticas de consultas
app.get('/api/consultas/stats', async (req, res) => {
  try {
    const resultado = await consultasService.obtenerEstadisticasConsultas();

    if (!resultado.success) {
      return res.status(500).json({
        error: 'Error al obtener estadísticas de consultas',
        details: resultado.error
      });
    }

    res.json({
      data: resultado.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en GET /api/consultas/stats:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ==================== RUTAS DE UTILIDAD ====================

// GET /health - Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: 'Supabase PostgreSQL'
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    availableEndpoints: [
      'GET /api/propiedades',
      'GET /api/propiedades/:id',
      'POST /api/propiedades',
      'PUT /api/propiedades/:id',
      'DELETE /api/propiedades/:id',
      'POST /api/consultas',
      'GET /api/consultas',
      'GET /api/stats',
      'GET /api/consultas/stats',
      'GET /health'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API de Propiedades con Supabase ejecutándose en puerto ${PORT}`);
  console.log(`📍 Endpoints disponibles:`);
  console.log(`   GET    /api/propiedades - Listar propiedades`);
  console.log(`   GET    /api/propiedades/:id - Obtener propiedad específica`);
  console.log(`   POST   /api/propiedades - Crear nueva propiedad`);
  console.log(`   PUT    /api/propiedades/:id - Actualizar propiedad`);
  console.log(`   DELETE /api/propiedades/:id - Eliminar propiedad`);
  console.log(`   GET    /api/stats - Estadísticas generales`);
  console.log(`   POST   /api/consultas - Enviar consulta de contacto`);
  console.log(`   GET    /api/consultas - Listar consultas`);
  console.log(`   GET    /api/consultas/stats - Estadísticas de consultas`);
  console.log(`   GET    /health - Estado del servidor`);
  console.log(`🗄️  Base de datos: Supabase PostgreSQL`);
  console.log(`🌐 CORS habilitado para todos los orígenes`);
});

module.exports = app;
