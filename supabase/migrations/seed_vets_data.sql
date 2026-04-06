-- Script completo para el módulo de Veterinarios
-- 1. Creación de Tablas (si no existen)
-- 2. Inserción de Datos de Prueba (Seed)

-- 1. Asegurar que user_id sea opcional para estos datos de prueba
ALTER TABLE veterinarian_profiles ALTER COLUMN user_id DROP NOT NULL;

-- 2. TABLA: perfiles de veterinarios (si no existe)
CREATE TABLE IF NOT EXISTS veterinarian_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Puede ser NULL para perfiles públicos sin cuenta activa
    professional_title TEXT NOT NULL,
    years_experience INTEGER DEFAULT 0,
    consultation_price INTEGER DEFAULT 0,
    total_consultations INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    bio TEXT,
    profile_image_url TEXT,
    location_city TEXT,
    location_department TEXT,
    animal_specialization TEXT[] DEFAULT '{}'::TEXT[], 
    available_for_emergency BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: especialidades técnicas de veterinarios (Diferente a animal_specialization)
CREATE TABLE IF NOT EXISTS vet_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_id UUID REFERENCES veterinarian_profiles(id) ON DELETE CASCADE,
    specialty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR RLS
ALTER TABLE veterinarian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_specialties ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACCESO PÚBLICO (Lectura para todos)
CREATE POLICY "Permitir lectura pública de perfiles" ON veterinarian_profiles FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de especialidades" ON vet_specialties FOR SELECT USING (true);

-- 5. DATOS DE PRUEBA (SEED DATA)
-- Limpiamos datos anteriores si existen (opcional)
-- DELETE FROM vet_specialties;
-- DELETE FROM veterinarian_profiles;

-- Insertar Veterinarios
INSERT INTO veterinarian_profiles (
    professional_title, years_experience, consultation_price, total_consultations, 
    rating, is_verified, bio, profile_image_url, location_city, 
    location_department, animal_specialization, available_for_emergency, status
) VALUES 
(
    'Dr. Ricardo Mendoza', 12, 85000, 450, 4.9, true, 
    'Especialista en cirugía mayor y medicina reproductiva bovina. Más de 10 años atendiendo hatos lecheros en la sabana.',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80',
    'Sopó', 'Cundinamarca', ARRAY['Bovinos', 'Equinos', 'Reproducción'], true, 'active'
),
(
    'Dra. Camila Jaramillo', 8, 70000, 320, 4.7, true, 
    'Experta en sanidad porcina y nutrición animal. Asesoría técnica para granjas tecnificadas y bioseguridad.',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80',
    'Medellín', 'Antioquia', ARRAY['Porcinos', 'Aves', 'Nutrición'], false, 'active'
),
(
    'Dr. Carlos Mario Ortiz', 15, 95000, 600, 5.0, true, 
    'Veterinario especializado en equinos de alto rendimiento. Experiencia en inseminación artificial y genética.',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&q=80',
    'Tenjo', 'Cundinamarca', ARRAY['Equinos', 'Mascotas', 'Cirugía'], true, 'active'
);

-- Insertar Especialidades Técnicas (usando subconsultas para los IDs)
INSERT INTO vet_specialties (vet_id, specialty)
SELECT id, 'Cirugía' FROM veterinarian_profiles WHERE professional_title = 'Dr. Ricardo Mendoza';

INSERT INTO vet_specialties (vet_id, specialty)
SELECT id, 'Reproducción' FROM veterinarian_profiles WHERE professional_title = 'Dr. Ricardo Mendoza';

INSERT INTO vet_specialties (vet_id, specialty)
SELECT id, 'Nutrición' FROM veterinarian_profiles WHERE professional_title = 'Dra. Camila Jaramillo';

INSERT INTO vet_specialties (vet_id, specialty)
SELECT id, 'Inseminación' FROM veterinarian_profiles WHERE professional_title = 'Dr. Carlos Mario Ortiz';

INSERT INTO vet_specialties (vet_id, specialty)
SELECT id, 'Ecografía' FROM veterinarian_profiles WHERE professional_title = 'Dr. Carlos Mario Ortiz';
