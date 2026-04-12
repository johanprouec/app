CREATE TABLE IF NOT EXISTS productive_lands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Agrícola', 'Ganadero', 'Mixto')),
  location_city TEXT,
  location_department TEXT,
  area_ha NUMERIC,
  price_per_ha NUMERIC,
  transaction_type TEXT CHECK (transaction_type IN ('Venta', 'Alquiler')),
  soil_type TEXT,
  water_source TEXT,
  altitude INTEGER,
  image_url TEXT,
  polygon_data JSONB, -- Array of [lng, lat]
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE productive_lands ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Allow public read access" ON productive_lands FOR SELECT USING (true);

-- Política para guardado (autenticado por ahora para simplificar)
CREATE POLICY "Allow authenticated insert" ON productive_lands FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true); -- Permitiendo anon por ahora para pruebas locales si no hay login configurado plenamente

-- Datos semilla
INSERT INTO productive_lands (name, type, location_city, location_department, area_ha, price_per_ha, transaction_type, soil_type, water_source, altitude, image_url, polygon_data)
VALUES 
(
  'Finca La Esperanza', 
  'Agrícola', 
  'Ibagué', 
  'Tolima', 
  42, 
  4.2, 
  'Venta', 
  'Franco-Arcilloso', 
  'Río + Pozo', 
  850, 
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  '[[-75.2443, 4.4389], [-75.2403, 4.4389], [-75.2403, 4.4349], [-75.2443, 4.4349], [-75.2443, 4.4389]]'::jsonb
),
(
  'Hacienda San Rafael', 
  'Ganadero', 
  'Yopal', 
  'Casanare', 
  215, 
  3.8, 
  'Alquiler', 
  'Franco', 
  'Jagüey', 
  350, 
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  '[[-72.4000, 5.3000], [-72.3900, 5.3000], [-72.3900, 5.2900], [-72.4000, 5.2900], [-72.4000, 5.3000]]'::jsonb
);
