"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";
import { useConversations } from "@/hooks/useChat";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

export default function ChatList() {
  const router = useRouter();
  const { conversations, loading } = useConversations();

  const getTimeStr = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Ayer";
    return format(date, "d MMM", { locale: es });
  };

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <TopNav 
        showBack
        backTo="/home"
        title="Mensajes" 
        rightAction={
          <button className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center cursor-pointer border-none shadow-md active:scale-95 transition-all" onClick={() => showToast('Nueva conversación','info')}>
            <span className="material-symbols-outlined text-white text-[20px]">edit_square</span>
          </button>
        } 
      />
      <div className="scroll-area flex-1">
        <div className="px-5 pt-4 pb-20 space-y-3">
          <div className="field flex items-center gap-3 px-4 h-12 animate-up bg-white rounded-2xl shadow-sm border border-stone/5">
            <span className="material-symbols-outlined text-stone text-[20px]">search</span>
            <input type="text" placeholder="Buscar conversación..." className="flex-1 bg-transparent text-sm text-forest w-full focus:outline-none"/>
          </div>

          {loading ? (
             [1, 2, 3].map(i => <div key={i} className="h-20 bg-white/50 animate-pulse rounded-[28px]" />)
          ) : conversations.length === 0 ? (
            <div className="py-20 text-center opacity-30 px-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-[60px] mb-4">forum_off</span>
              <p className="text-sm font-medium">Aún no tienes conversaciones activas.</p>
              <p className="text-xs mt-2 leading-relaxed">Contacta a un vendedor o veterinario para iniciar un chat privado.</p>
            </div>
          ) : (
            conversations.map((conv, i) => {
              const other = conv.other_user;
              const initials = other
                ? `${other.first_name.charAt(0)}${other.last_name.charAt(0)}`
                : "?";
              const fullName = other
                ? `${other.first_name} ${other.last_name}`
                : "Usuario AgroLink";
                
              return (
                <Card 
                  key={conv.id} 
                  className={`p-4 flex items-center gap-4 cursor-pointer active:bg-cream-dark animate-up d${(i%3)+1} bg-white shadow-editorial border-none rounded-[28px] group transition-all`} 
                  onClick={() => router.push(`/chat/${conv.id}`)}
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center text-white font-bold text-lg border border-forest/5 overflow-hidden">
                      {other?.avatar_url ? (
                        <img src={other.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm ring-1 ring-green-500/20"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-forest text-sm truncate">{fullName}</p>
                      <p className="text-[10px] text-stone font-bold uppercase tracking-widest">{getTimeStr(conv.last_message_time)}</p>
                    </div>
                    <p className="text-xs text-stone truncate mt-1 leading-relaxed opacity-70">
                      {conv.last_message || "Empieza la conversación..."}
                    </p>
                  </div>
                  {((conv.unread_count ?? 0) > 0) ? (
                    <div className="w-5 h-5 rounded-full bg-amber flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {conv.unread_count}
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-stone/40 group-hover:text-forest transition-colors">chevron_right</span>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
