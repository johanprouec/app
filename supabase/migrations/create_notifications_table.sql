-- Script para el Centro de Notificaciones de AgroLink
-- 1. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system' CHECK (type IN ('appointment', 'chat', 'system')),
    link TEXT, -- URL relativa (ej: /appointments o /chat/ROOM_ID)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad
-- Cada usuario solo ve y markea sus propias notificaciones
CREATE POLICY "Usuarios pueden ver sus propias alertas" ON notifications 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden marcar sus propias alertas como leídas" ON notifications 
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Permitir inserción del sistema (o via triggers)
CREATE POLICY "Permitir inserción de sistema" ON notifications 
FOR INSERT WITH CHECK (true);

-- 4. Triggers Automáticos

-- A. Notificar al Veterinario cuando alguien agenda una cita
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
DECLARE
    vet_user_id UUID;
BEGIN
    SELECT user_id INTO vet_user_id FROM veterinarian_profiles WHERE id = NEW.vet_id;
    IF vet_user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (vet_user_id, '📅 Nueva solicitud de cita', 'Un ganadero ha solicitado una consulta técnica contigo.', 'appointment', '/vets/panel');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notify_new_appointment
AFTER INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION notify_new_appointment();

-- B. Notificar al Ganadero cuando cambia el estado de su cita
CREATE OR REPLACE FUNCTION notify_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (NEW.user_id, 
            CASE 
                WHEN NEW.status = 'confirmed' THEN '✅ Cita Confirmada'
                WHEN NEW.status = 'completed' THEN '🏁 Consulta Finalizada'
                WHEN NEW.status = 'cancelled' THEN '❌ Cita Cancelada'
                ELSE '📅 Actualización de Cita'
            END, 
            'Tu cita ha sido actualizada al estado: ' || NEW.status, 'appointment', '/appointments');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notify_appointment_status_change
AFTER UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION notify_appointment_status_change();

-- C. Notificar al Receptor cuando hay un mensaje nuevo (basado en chat_rooms)
CREATE OR REPLACE FUNCTION notify_new_chat_message()
RETURNS TRIGGER AS $$
DECLARE
    room_record RECORD;
    recipient_id UUID;
BEGIN
    -- Obtener la sala para saber quién es el otro participante
    SELECT * INTO room_record FROM chat_rooms WHERE id = NEW.room_id;
    
    -- El destinatario es la persona opuesta al remitente
    IF NEW.sender_id = room_record.farmer_id THEN
        -- El remitente es el granjero, buscar el user_id del veterinario
        SELECT user_id INTO recipient_id FROM veterinarian_profiles WHERE id = room_record.vet_id;
    ELSE
        -- El remitente es el vet, el destinatario es el granjero
        recipient_id := room_record.farmer_id;
    END IF;

    IF recipient_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (recipient_id, '💬 Nuevo mensaje', 'Has recibido un nuevo mensaje en el chat.', 'chat', '/chat/' || NEW.room_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notify_new_chat_message
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION notify_new_chat_message();

-- 5. Habilitar Tiempo Real para notificaciones
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
