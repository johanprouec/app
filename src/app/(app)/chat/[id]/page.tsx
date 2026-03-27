"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { useMessages } from "@/hooks/useChat";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase/client";

export default function ChatDetail() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const [inputVal, setInputVal] = useState('');
  const [otherUser, setOtherUser] = useState<{ first_name: string; last_name: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Fetch other participant info
  useEffect(() => {
    async function fetchOther() {
      if (!user) return;
      const supabase = getSupabase();
      const { data } = await supabase
        .from("conversation_participants")
        .select(`
          user:profiles!user_id (first_name, last_name)
        `)
        .eq("conversation_id", conversationId)
        .neq("user_id", user.id)
        .limit(1);
      
      if (data?.[0]?.user) {
        setOtherUser(data[0].user as unknown as { first_name: string; last_name: string });
      }
    }
    fetchOther();
  }, [conversationId, user]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const otherName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Chat";
  const otherInitials = otherUser ? `${otherUser.first_name.charAt(0)}${otherUser.last_name.charAt(0)}` : "?";

  return (
    <div className="bg-cream h-full flex flex-col w-full relative" style={{height: '100dvh'}}>
      <TopNav 
        showBack
        backTo="/chat"
        title={
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold text-sm">{otherInitials}</div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-forest text-sm">{otherName}</p>
              <p className="text-xs text-green-600 font-medium">● En línea</p>
            </div>
          </div>
        }
        rightAction={
          <>
            <button className="w-9 h-9 rounded-full hover:bg-cream-dark flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent">
              <span className="material-symbols-outlined text-stone text-[20px]">call</span>
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-cream-dark flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent">
              <span className="material-symbols-outlined text-stone text-[20px]">more_vert</span>
            </button>
          </>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-area">
        {loading ? (
          <div className="text-center text-stone text-sm py-8">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-stone text-sm py-8">Sin mensajes aún. ¡Envía el primero!</div>
        ) : (
          messages.map(m => {
            const isMe = m.sender_id === user?.id;
            const time = new Date(m.created_at);
            const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
            return (
              <div key={m.id} className={`flex ${!isMe ? 'justify-end' : 'justify-start'} animate-up`}>
                <div className={`${!isMe ? 'bubble-out' : 'bubble-in'} px-4 py-2.5 max-w-[80%]`}>
                  <p className="text-sm">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${!isMe ? 'text-green-300/60 text-right' : 'text-stone'}`}>
                    {timeStr}{!isMe ? ' ✓✓' : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 px-4 py-3 bg-cream border-t border-stone/10 flex items-end gap-3 z-10 pb-safe">
        <button className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center flex-shrink-0 cursor-pointer border-none">
          <span className="material-symbols-outlined text-stone text-[20px]">attach_file</span>
        </button>
        <div className="field flex-1 flex items-center px-4 py-2 min-h-[44px]">
          <textarea 
            placeholder="Escribe un mensaje..." 
            rows={1}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            className="flex-1 bg-transparent text-sm text-forest resize-none leading-relaxed w-full"
            style={{maxHeight: '100px'}}
          ></textarea>
        </div>
        <button onClick={handleSend} className="w-10 h-10 rounded-full bg-forest flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform cursor-pointer border-none">
          <span className="material-symbols-outlined fill-icon text-white text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}
