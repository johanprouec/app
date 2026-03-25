"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";

export default function ChatList() {
  const router = useRouter();

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
          <Card className="p-3.5 flex items-center gap-3 cursor-pointer active:bg-cream-dark animate-up d1" onClick={() => router.push('/chat/1')}>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center text-white font-bold">JR</div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between"><p className="font-semibold text-forest text-sm">José Rincón</p><p className="text-xs text-stone">10:32</p></div>
              <p className="text-xs text-stone truncate mt-0.5">¿Le interesa el lote de 18 Angus que tengo...?</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-amber flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">2</div>
          </Card>
          <Card className="p-3.5 flex items-center gap-3 cursor-pointer active:bg-cream-dark animate-up d2" onClick={() => router.push('/chat/2')}>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-amber-light flex items-center justify-center font-bold text-forest w-12 h-12 flex-shrink-0">MR</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between"><p className="font-semibold text-forest text-sm">María Reyes</p><p className="text-xs text-stone">Ayer</p></div>
              <p className="text-xs text-stone truncate mt-0.5">La Finca La Esperanza tiene escritura libre, podemos...</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
