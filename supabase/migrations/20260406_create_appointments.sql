-- Script para crear la tabla de citas (appointments) en Supabase
-- Ejecuta este SQL en tu Editor SQL de Supabase (Dashboard -> SQL Editor)

-- 1. Crear la tabla
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vet_id UUID REFERENCES veterinarian_profiles(id) ON DELETE CASCADE NOT NULL,
    service_id TEXT DEFAULT 'consulta_general',
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Seguridad
-- Permite que los usuarios vean solo sus propias citas
CREATE POLICY "Users can view their own appointments" 
ON appointments FOR SELECT 
USING (auth.uid() = user_id);

-- Permite que los usuarios creen sus propias citas
CREATE POLICY "Users can create their own appointments" 
ON appointments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. (Opcional) Permite que los veterinarios vean las citas que les han agendado
-- Asumiendo que el vet_id también vincula a la tabla de perfiles que tiene un user_id
-- CREATE POLICY "Vets can view appointments scheduled with them" 
-- ON appointments FOR SELECT 
-- USING (EXISTS (
--     SELECT 1 FROM veterinarian_profiles 
--     WHERE veterinarian_profiles.id = appointments.vet_id 
--     AND veterinarian_profiles.user_id = auth.uid()
-- ));

-- ¡Listo! Una vez ejecutado este script, la funcionalidad de agendamiento estará activa.
