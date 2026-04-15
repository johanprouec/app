"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// -- LEGACY VET-SPECIFIC CHAT MODELS (Used by Vets UI) --

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

  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('farmer_id', user.id)
    .eq('vet_id', vetId)
    .single();

  if (existing) return existing.id;

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


// -- NEW GENERIC CONVERSATION MODELS (From Feature Branch) --

export interface Conversation {
  id: string;
  related_listing_type: string | null;
  related_listing_id: string | null;
  created_at: string;
  updated_at: string;
  other_user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, unread_count")
      .eq("user_id", user.id);

    if (!participations || participations.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convIds = participations.map(p => p.conversation_id);

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds)
      .order("updated_at", { ascending: false });

    if (!convs) { setLoading(false); return; }

    const enriched: Conversation[] = [];
    for (const conv of convs) {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select(`
          user_id,
          user:profiles!user_id (id, first_name, last_name, avatar_url)
        `)
        .eq("conversation_id", conv.id)
        .neq("user_id", user.id)
        .limit(1);

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const participation = participations.find(p => p.conversation_id === conv.id);

      enriched.push({
        ...conv,
        other_user: participants?.[0]?.user as unknown as Conversation["other_user"],
        last_message: lastMsg?.[0]?.content,
        last_message_time: lastMsg?.[0]?.created_at,
        unread_count: participation?.unread_count || 0,
      });
    }

    setConversations(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages((data as Message[]) || []);
      setLoading(false);
    }
    fetch();
  }, [conversationId]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId]);

  const sendMessage = async (content: string, messageType: string = "text") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      message_type: messageType,
    });

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  return { messages, loading, sendMessage };
}

export function useCreateConversation() {
  const createConversation = async (
    otherUserId: string,
    listingType?: string,
    listingId?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check existing
    const { data: existingParticipations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (existingParticipations) {
      for (const p of existingParticipations) {
        const { data: otherPart } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("conversation_id", p.conversation_id)
          .eq("user_id", otherUserId)
          .single();

        if (otherPart) {
          return otherPart.conversation_id;
        }
      }
    }

    // Create new
    const { data: conv } = await supabase
      .from("conversations")
      .insert({
        related_listing_type: listingType || null,
        related_listing_id: listingId || null,
      })
      .select("id")
      .single();

    if (!conv) return null;

    await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUserId },
    ]);

    return conv.id;
  };

  return { createConversation };
}
