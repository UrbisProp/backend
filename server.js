const express = require('express');
const cors = require('cors');
const path = require('path');
const { agregarRutasConsultas } = require('./consultas');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 1337;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base de datos simulada en memoria (en producción usaría una base de datos real)
let propiedades = [
  {
    id: 1,
    titulo: "Departamento Moderno en Providencia",
    descripcion: "Moderno departamento completamente amoblado en el corazón de Providencia.",
    precio: 850000,
    tipo: "departamento",
    estado: "arriendo",
    ubicacion: {
      direccion: "Av. Providencia 1234",
      comuna: "Providencia",
      ciudad: "Santiago",
      region: "Metropolitana"
    },
    caracteristicas: {
      dormitorios: 2,
      banos: 2,
      metrosCuadrados: 90,
      estacionamientos: 1,
      amoblado: true
    },
    amenidades: ["Gimnasio", "Terraza", "Amoblado"],
    imagenes: [
      "/uploads/depto-providencia-1.jpg",
      "/uploads/depto-providencia-2.jpg"
    ],
    fechaDisponible: "2025-02-01",
    garantia: "2 meses",
    agente: {
      nombre: "María González",
      telefono: "+56 9 1234 5678",
      email: "maria@corretajepremium.cl"
    },
    fechaCreacion: "2024-12-01T10:00:00Z",
    fechaActualizacion: "2024-12-01T10:00:00Z"
  },
  {
    id: 2,
    titulo: "Casa Familiar en Las Condes",
    descripcion: "Amplia casa familiar con todas las comodidades en sector exclusivo.",
    precio: 1200000,
    tipo: "casa",
    estado: "arriendo",
    ubicacion: {
      direccion: "Los Conquistadores 5678",
      comuna: "Las Condes",
      ciudad: "Santiago",
      region: "Metropolitana"
    },
    caracteristicas: {
      dormitorios: 4,
      banos: 3,
      metrosCuadrados: 180,
      estacionamientos: 2,
      amoblado: false
    },
    amenidades: ["Jardín", "Piscina", "Quincho"],
    imagenes: [
      "/uploads/casa-lascondes-1.jpg",
      "/uploads/casa-lascondes-2.jpg"
    ],
    fechaDisponible: "2025-01-15",
    garantia: "2 meses",
    agente: {
      nombre: "Carlos Rodríguez",
      telefono: "+56 9 8765 4321",
      email: "carlos@corretajepremium.cl"
    },
    fechaCreacion: "2024-12-01T11:00:00Z",
    fechaActualizacion: "2024-12-01T11:00:00Z"
  },
  {
    id: 3,
    titulo: "Penthouse Exclusivo en Vitacura",
    descripcion: "Penthouse de lujo con tecnología de punta y servicios premium.",
    precio: 450000000,
    tipo: "penthouse",
    estado: "venta",
    ubicacion: {
      direccion: "Av. Kennedy 9876",
      comuna: "Vitacura",
      ciudad: "Santiago",
      region: "Metropolitana"
    },
    caracteristicas: {
      dormitorios: 4,
      banos: 4,
      metrosCuadrados: 220,
      estacionamientos: 3,
      amoblado: true
    },
    amenidades: ["Terraza 360°", "Jacuzzi", "Smart Home", "Conserje"],
    imagenes: [
      "/uploads/penthouse-vitacura-1.jpg",
      "/uploads/penthouse-vitacura-2.jpg"
    ],
    fechaDisponible: "2025-03-01",
    agente: {
      nombre: "Ana Martínez",
      telefono: "+56 9 5555 6666",
      email: "ana@corretajepremium.cl"
    },
    fechaCreacion: "2024-12-01T12:00:00Z",
    fechaActualizacion: "2024-12-01T12:00:00Z"
  }
];

let nextId = 4;

// Rutas de la API

// GET /api/propiedades - Obtener todas las propiedades con filtros opcionales
app.get('/api/propiedades', (req, res) => {
  let resultado = [...propiedades];
  
  // Filtros
  const { estado, tipo, minPrecio, maxPrecio, dormitorios, comuna } = req.query;
  
  if (estado) {
    resultado = resultado.filter(p => p.estado === estado);
  }
  
  if (tipo) {
    resultado = resultado.filter(p => p.tipo === tipo);
  }
  
  if (minPrecio) {
    resultado = resultado.filter(p => p.precio >= parseInt(minPrecio));
  }
  
  if (maxPrecio) {
    resultado = resultado.filter(p => p.precio <= parseInt(maxPrecio));
  }
  
  if (dormitorios) {
    resultado = resultado.filter(p => p.caracteristicas.dormitorios >= parseInt(dormitorios));
  }
  
  if (comuna) {
    resultado = resultado.filter(p => 
      p.ubicacion.comuna.toLowerCase().includes(comuna.toLowerCase())
    );
  }
  
  res.json({
    data: resultado,
    meta: {
      total: resultado.length,
      filtros: { estado, tipo, minPrecio, maxPrecio, dormitorios, comuna }
    }
  });
});

// GET /api/propiedades/:id - Obtener una propiedad específica
app.get('/api/propiedades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const propiedad = propiedades.find(p => p.id === id);
  
  if (!propiedad) {
    return res.status(404).json({ error: 'Propiedad no encontrada' });
  }
  
  res.json({ data: propiedad });
});

// POST /api/propiedades - Crear nueva propiedad
app.post('/api/propiedades', (req, res) => {
  const nuevaPropiedad = {
    id: nextId++,
    ...req.body,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };
  
  propiedades.push(nuevaPropiedad);
  
  res.status(201).json({
    data: nuevaPropiedad,
    message: 'Propiedad creada exitosamente'
  });
});

// PUT /api/propiedades/:id - Actualizar propiedad existente
app.put('/api/propiedades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = propiedades.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Propiedad no encontrada' });
  }
  
  propiedades[index] = {
    ...propiedades[index],
    ...req.body,
    id: id, // Mantener el ID original
    fechaActualizacion: new Date().toISOString()
  };
  
  res.json({
    data: propiedades[index],
    message: 'Propiedad actualizada exitosamente'
  });
});

// DELETE /api/propiedades/:id - Eliminar propiedad
app.delete('/api/propiedades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = propiedades.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Propiedad no encontrada' });
  }
  
  propiedades.splice(index, 1);
  
  res.json({ message: 'Propiedad eliminada exitosamente' });
});

// GET /api/stats - Estadísticas generales
app.get('/api/stats', (req, res) => {
  const stats = {
    totalPropiedades: propiedades.length,
    propiedadesVenta: propiedades.filter(p => p.estado === 'venta').length,
    propiedadesArriendo: propiedades.filter(p => p.estado === 'arriendo').length,
    precioPromedioVenta: propiedades
      .filter(p => p.estado === 'venta')
      .reduce((sum, p) => sum + p.precio, 0) / propiedades.filter(p => p.estado === 'venta').length || 0,
    precioPromedioArriendo: propiedades
      .filter(p => p.estado === 'arriendo')
      .reduce((sum, p) => sum + p.precio, 0) / propiedades.filter(p => p.estado === 'arriendo').length || 0
  };
  
  res.json({ data: stats });
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Agregar rutas de consultas
agregarRutasConsultas(app);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API de Propiedades ejecutándose en puerto ${PORT}`);
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
});

module.exports = app;
