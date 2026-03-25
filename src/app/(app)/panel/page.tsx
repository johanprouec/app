"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { showToast } from "@/components/ui/ToastProvider";

export default function Panel() {
  const router = useRouter();

  return (
    <>
      <TopNav 
        showBack
        backTo="/home"
        centered
        title="Panel de Control" 
        subtitle="Datos en tiempo real · Proyecciones"
        rightAction={
          <Button variant="outline" className="!py-1.5 !px-3 !text-xs" onClick={() => showToast('Exportando...','info')}>
            <span className="material-symbols-outlined text-[14px]">download</span> Exportar
          </Button>
        } 
      />
      <div className="scroll-area">
        <div className="px-5 pt-4 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 animate-up">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-cream-dark flex items-center justify-center">
                  <span className="material-symbols-outlined fill-icon text-forest text-[18px]">inventory_2</span>
                </div>
                <span className="text-[11px] font-bold py-0.5 px-2 rounded-[10px] bg-sage-light text-forest">+4.2%</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone">Población total</p>
              <p className="font-headline text-[32px] font-bold text-forest leading-[1.1] mt-1">105 <span className="text-sm font-normal text-stone">cabezas</span></p>
              <ProgressBar progress={70} className="mt-2" />
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-pale">
                  <span className="material-symbols-outlined fill-icon text-amber text-[18px]">payments</span>
                </div>
                <span className="text-[11px] font-bold py-0.5 px-2 rounded-[10px] bg-amber-pale text-amber">$14.2M ↑</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone">Ventas mensuales</p>
              <p className="font-headline text-[32px] font-bold text-forest leading-[1.1] mt-1">$45.8M</p>
              <p className="text-[10px] text-stone mt-1">Meta: $60M</p>
              <ProgressBar progress={76} colorClass="bg-amber" className="mt-1" />
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-pale">
                  <span className="material-symbols-outlined fill-icon text-amber text-[18px]">health_and_safety</span>
                </div>
                <span className="text-[11px] font-bold py-0.5 px-2 rounded-[10px] bg-error-light text-error">⚠ Alerta</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone">Vitalidad hato</p>
              <p className="font-headline text-[32px] font-bold text-forest leading-[1.1] mt-1">94%</p>
              <ProgressBar progress={94} className="mt-2" />
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-cream-dark flex items-center justify-center">
                  <span className="material-symbols-outlined fill-icon text-forest text-[18px]">monitor_weight</span>
                </div>
                <span className="text-[11px] font-bold py-0.5 px-2 rounded-[10px] bg-sage-light text-forest">↑ Positivo</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone">Ganancia de peso</p>
              <p className="font-headline text-[32px] font-bold text-forest leading-[1.1] mt-1">1.2<span className="text-sm font-normal text-stone"> kg/día</span></p>
              <p className="text-[10px] text-green-600 font-bold mt-1">Tendencia positiva</p>
            </Card>
          </div>

          <Card className="p-4 animate-up d2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-forest">Proyección de crecimiento — 2026</h3>
            </div>
            <div className="flex items-end gap-2 h-[100px]">
              <div className="flex flex-col items-center gap-1 flex-1"><div className="bar w-full rounded-t-md" style={{height:'50%'}}></div><p className="text-[9px] text-stone">ENE</p></div>
              <div className="flex flex-col items-center gap-1 flex-1"><div className="bar w-full rounded-t-md" style={{height:'62%'}}></div><p className="text-[9px] text-stone">FEB</p></div>
              <div className="flex flex-col items-center gap-1 flex-1"><div className="bar w-full rounded-t-md" style={{height:'70%'}}></div><p className="text-[9px] text-stone">MAR</p></div>
              <div className="flex flex-col items-center gap-1 flex-1"><div className="bar w-full rounded-t-md" style={{height:'66%'}}></div><p className="text-[9px] text-stone">ABR</p></div>
              <div className="flex flex-col items-center gap-1 flex-1"><div className="bar w-full rounded-t-md" style={{height:'80%'}}></div><p className="text-[9px] text-stone">MAY</p></div>
              <div className="flex flex-col items-center gap-1 flex-1"><div className="bar current bg-forest w-full rounded-t-md" style={{height:'100%'}}></div><p className="text-[9px] text-stone font-bold">JUN</p></div>
            </div>
          </Card>

          <Card className="p-4 animate-up d3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-forest">Alertas Críticas</h3>
              <span className="bg-error-light text-error tracking-wider uppercase text-[11px] font-bold py-1 px-3 rounded-full">2 activas</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#fff9f0]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-pale">
                  <span className="material-symbols-outlined fill-icon text-amber text-[18px]">vaccines</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-forest">Ciclo Aftosa</p>
                  <p className="text-xs text-stone">Vence en 48h · Lote B</p>
                </div>
                <button className="text-amber text-xs font-bold border-none bg-transparent cursor-pointer">Ver</button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#fff9f0]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-pale">
                  <span className="material-symbols-outlined fill-icon text-amber text-[18px]">water_drop</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-forest">Baja Humedad</p>
                  <p className="text-xs text-stone">Potrero Norte · Verificar Riego</p>
                </div>
                <button className="text-amber text-xs font-bold border-none bg-transparent cursor-pointer">Ver</button>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-3 !text-sm !py-2">Ver historial completo</Button>
          </Card>

          <Button variant="amber" className="w-full justify-center animate-up d4" onClick={() => showToast('Creando tarea...','info')}>
            <span className="material-symbols-outlined text-[16px]">add_task</span> Nueva Tarea
          </Button>
        </div>
      </div>
    </>
  );
}
