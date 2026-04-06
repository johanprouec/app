-- Script para el Sistema de Calificación (Reviews) de Veterinarios
-- 1. Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS vet_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_id UUID REFERENCES veterinarian_profiles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE UNIQUE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE vet_reviews ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad
-- Lectura pública para que todos vean las reseñas
CREATE POLICY "Lectura pública de reseñas" ON vet_reviews 
FOR SELECT USING (true);

-- Solo el usuario que tuvo la cita puede crear la reseña
CREATE POLICY "Usuarios pueden crear reseñas de sus citas" ON vet_reviews 
FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
        SELECT 1 FROM appointments 
        WHERE id = appointment_id 
        AND user_id = auth.uid() 
        AND status = 'completed'
    )
);

-- 4. Función y Trigger para actualizar la calificación media del veterinario
CREATE OR REPLACE FUNCTION update_vet_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE veterinarian_profiles
    SET 
        rating = (SELECT AVG(rating) FROM vet_reviews WHERE vet_id = NEW.vet_id),
        total_consultations = (SELECT COUNT(*) FROM appointments WHERE vet_id = NEW.vet_id AND status = 'completed')
    WHERE id = NEW.vet_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_vet_rating
AFTER INSERT ON vet_reviews
FOR EACH ROW EXECUTE FUNCTION update_vet_rating();
