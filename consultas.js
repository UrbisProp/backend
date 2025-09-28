// Endpoints para manejar consultas de contacto

// Base de datos simulada para consultas
let consultas = [];
let nextConsultaId = 1;

// Agregar rutas de consultas al servidor Express
function agregarRutasConsultas(app) {
  
  // POST /api/consultas - Crear nueva consulta
  app.post('/api/consultas', (req, res) => {
    try {
      const nuevaConsulta = {
        id: nextConsultaId++,
        ...req.body,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };
      
      consultas.push(nuevaConsulta);
      
      console.log(`📧 Nueva consulta recibida de ${nuevaConsulta.nombre} ${nuevaConsulta.apellido}`);
      console.log(`   Servicio: ${nuevaConsulta.tipoServicio}`);
      console.log(`   Email: ${nuevaConsulta.email}`);
      console.log(`   Teléfono: ${nuevaConsulta.telefono}`);
      
      res.status(201).json({
        data: nuevaConsulta,
        message: 'Consulta enviada exitosamente. Te contactaremos pronto.'
      });
    } catch (error) {
      console.error('Error al crear consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // GET /api/consultas - Obtener todas las consultas con filtros
  app.get('/api/consultas', (req, res) => {
    try {
      let resultado = [...consultas];
      
      // Filtros
      const { estado, tipoServicio, prioridad, fechaDesde, fechaHasta } = req.query;
      
      if (estado) {
        resultado = resultado.filter(c => c.estado === estado);
      }
      
      if (tipoServicio) {
        resultado = resultado.filter(c => c.tipoServicio === tipoServicio);
      }
      
      if (prioridad) {
        resultado = resultado.filter(c => c.prioridad === prioridad);
      }
      
      if (fechaDesde) {
        resultado = resultado.filter(c => new Date(c.fechaCreacion) >= new Date(fechaDesde));
      }
      
      if (fechaHasta) {
        resultado = resultado.filter(c => new Date(c.fechaCreacion) <= new Date(fechaHasta));
      }
      
      // Ordenar por fecha de creación (más recientes primero)
      resultado.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      
      res.json({
        data: resultado,
        meta: {
          total: resultado.length,
          filtros: { estado, tipoServicio, prioridad, fechaDesde, fechaHasta }
        }
      });
    } catch (error) {
      console.error('Error al obtener consultas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // GET /api/consultas/:id - Obtener consulta específica
  app.get('/api/consultas/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consulta = consultas.find(c => c.id === id);
      
      if (!consulta) {
        return res.status(404).json({ error: 'Consulta no encontrada' });
      }
      
      res.json({ data: consulta });
    } catch (error) {
      console.error('Error al obtener consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // PUT /api/consultas/:id - Actualizar consulta
  app.put('/api/consultas/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const index = consultas.findIndex(c => c.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Consulta no encontrada' });
      }
      
      consultas[index] = {
        ...consultas[index],
        ...req.body,
        id: id, // Mantener el ID original
        fechaActualizacion: new Date().toISOString()
      };
      
      console.log(`📝 Consulta ${id} actualizada - Estado: ${consultas[index].estado}`);
      
      res.json({
        data: consultas[index],
        message: 'Consulta actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // DELETE /api/consultas/:id - Eliminar consulta
  app.delete('/api/consultas/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const index = consultas.findIndex(c => c.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Consulta no encontrada' });
      }
      
      consultas.splice(index, 1);
      
      console.log(`🗑️ Consulta ${id} eliminada`);
      
      res.json({ message: 'Consulta eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // GET /api/consultas/stats - Estadísticas de consultas
  app.get('/api/consultas/stats', (req, res) => {
    try {
      const stats = {
        totalConsultas: consultas.length,
        consultasPendientes: consultas.filter(c => c.estado === 'pendiente').length,
        consultasEnProceso: consultas.filter(c => c.estado === 'en_proceso').length,
        consultasCompletadas: consultas.filter(c => c.estado === 'completada').length,
        consultasPorServicio: {},
        consultasPorPrioridad: {
          alta: consultas.filter(c => c.prioridad === 'alta').length,
          media: consultas.filter(c => c.prioridad === 'media').length,
          baja: consultas.filter(c => c.prioridad === 'baja').length
        },
        consultasUltimos7Dias: consultas.filter(c => {
          const fechaConsulta = new Date(c.fechaCreacion);
          const hace7Dias = new Date();
          hace7Dias.setDate(hace7Dias.getDate() - 7);
          return fechaConsulta >= hace7Dias;
        }).length
      };
      
      // Contar consultas por tipo de servicio
      consultas.forEach(consulta => {
        const servicio = consulta.tipoServicio;
        stats.consultasPorServicio[servicio] = (stats.consultasPorServicio[servicio] || 0) + 1;
      });
      
      res.json({ data: stats });
    } catch (error) {
      console.error('Error al obtener estadísticas de consultas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
}

module.exports = { agregarRutasConsultas };
