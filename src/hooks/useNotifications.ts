import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'chat' | 'system';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let channel: RealtimeChannel | undefined;
    let active = true;

    async function initNotifications() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;

      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // 1. Cargar notificaciones iniciales
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (!error && data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
      setLoading(false);

      // 2. Suscribirse a cambios en tiempo real
      const channelId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

      channel = supabase
        .channel(`user-notifications:${user.id}:${channelId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notification;
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new as Notification;
            setNotifications(prev => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));
            // Recalcular unread count de forma simple
            setUnreadCount(prev => updatedNotif.is_read ? Math.max(0, prev - 1) : prev + 1);
          }
        })
        .subscribe();
    }

    initNotifications();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
