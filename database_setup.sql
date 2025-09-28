-- Script SQL para configurar las tablas en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear tabla de propiedades
CREATE TABLE IF NOT EXISTS propiedades (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'casa', 'departamento', 'penthouse', etc.
  estado VARCHAR(20) NOT NULL, -- 'venta', 'arriendo'
  direccion VARCHAR(255),
  comuna VARCHAR(100),
  ciudad VARCHAR(100),
  region VARCHAR(100),
  dormitorios INTEGER,
  banos INTEGER,
  metros_cuadrados INTEGER,
  estacionamientos INTEGER,
  amoblado BOOLEAN DEFAULT FALSE,
  amenidades TEXT[], -- Array de amenidades
  imagenes TEXT[], -- Array de URLs de imágenes
  fecha_disponible DATE,
  garantia VARCHAR(50),
  agente_nombre VARCHAR(255),
  agente_telefono VARCHAR(20),
  agente_email VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de consultas
CREATE TABLE IF NOT EXISTS consultas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  tipo_servicio VARCHAR(100) NOT NULL,
  tipo_propiedad VARCHAR(50),
  ubicacion_preferida VARCHAR(255),
  presupuesto_maximo DECIMAL(12,2),
  dormitorios INTEGER,
  banos INTEGER,
  estacionamientos INTEGER,
  amenidades_deseadas TEXT[],
  credito_pre_aprobado VARCHAR(20),
  monto_pre_aprobado DECIMAL(12,2),
  plazo_busqueda VARCHAR(50),
  fecha_mudanza DATE,
  comentarios TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'nueva' -- 'nueva', 'en_proceso', 'completada'
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_propiedades_estado ON propiedades(estado);
CREATE INDEX IF NOT EXISTS idx_propiedades_tipo ON propiedades(tipo);
CREATE INDEX IF NOT EXISTS idx_propiedades_comuna ON propiedades(comuna);
CREATE INDEX IF NOT EXISTS idx_propiedades_precio ON propiedades(precio);
CREATE INDEX IF NOT EXISTS idx_consultas_estado ON consultas(estado);
CREATE INDEX IF NOT EXISTS idx_consultas_tipo_servicio ON consultas(tipo_servicio);
CREATE INDEX IF NOT EXISTS idx_consultas_fecha ON consultas(fecha_creacion);

-- Insertar datos de ejemplo (opcional)
INSERT INTO propiedades (
  titulo, descripcion, precio, tipo, estado,
  direccion, comuna, ciudad, region,
  dormitorios, banos, metros_cuadrados, estacionamientos, amoblado,
  amenidades, imagenes, fecha_disponible, garantia,
  agente_nombre, agente_telefono, agente_email
) VALUES 
(
  'Departamento Moderno en Providencia',
  'Moderno departamento completamente amoblado en el corazón de Providencia.',
  850000,
  'departamento',
  'arriendo',
  'Av. Providencia 1234',
  'Providencia',
  'Santiago',
  'Metropolitana',
  2,
  2,
  90,
  1,
  true,
  ARRAY['Gimnasio', 'Terraza', 'Amoblado'],
  ARRAY['/uploads/depto-providencia-1.jpg', '/uploads/depto-providencia-2.jpg'],
  '2025-02-01',
  '2 meses',
  'María González',
  '+56 9 1234 5678',
  'maria@corretajepremium.cl'
),
(
  'Casa Familiar en Las Condes',
  'Amplia casa familiar con todas las comodidades en sector exclusivo.',
  1200000,
  'casa',
  'arriendo',
  'Los Conquistadores 5678',
  'Las Condes',
  'Santiago',
  'Metropolitana',
  4,
  3,
  180,
  2,
  false,
  ARRAY['Jardín', 'Piscina', 'Quincho'],
  ARRAY['/uploads/casa-lascondes-1.jpg', '/uploads/casa-lascondes-2.jpg'],
  '2025-01-15',
  '2 meses',
  'Carlos Rodríguez',
  '+56 9 8765 4321',
  'carlos@corretajepremium.cl'
),
(
  'Penthouse Exclusivo en Vitacura',
  'Penthouse de lujo con tecnología de punta y servicios premium.',
  450000000,
  'penthouse',
  'venta',
  'Av. Kennedy 9876',
  'Vitacura',
  'Santiago',
  'Metropolitana',
  4,
  4,
  220,
  3,
  true,
  ARRAY['Terraza 360°', 'Jacuzzi', 'Smart Home', 'Conserje'],
  ARRAY['/uploads/penthouse-vitacura-1.jpg', '/uploads/penthouse-vitacura-2.jpg'],
  '2025-03-01',
  null,
  'Ana Martínez',
  '+56 9 5555 6666',
  'ana@corretajepremium.cl'
),
(
  'Casa con Jardín en Ñuñoa',
  'Acogedora casa con amplio jardín, perfecta para familias.',
  320000000,
  'casa',
  'venta',
  'Irarrázaval 2345',
  'Ñuñoa',
  'Santiago',
  'Metropolitana',
  3,
  2,
  120,
  1,
  false,
  ARRAY['Jardín', 'Terraza', 'Bodega'],
  ARRAY['/uploads/casa-nunoa-1.jpg', '/uploads/casa-nunoa-2.jpg'],
  '2025-02-15',
  null,
  'Luis Fernández',
  '+56 9 7777 8888',
  'luis@corretajepremium.cl'
),
(
  'Departamento Nuevo en San Miguel',
  'Departamento nuevo con excelente conectividad y servicios.',
  650000,
  'departamento',
  'arriendo',
  'Gran Avenida 3456',
  'San Miguel',
  'Santiago',
  'Metropolitana',
  2,
  1,
  65,
  1,
  false,
  ARRAY['Gimnasio', 'Sala de Eventos', 'Seguridad 24h'],
  ARRAY['/uploads/depto-sanmiguel-1.jpg', '/uploads/depto-sanmiguel-2.jpg'],
  '2025-01-20',
  '1 mes',
  'Patricia Silva',
  '+56 9 9999 0000',
  'patricia@corretajepremium.cl'
);

-- Verificar que los datos se insertaron correctamente
SELECT COUNT(*) as total_propiedades FROM propiedades;
SELECT COUNT(*) as total_consultas FROM consultas;
