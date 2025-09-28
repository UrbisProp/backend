const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Funciones para gestionar propiedades
const propiedadesService = {
  // Obtener todas las propiedades con filtros opcionales
  async obtenerPropiedades(filtros = {}) {
    try {
      let query = supabase
        .from('propiedades')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      // Aplicar filtros
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros.comuna) {
        query = query.ilike('comuna', `%${filtros.comuna}%`);
      }
      if (filtros.precioMin) {
        query = query.gte('precio', filtros.precioMin);
      }
      if (filtros.precioMax) {
        query = query.lte('precio', filtros.precioMax);
      }
      if (filtros.dormitorios) {
        query = query.gte('dormitorios', filtros.dormitorios);
      }
      if (filtros.banos) {
        query = query.gte('banos', filtros.banos);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        total: data ? data.length : 0
      };
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        total: 0
      };
    }
  },

  // Obtener una propiedad por ID
  async obtenerPropiedadPorId(id) {
    try {
      const { data, error } = await supabase
        .from('propiedades')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error al obtener propiedad:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Crear una nueva propiedad
  async crearPropiedad(propiedadData) {
    try {
      // Formatear los datos para la base de datos
      const propiedadFormateada = {
        titulo: propiedadData.titulo,
        descripcion: propiedadData.descripcion,
        precio: propiedadData.precio,
        tipo: propiedadData.tipo,
        estado: propiedadData.estado,
        direccion: propiedadData.ubicacion?.direccion,
        comuna: propiedadData.ubicacion?.comuna,
        ciudad: propiedadData.ubicacion?.ciudad,
        region: propiedadData.ubicacion?.region,
        dormitorios: propiedadData.caracteristicas?.dormitorios,
        banos: propiedadData.caracteristicas?.banos,
        metros_cuadrados: propiedadData.caracteristicas?.metrosCuadrados,
        estacionamientos: propiedadData.caracteristicas?.estacionamientos,
        amoblado: propiedadData.caracteristicas?.amoblado || false,
        amenidades: propiedadData.amenidades || [],
        imagenes: propiedadData.imagenes || [],
        fecha_disponible: propiedadData.fechaDisponible,
        garantia: propiedadData.garantia,
        agente_nombre: propiedadData.agente?.nombre,
        agente_telefono: propiedadData.agente?.telefono,
        agente_email: propiedadData.agente?.email,
        fecha_actualizacion: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('propiedades')
        .insert([propiedadFormateada])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: this.formatearPropiedadParaAPI(data)
      };
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Actualizar una propiedad existente
  async actualizarPropiedad(id, propiedadData) {
    try {
      // Formatear los datos para la base de datos
      const propiedadFormateada = {
        titulo: propiedadData.titulo,
        descripcion: propiedadData.descripcion,
        precio: propiedadData.precio,
        tipo: propiedadData.tipo,
        estado: propiedadData.estado,
        direccion: propiedadData.ubicacion?.direccion,
        comuna: propiedadData.ubicacion?.comuna,
        ciudad: propiedadData.ubicacion?.ciudad,
        region: propiedadData.ubicacion?.region,
        dormitorios: propiedadData.caracteristicas?.dormitorios,
        banos: propiedadData.caracteristicas?.banos,
        metros_cuadrados: propiedadData.caracteristicas?.metrosCuadrados,
        estacionamientos: propiedadData.caracteristicas?.estacionamientos,
        amoblado: propiedadData.caracteristicas?.amoblado,
        amenidades: propiedadData.amenidades,
        imagenes: propiedadData.imagenes,
        fecha_disponible: propiedadData.fechaDisponible,
        garantia: propiedadData.garantia,
        agente_nombre: propiedadData.agente?.nombre,
        agente_telefono: propiedadData.agente?.telefono,
        agente_email: propiedadData.agente?.email,
        fecha_actualizacion: new Date().toISOString()
      };

      // Remover campos undefined
      Object.keys(propiedadFormateada).forEach(key => {
        if (propiedadFormateada[key] === undefined) {
          delete propiedadFormateada[key];
        }
      });

      const { data, error } = await supabase
        .from('propiedades')
        .update(propiedadFormateada)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: this.formatearPropiedadParaAPI(data)
      };
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Eliminar una propiedad
  async eliminarPropiedad(id) {
    try {
      const { error } = await supabase
        .from('propiedades')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Propiedad eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Formatear propiedad de la base de datos para la API
  formatearPropiedadParaAPI(propiedadDB) {
    return {
      id: propiedadDB.id,
      titulo: propiedadDB.titulo,
      descripcion: propiedadDB.descripcion,
      precio: propiedadDB.precio,
      tipo: propiedadDB.tipo,
      estado: propiedadDB.estado,
      ubicacion: {
        direccion: propiedadDB.direccion,
        comuna: propiedadDB.comuna,
        ciudad: propiedadDB.ciudad,
        region: propiedadDB.region
      },
      caracteristicas: {
        dormitorios: propiedadDB.dormitorios,
        banos: propiedadDB.banos,
        metrosCuadrados: propiedadDB.metros_cuadrados,
        estacionamientos: propiedadDB.estacionamientos,
        amoblado: propiedadDB.amoblado
      },
      amenidades: propiedadDB.amenidades || [],
      imagenes: propiedadDB.imagenes || [],
      fechaDisponible: propiedadDB.fecha_disponible,
      garantia: propiedadDB.garantia,
      agente: {
        nombre: propiedadDB.agente_nombre,
        telefono: propiedadDB.agente_telefono,
        email: propiedadDB.agente_email
      },
      fechaCreacion: propiedadDB.fecha_creacion,
      fechaActualizacion: propiedadDB.fecha_actualizacion
    };
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    try {
      const { data: propiedades, error } = await supabase
        .from('propiedades')
        .select('estado, tipo, precio');

      if (error) {
        throw error;
      }

      const stats = {
        total: propiedades.length,
        enVenta: propiedades.filter(p => p.estado === 'venta').length,
        enArriendo: propiedades.filter(p => p.estado === 'arriendo').length,
        porTipo: {},
        precioPromedio: {
          venta: 0,
          arriendo: 0
        }
      };

      // Estadísticas por tipo
      propiedades.forEach(p => {
        stats.porTipo[p.tipo] = (stats.porTipo[p.tipo] || 0) + 1;
      });

      // Precio promedio
      const ventaProps = propiedades.filter(p => p.estado === 'venta');
      const arriendoProps = propiedades.filter(p => p.estado === 'arriendo');

      if (ventaProps.length > 0) {
        stats.precioPromedio.venta = Math.round(
          ventaProps.reduce((sum, p) => sum + p.precio, 0) / ventaProps.length
        );
      }

      if (arriendoProps.length > 0) {
        stats.precioPromedio.arriendo = Math.round(
          arriendoProps.reduce((sum, p) => sum + p.precio, 0) / arriendoProps.length
        );
      }

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }
};

// Funciones para gestionar consultas
const consultasService = {
  // Crear una nueva consulta
  async crearConsulta(consultaData) {
    try {
      const consultaFormateada = {
        nombre: consultaData.nombre,
        apellido: consultaData.apellido,
        email: consultaData.email,
        telefono: consultaData.telefono,
        tipo_servicio: consultaData.tipoServicio,
        tipo_propiedad: consultaData.tipoPropiedad,
        ubicacion_preferida: consultaData.ubicacionPreferida,
        presupuesto_maximo: consultaData.presupuestoMaximo,
        dormitorios: consultaData.dormitorios,
        banos: consultaData.banos,
        estacionamientos: consultaData.estacionamientos,
        amenidades_deseadas: consultaData.amenidadesDeseadas || [],
        credito_pre_aprobado: consultaData.creditoPreAprobado,
        monto_pre_aprobado: consultaData.montoPreAprobado,
        plazo_busqueda: consultaData.plazoBusqueda,
        fecha_mudanza: consultaData.fechaMudanza,
        comentarios: consultaData.comentarios,
        estado: 'nueva'
      };

      const { data, error } = await supabase
        .from('consultas')
        .insert([consultaFormateada])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error al crear consulta:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Obtener todas las consultas
  async obtenerConsultas(filtros = {}) {
    try {
      let query = supabase
        .from('consultas')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      // Aplicar filtros
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }
      if (filtros.tipoServicio) {
        query = query.eq('tipo_servicio', filtros.tipoServicio);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        total: data ? data.length : 0
      };
    } catch (error) {
      console.error('Error al obtener consultas:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        total: 0
      };
    }
  },

  // Obtener estadísticas de consultas
  async obtenerEstadisticasConsultas() {
    try {
      const { data: consultas, error } = await supabase
        .from('consultas')
        .select('tipo_servicio, estado, fecha_creacion');

      if (error) {
        throw error;
      }

      const stats = {
        total: consultas.length,
        porEstado: {},
        porTipoServicio: {},
        recientes: consultas.filter(c => {
          const fecha = new Date(c.fecha_creacion);
          const hace7Dias = new Date();
          hace7Dias.setDate(hace7Dias.getDate() - 7);
          return fecha >= hace7Dias;
        }).length
      };

      // Estadísticas por estado
      consultas.forEach(c => {
        stats.porEstado[c.estado] = (stats.porEstado[c.estado] || 0) + 1;
        stats.porTipoServicio[c.tipo_servicio] = (stats.porTipoServicio[c.tipo_servicio] || 0) + 1;
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de consultas:', error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }
};

module.exports = {
  supabase,
  propiedadesService,
  consultasService
};
