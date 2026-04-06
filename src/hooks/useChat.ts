import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  farmer_id: string;
  vet_id: string;
  created_at: string;
  updated_at: string;
  vet?: {
    professional_title: string;
    profile_image_url: string;
  };
}

export function useChatRoom(roomId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    // 1. Cargar mensajes iniciales
    async function fetchMessages() {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!error && data) setMessages(data as ChatMessage[]);
      setLoading(false);
    }

    fetchMessages();

    // 2. Suscribirse a nuevos mensajes (Tiempo Real)
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    if (!roomId || !content.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert([
        { room_id: roomId, sender_id: user.id, content: content.trim() }
      ]);

    if (error) throw error;
  };

  return { messages, loading, sendMessage };
}

export async function getOrCreateChatRoom(vetId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión para chatear');

  // 1. Intentar buscar sala existente
  const { data: existing, error: searchError } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('farmer_id', user.id)
    .eq('vet_id', vetId)
    .single();

  if (existing) return existing.id;

  // 2. Si no existe, crear una nueva
  const { data: created, error: createError } = await supabase
    .from('chat_rooms')
    .insert([
      { farmer_id: user.id, vet_id: vetId }
    ])
    .select()
    .single();

  if (createError) throw createError;
  return created.id;
}

export function useChatList() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRooms([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*, vet:veterinarian_profiles(professional_title, profile_image_url)')
        .or(`farmer_id.eq.${user.id},vet_id.in.(select id from veterinarian_profiles where user_id='${user.id}')`)
        .order('updated_at', { ascending: false });

      if (!error && data) setRooms(data as ChatRoom[]);
      setLoading(false);
    }

    fetchRooms();
  }, []);

  return { rooms, loading };
}
