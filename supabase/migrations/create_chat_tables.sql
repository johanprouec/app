-- Script para el sistema de mensajería (Chat) en AgroLink
-- 1. Crear tabla de salas de chat (Contexto)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vet_id UUID REFERENCES veterinarian_profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(farmer_id, vet_id) -- Solo una sala por pareja ganadero-veterinario
);

-- 2. Crear tabla de mensajes individuales
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad para chat_rooms
-- Ambos participantes pueden ver la sala
CREATE POLICY "Participantes pueden ver sus salas" ON chat_rooms 
FOR SELECT USING (
    auth.uid() = farmer_id OR 
    EXISTS (SELECT 1 FROM veterinarian_profiles WHERE id = vet_id AND user_id = auth.uid())
);

-- El ganadero puede crear una sala al contactar
CREATE POLICY "Ganaderos pueden crear salas" ON chat_rooms 
FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- 5. Políticas para chat_messages
-- Solo participantes pueden ver mensajes
CREATE POLICY "Participantes pueden leer mensajes" ON chat_messages 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_rooms WHERE id = room_id AND (farmer_id = auth.uid() OR EXISTS (SELECT 1 FROM veterinarian_profiles WHERE id = vet_id AND user_id = auth.uid())))
);

-- Solo el remitente puede insertar su propio mensaje
CREATE POLICY "Solo remitente puede enviar mensaje" ON chat_messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 6. Habilitar Tiempo Real (Supabase Realtime)
-- Nota: Esto se suele hacer desde el dashboard, pero se puede añadir a la publicación
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
