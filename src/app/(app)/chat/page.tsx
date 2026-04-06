"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";
import { useChatList } from "@/hooks/useChat";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ChatList() {
  const router = useRouter();
  const { rooms, loading } = useChatList();

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
          ) : rooms.length === 0 ? (
            <div className="py-20 text-center opacity-30 px-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-[60px] mb-4">forum_off</span>
              <p className="text-sm font-medium">Aún no tienes conversaciones activas.</p>
              <p className="text-xs mt-2 leading-relaxed">Contacta a un veterinario desde su perfil para iniciar un chat privado.</p>
            </div>
          ) : (
            rooms.map((room, i) => (
              <Card 
                key={room.id} 
                className={`p-4 flex items-center gap-4 cursor-pointer active:bg-cream-dark animate-up d${(i%3)+1} bg-white shadow-editorial border-none rounded-[28px] group transition-all`} 
                onClick={() => router.push(`/chat/${room.id}`)}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-forest-mid/10 flex items-center justify-center text-forest font-bold text-lg border border-forest/5 overflow-hidden">
                    {room.vet?.profile_image_url ? (
                      <img src={room.vet.profile_image_url} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <span className="material-symbols-outlined text-[24px]">person</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm ring-1 ring-green-500/20"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-forest text-sm truncate">{room.vet?.professional_title || "Especialista AgroLink"}</p>
                    <p className="text-[10px] text-stone font-bold uppercase tracking-widest">{format(new Date(room.updated_at), "HH:mm", { locale: es })}</p>
                  </div>
                  <p className="text-xs text-stone truncate mt-1 leading-relaxed opacity-70">
                    Pulsa para ver el historial de mensajes...
                  </p>
                </div>
                <span className="material-symbols-outlined text-stone/40 group-hover:text-forest transition-colors">chevron_right</span>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
