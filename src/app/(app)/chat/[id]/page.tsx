"use client";
import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { useChatRoom } from "@/hooks/useChat";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export default function ChatDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: roomId } = use(params);
  const { messages, loading, sendMessage } = useChatRoom(roomId);
  const [inputVal, setInputVal] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

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

  return (
    <div className="bg-cream h-full flex flex-col w-full relative" style={{height: '100dvh'}}>
      <TopNav 
        showBack
        backTo="/chat"
        title={
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center text-white font-bold text-sm">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-forest text-sm">Chat AgroLink</p>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">● En línea</p>
            </div>
          </div>
        }
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-area">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-10">
            <span className="material-symbols-outlined text-[40px] mb-2">forum</span>
            <p className="text-xs font-medium">No hay mensajes todavía. ¡Sé el primero en saludar!</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'} animate-up`}>
            <div className={`${m.sender_id === userId ? 'bubble-out' : 'bubble-in'} px-4 py-2.5 max-w-[85%] shadow-sm relative group`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
              <p className={`text-[9px] mt-1 opacity-60 ${m.sender_id === userId ? 'text-right' : 'text-left'}`}>
                {format(new Date(m.created_at), "HH:mm")}
              </p>
            </div>
          </div>
        ))}
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
