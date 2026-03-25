"use client";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";

export default function Notifications() {
  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <TopNav 
        showBack
        backTo="/home"
        title="Notificaciones" 
        rightAction={<button className="text-amber text-xs font-semibold bg-transparent border-none cursor-pointer">Leer todas</button>}
      />
      <div className="scroll-area flex-1">
        <div className="px-5 pt-4 pb-4 space-y-2">
          <p className="text-xs font-bold text-stone uppercase tracking-widest mb-3">Hoy</p>
          <Card className="p-4 flex gap-3 animate-up d1 border-l-[3px] !border-l-error">
            <div className="w-10 h-10 rounded-full bg-error-light flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined fill-icon text-error text-[20px]">bug_report</span></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-forest">⚠️ Alerta fitosanitaria</p>
              <p className="text-xs text-stone mt-0.5 leading-relaxed">Posible presencia de áfidos en Frijol Cargamanto (Lote C).</p>
              <p className="text-xs text-stone mt-1.5">Hace 2 horas</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-error flex-shrink-0 mt-1.5"></div>
          </Card>
          <Card className="p-4 flex gap-3 animate-up d2 border-l-[3px] !border-l-amber">
            <div className="w-10 h-10 rounded-full bg-amber-pale flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined fill-icon text-amber text-[20px]">trending_up</span></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-forest">📈 Aguacate Hass +12.4%</p>
              <p className="text-xs text-stone mt-0.5">Buena oportunidad de venta en Corabastos.</p>
              <p className="text-xs text-stone mt-1.5">Hace 4 horas</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-amber flex-shrink-0 mt-1.5"></div>
          </Card>
          
          <p className="text-xs font-bold text-stone uppercase tracking-widest mt-5 mb-3">Ayer</p>
          <Card className="p-4 flex gap-3 animate-up d3">
            <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined fill-icon text-forest text-[20px]">water_drop</span></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-forest">💧 Riego completado</p>
              <p className="text-xs text-stone mt-0.5">Lote A (Maíz). Próximo ciclo en 3 días.</p>
              <p className="text-xs text-stone mt-1.5">Ayer, 6:30 AM</p>
            </div>
          </Card>
          <Card className="p-4 flex gap-3 animate-up d4">
            <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined fill-icon text-stone text-[20px]">chat</span></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-forest">💬 Nuevo mensaje</p>
              <p className="text-xs text-stone mt-0.5">José Rincón te escribió sobre el lote Angus.</p>
              <p className="text-xs text-stone mt-1.5">Ayer, 3:15 PM</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
