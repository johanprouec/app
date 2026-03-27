"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";
import { useConversations } from "@/hooks/useChat";

export default function ChatList() {
  const router = useRouter();
  const { conversations, loading } = useConversations();

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      const h = new Date(dateStr).getHours();
      const m = new Date(dateStr).getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    if (hours < 48) return "Ayer";
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <TopNav 
        showBack
        backTo="/home"
        title="Mensajes" 
        rightAction={
          <button className="w-9 h-9 rounded-full bg-forest flex items-center justify-center cursor-pointer border-none" onClick={() => showToast('Nuevo chat','info')}>
            <span className="material-symbols-outlined text-white text-[18px]">edit_square</span>
          </button>
        } 
      />
      <div className="scroll-area flex-1">
        <div className="px-5 pt-4 pb-4 space-y-3">
          <div className="field flex items-center gap-3 px-4 h-11 animate-up">
            <span className="material-symbols-outlined text-stone text-[20px]">search</span>
            <input type="text" placeholder="Buscar conversación..." className="flex-1 bg-transparent text-sm text-forest w-full"/>
          </div>
          {loading ? (
            <Card className="p-8 text-center text-stone animate-up d1">Cargando conversaciones...</Card>
          ) : conversations.length === 0 ? (
            <Card className="p-8 text-center text-stone animate-up d1">Sin conversaciones aún</Card>
          ) : (
            conversations.map((conv, i) => {
              const other = conv.other_user;
              const initials = other
                ? `${other.first_name.charAt(0)}${other.last_name.charAt(0)}`
                : "?";
              const fullName = other
                ? `${other.first_name} ${other.last_name}`
                : "Usuario";

              return (
                <Card
                  key={conv.id}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer active:bg-cream-dark animate-up d${Math.min(i + 1, 5)}`}
                  onClick={() => router.push(`/chat/${conv.id}`)}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center text-white font-bold">
                      {initials}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-forest text-sm">{fullName}</p>
                      <p className="text-xs text-stone">{timeAgo(conv.last_message_time)}</p>
                    </div>
                    <p className="text-xs text-stone truncate mt-0.5">{conv.last_message || "Sin mensajes"}</p>
                  </div>
                  {(conv.unread_count ?? 0) > 0 && (
                    <div className="w-5 h-5 rounded-full bg-amber flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {conv.unread_count}
                    </div>
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
