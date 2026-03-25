"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <TopNav isHome />
      <div className="scroll-area">
        <div className="px-5 pt-5 pb-4 space-y-5">
          {/* Greeting */}
          <div className="animate-up">
            <p className="text-stone text-sm">Buenos días,</p>
            <h2 className="font-headline text-2xl font-bold text-forest">Carlos López 👋</h2>
          </div>

          {/* Weather hero */}
          <div className="animate-up d1 rounded-2xl overflow-hidden shadow-editorial" style={{background:'linear-gradient(135deg,#002d1c 0%,#1a4a32 100%)'}}>
            <div className="p-5 flex items-start justify-between">
              <div>
                <p className="text-green-300/70 text-xs font-semibold uppercase tracking-wider mb-1">Clima · Bogotá, CO</p>
                <p className="font-headline text-5xl font-bold text-white">24°C</p>
                <p className="text-green-300/60 text-sm mt-1">Parcialmente nublado</p>
                <div className="flex gap-4 mt-3">
                  <span className="flex items-center gap-1 text-xs text-green-300/60"><span className="material-symbols-outlined fill-icon text-[13px]">water_drop</span>72%</span>
                  <span className="flex items-center gap-1 text-xs text-green-300/60"><span className="material-symbols-outlined text-[13px]">air</span>12 km/h</span>
                  <span className="flex items-center gap-1 text-xs text-green-300/60"><span className="material-symbols-outlined fill-icon text-[13px]">wb_sunny</span>UV 6</span>
                </div>
              </div>
              <span className="material-symbols-outlined fill-icon text-[80px] text-green-300/30">partly_cloudy_day</span>
            </div>
          </div>

          {/* Quick access */}
          <div className="animate-up d2">
            <p className="text-xs font-bold uppercase tracking-widest text-stone mb-3">Acceso rápido</p>
            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => router.push('/ganado')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent">
                <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center shadow-editorial transition-transform hover:-translate-y-1">
                  <span className="text-2xl">🐄</span>
                </div>
                <span className="text-[10px] font-semibold text-forest text-center leading-tight">Ganado</span>
              </button>
              <button onClick={() => router.push('/tierras')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-editorial bg-forest-mid transition-transform hover:-translate-y-1">
                  <span className="text-2xl">🌾</span>
                </div>
                <span className="text-[10px] font-semibold text-forest text-center leading-tight">Tierras</span>
              </button>
              <button onClick={() => router.push('/vets')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-editorial bg-forest-light transition-transform hover:-translate-y-1">
                  <span className="text-2xl">🩺</span>
                </div>
                <span className="text-[10px] font-semibold text-forest text-center leading-tight">Veterinarios</span>
              </button>
              <button onClick={() => router.push('/panel')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-editorial bg-amber transition-transform hover:-translate-y-1">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="text-[10px] font-semibold text-forest text-center leading-tight">Panel</span>
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="animate-up d2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-stone">Resumen general</p>
              <button onClick={() => router.push('/panel')} className="text-amber text-xs font-semibold cursor-pointer border-none bg-transparent hover:brightness-90 transition-all">Ver panel</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4" onClick={() => router.push('/panel')}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone">Cabezas de ganado</p>
                <p className="font-headline text-3xl font-bold text-forest mt-1">105</p>
                <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-0.5"><span className="material-symbols-outlined text-[13px]">arrow_upward</span>+4.2%</p>
              </Card>
              <Card className="p-4" onClick={() => router.push('/panel')}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone">Área cultivada</p>
                <p className="font-headline text-3xl font-bold text-forest mt-1">4.2ha</p>
                <p className="text-xs text-stone font-medium mt-1">3 cultivos activos</p>
              </Card>
              <Card className="p-4" onClick={() => router.push('/panel')}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone">Ventas mes</p>
                <p className="font-headline text-3xl font-bold text-forest mt-1">$45.8M</p>
                <p className="text-xs text-amber font-semibold mt-1">Meta: $60M</p>
              </Card>
              <Card className="p-4" onClick={() => router.push('/notif')}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone">Alertas</p>
                <p className="font-headline text-3xl font-bold text-error mt-1">2</p>
                <p className="text-xs text-error font-medium mt-1">Requieren acción</p>
              </Card>
            </div>
          </div>

          {/* Recent activity */}
          <div className="animate-up d3">
            <p className="text-xs font-bold uppercase tracking-widest text-stone mb-3">Actividad reciente</p>
            <div className="space-y-2">
              <Card className="p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-error-light flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined fill-icon text-error text-[18px]">bug_report</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-forest">Alerta fitosanitaria</p>
                  <p className="text-xs text-stone">Frijol Cargamanto · Lote C</p>
                </div>
                <span className="text-[10px] text-stone">2h</span>
              </Card>
              <Card className="p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-pale">
                  <span className="material-symbols-outlined fill-icon text-amber text-[18px]">trending_up</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-forest">Precio Aguacate +12.4%</p>
                  <p className="text-xs text-stone">Corabastos, Bogotá</p>
                </div>
                <span className="text-[10px] text-stone">4h</span>
              </Card>
              <Card className="p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined fill-icon text-forest text-[18px]">vaccines</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-forest">Vacunación programada</p>
                  <p className="text-xs text-stone">Lote B · Ciclo Aftosa · 48h</p>
                </div>
                <span className="text-[10px] text-stone">1d</span>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
