"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Conversation {
  id: string;
  related_listing_type: string | null;
  related_listing_id: string | null;
  created_at: string;
  updated_at: string;
  // Computed from participants
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
  const supabase = getSupabase();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get all conversations the user is part of
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

    // Get conversation details
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds)
      .order("updated_at", { ascending: false });

    if (!convs) { setLoading(false); return; }

    // For each conversation, get the other participant's profile and last message
    const enriched: Conversation[] = [];
    for (const conv of convs) {
      // Get other participant
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select(`
          user_id,
          user:profiles!user_id (id, first_name, last_name, avatar_url)
        `)
        .eq("conversation_id", conv.id)
        .neq("user_id", user.id)
        .limit(1);

      // Get last message
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
  }, [supabase]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = getSupabase();

  // Fetch initial messages
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
  }, [conversationId, supabase]);

  // Subscribe to realtime
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
  }, [conversationId, supabase]);

  const sendMessage = async (content: string, messageType: string = "text") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      message_type: messageType,
    });

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  return { messages, loading, sendMessage };
}

export function useCreateConversation() {
  const supabase = getSupabase();

  const createConversation = async (
    otherUserId: string,
    listingType?: string,
    listingId?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if conversation already exists between these users
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

    // Create new conversation
    const { data: conv } = await supabase
      .from("conversations")
      .insert({
        related_listing_type: listingType || null,
        related_listing_id: listingId || null,
      })
      .select("id")
      .single();

    if (!conv) return null;

    // Add both participants
    await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUserId },
    ]);

    return conv.id;
  };

  return { createConversation };
}
