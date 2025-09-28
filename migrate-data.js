const { propiedadesService } = require('./supabase');

// Datos de ejemplo para migrar
const propiedadesEjemplo = [
  {
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
    }
  },
  {
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
    }
  },
  {
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
    }
  },
  {
    titulo: "Casa con Jardín en Ñuñoa",
    descripcion: "Acogedora casa con amplio jardín, perfecta para familias.",
    precio: 320000000,
    tipo: "casa",
    estado: "venta",
    ubicacion: {
      direccion: "Irarrázaval 2345",
      comuna: "Ñuñoa",
      ciudad: "Santiago",
      region: "Metropolitana"
    },
    caracteristicas: {
      dormitorios: 3,
      banos: 2,
      metrosCuadrados: 120,
      estacionamientos: 1,
      amoblado: false
    },
    amenidades: ["Jardín", "Terraza", "Bodega"],
    imagenes: [
      "/uploads/casa-nunoa-1.jpg",
      "/uploads/casa-nunoa-2.jpg"
    ],
    fechaDisponible: "2025-02-15",
    agente: {
      nombre: "Luis Fernández",
      telefono: "+56 9 7777 8888",
      email: "luis@corretajepremium.cl"
    }
  },
  {
    titulo: "Departamento Nuevo en San Miguel",
    descripcion: "Departamento nuevo con excelente conectividad y servicios.",
    precio: 650000,
    tipo: "departamento",
    estado: "arriendo",
    ubicacion: {
      direccion: "Gran Avenida 3456",
      comuna: "San Miguel",
      ciudad: "Santiago",
      region: "Metropolitana"
    },
    caracteristicas: {
      dormitorios: 2,
      banos: 1,
      metrosCuadrados: 65,
      estacionamientos: 1,
      amoblado: false
    },
    amenidades: ["Gimnasio", "Sala de Eventos", "Seguridad 24h"],
    imagenes: [
      "/uploads/depto-sanmiguel-1.jpg",
      "/uploads/depto-sanmiguel-2.jpg"
    ],
    fechaDisponible: "2025-01-20",
    garantia: "1 mes",
    agente: {
      nombre: "Patricia Silva",
      telefono: "+56 9 9999 0000",
      email: "patricia@corretajepremium.cl"
    }
  }
];

async function migrarDatos() {
  console.log('🚀 Iniciando migración de datos de ejemplo...');
  
  try {
    // Verificar si ya existen propiedades
    const propiedadesExistentes = await propiedadesService.obtenerPropiedades();
    
    if (propiedadesExistentes.success && propiedadesExistentes.total > 0) {
      console.log(`⚠️  Ya existen ${propiedadesExistentes.total} propiedades en la base de datos.`);
      console.log('¿Deseas continuar con la migración? (Esto agregará más propiedades)');
      console.log('Para continuar, ejecuta: node migrate-data.js --force');
      
      if (!process.argv.includes('--force')) {
        return;
      }
    }

    let exitosos = 0;
    let errores = 0;

    for (const propiedad of propiedadesEjemplo) {
      console.log(`📝 Creando: ${propiedad.titulo}...`);
      
      const resultado = await propiedadesService.crearPropiedad(propiedad);
      
      if (resultado.success) {
        console.log(`✅ Creada exitosamente (ID: ${resultado.data.id})`);
        exitosos++;
      } else {
        console.log(`❌ Error al crear: ${resultado.error}`);
        errores++;
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`✅ Propiedades creadas exitosamente: ${exitosos}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📈 Total de propiedades procesadas: ${propiedadesEjemplo.length}`);

    if (exitosos > 0) {
      console.log('\n🎉 ¡Migración completada! Las propiedades están ahora disponibles en Supabase.');
      console.log('Puedes verificarlas en el dashboard de Supabase o a través de la API.');
    }

  } catch (error) {
    console.error('💥 Error durante la migración:', error);
  }
}

// Ejecutar migración si el script se ejecuta directamente
if (require.main === module) {
  migrarDatos().then(() => {
    console.log('🏁 Proceso de migración finalizado.');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { migrarDatos, propiedadesEjemplo };
