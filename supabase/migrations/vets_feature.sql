-- Tablas para el Feature de Veterinarios

-- 1. Especialidades
CREATE TABLE IF NOT EXISTS specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Veterinarios
CREATE TABLE IF NOT EXISTS vets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    consulta_price INTEGER NOT NULL,
    experience_years INTEGER NOT NULL,
    image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Relación Vet-Especialidades
CREATE TABLE IF NOT EXISTS vet_specialties (
    vet_id UUID REFERENCES vets(id) ON DELETE CASCADE,
    specialty_id UUID REFERENCES specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (vet_id, specialty_id)
);

-- 4. Servicios (Generales que ofrecen los vets)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Relación Vet-Servicios
CREATE TABLE IF NOT EXISTS vet_services (
    vet_id UUID REFERENCES vets(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    price INTEGER, -- Precio específico del servicio para este vet si varía
    PRIMARY KEY (vet_id, service_id)
);

-- 6. Citas / Agendamientos
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Asumimos que hay un profile de usuario
    vet_id UUID REFERENCES vets(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Lectura)
CREATE POLICY "Permitir lectura pública de especialidades" ON specialties FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de veterinarios" ON vets FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de relación vet-especialidad" ON vet_specialties FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de servicios" ON services FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de relación vet-servicio" ON vet_services FOR SELECT USING (true);

-- Políticas de Citas (El usuario solo ve las suyas)
CREATE POLICY "Usuarios pueden ver sus propias citas" ON appointments 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias citas" ON appointments 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Datos Semilla (Seed)
INSERT INTO specialties (name) VALUES ('Bovinos'), ('Porcinos'), ('Equinos'), ('Aves'), ('Nutrición'), ('Cirugía'), ('Reproducción') ON CONFLICT DO NOTHING;

INSERT INTO services (name, description) VALUES 
('Consulta General', 'Evaluación médica integral del animal'),
('Vacunación', 'Aplicación de planes vacunales preventivos'),
('Cirugía', 'Procedimientos quirúrgicos especializados'),
('Control de Reproducción', 'Seguimiento y asistencía en partos y preñez')
ON CONFLICT DO NOTHING;
