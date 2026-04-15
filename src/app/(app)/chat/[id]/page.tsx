"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { useMessages } from "@/hooks/useChat";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export default function ChatDetail() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const [inputVal, setInputVal] = useState('');
  const [otherUser, setOtherUser] = useState<{ first_name: string; last_name: string; avatar_url: string | null } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Fetch other participant info
  useEffect(() => {
    async function fetchOther() {
      if (!user || !conversationId) return;
      
      const { data } = await supabase
        .from("conversation_participants")
        .select(`
          user:profiles!user_id (first_name, last_name, avatar_url)
        `)
        .eq("conversation_id", conversationId)
        .neq("user_id", user.id)
        .limit(1);
      
      if (data?.[0]?.user) {
        setOtherUser(data[0].user as unknown as { first_name: string; last_name: string; avatar_url: string | null });
      }
    }
    fetchOther();
  }, [conversationId, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputVal.trim()) return;
    try {
      await sendMessage(inputVal);
      setInputVal('');
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-cream h-full flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 bg-forest/10 rounded-full mb-4" />
        <p className="text-sm text-stone font-medium">Cargando conversación...</p>
      </div>
    );
  }

  const otherName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Chat AgroLink";
  const otherInitials = otherUser ? `${otherUser.first_name.charAt(0)}${otherUser.last_name.charAt(0)}` : "?";

  return (
    <div className="bg-cream h-full flex flex-col w-full relative" style={{height: '100dvh'}}>
      <TopNav 
        showBack
        backTo="/chat"
        title={
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {otherUser?.avatar_url ? (
                <img src={otherUser.avatar_url} className="w-full h-full object-cover" alt="Other user" />
              ) : (
                <span>{otherInitials}</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-forest text-sm truncate">{otherName}</p>
              <p className="text-xs text-green-600 font-medium">● En línea</p>
            </div>
          </div>
        }
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-area">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-10">
            <span className="material-symbols-outlined text-[40px] mb-2">forum</span>
            <p className="text-xs font-medium">No hay mensajes todavía. ¡Sé el primero en saludar!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-up`}>
                <div className={`${isMe ? 'bubble-out' : 'bubble-in'} px-4 py-2.5 max-w-[85%] shadow-sm relative group`}>
                  <p className="text-sm leading-relaxed">{m.content}</p>
                  <p className={`text-[9px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                    {format(new Date(m.created_at), "HH:mm")}
                    {isMe && ' ✓✓'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 px-4 py-4 bg-cream border-t border-stone/10 flex items-end gap-3 z-10 pb-safe">
        <button className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 cursor-pointer border-none shadow-sm active:scale-95 transition-all">
          <span className="material-symbols-outlined text-stone text-[20px]">add</span>
        </button>
        <div className="field flex-1 flex items-center px-4 py-2.5 min-h-[48px] bg-white rounded-2xl shadow-sm border border-stone/5">
          <textarea 
            placeholder="Mensaje..." 
            rows={1}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            className="flex-1 bg-transparent text-sm text-forest resize-none leading-relaxed w-full focus:outline-none"
            style={{maxHeight: '120px'}}
          ></textarea>
        </div>
        <button 
          onClick={handleSend} 
          disabled={!inputVal.trim()}
          className="w-11 h-11 rounded-2xl bg-forest flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform cursor-pointer border-none shadow-md disabled:opacity-50 disabled:scale-100"
        >
          <span className="material-symbols-outlined fill-icon text-white text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}
