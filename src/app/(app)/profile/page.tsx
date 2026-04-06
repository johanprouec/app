"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { useState } from "react";

export default function Profile() {
  const router = useRouter();
  const [notif, setNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="flex-shrink-0 relative overflow-hidden" style={{background: 'linear-gradient(180deg,#002d1c 0%,#1a4a32 100%)'}}>
        <div className="pt-14 pb-6 px-5 text-center relative z-10 animate-fade">
          <div className="w-20 h-20 rounded-full bg-amber-light flex items-center justify-center mx-auto font-headline font-bold text-2xl text-forest shadow-editorial">CL</div>
          <h2 className="font-headline font-bold text-xl text-white mt-3">Carlos López</h2>
          <p className="text-green-300/60 text-xs mt-0.5">Ganadero independiente · Bogotá, CO</p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center"><p className="font-headline font-bold text-lg text-white">105</p><p className="text-[9px] text-green-300/50 uppercase tracking-wider">Cabezas</p></div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center"><p className="font-headline font-bold text-lg text-white">4.2ha</p><p className="text-[9px] text-green-300/50 uppercase tracking-wider">Área</p></div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center"><p className="font-headline font-bold text-lg text-white">2 años</p><p className="text-[9px] text-green-300/50 uppercase tracking-wider">En AgroLink</p></div>
          </div>
        </div>
      </div>
      <div className="scroll-area flex-1">
        <div className="px-5 pt-4 pb-6 space-y-4">
          <button className="w-full bg-white rounded-[16px] border border-[rgba(0,45,28,0.07)] p-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-forest shadow-editorial animate-up cursor-pointer hover:bg-forest/5 transition-all">
            <span className="material-symbols-outlined text-[18px]">edit</span> Editar perfil
          </button>
          
          <div className="animate-up d1">
            <p className="text-xs font-bold text-stone uppercase tracking-widest mb-3">Mis Activos</p>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4" onClick={() => router.push('/ganado')}>
                <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center mb-2"><span className="text-xl">🐄</span></div>
                <p className="text-[10px] uppercase font-bold text-stone">Ganado</p>
                <p className="font-headline font-bold text-xl text-forest mt-0.5">105 cab.</p>
                <p className="text-[10px] text-green-600 font-semibold mt-1">+4.2% este mes</p>
              </Card>
              <Card className="p-4" onClick={() => router.push('/tierras')}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 bg-forest-mid"><span className="text-xl">🌾</span></div>
                <p className="text-[10px] uppercase font-bold text-stone">Tierras</p>
                <p className="font-headline font-bold text-xl text-forest mt-0.5">2 fincas</p>
                <p className="text-[10px] text-stone font-medium mt-1">257 Ha totales</p>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden animate-up d2">
            <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-stone uppercase tracking-widest">Cuenta</p>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-cream-dark transition-colors text-left bg-transparent border-none cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-sage-light flex items-center justify-center"><span className="material-symbols-outlined fill-icon text-forest text-[18px]">person</span></div>
              <div className="flex-1"><p className="text-sm font-semibold text-forest">Información personal</p><p className="text-xs text-stone">Nombre, correo, teléfono</p></div>
              <span className="material-symbols-outlined text-stone text-[20px]">chevron_right</span>
            </button>
            <div className="h-px bg-stone/10 mx-4"></div>
            <button onClick={() => router.push('/panel')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-cream-dark transition-colors text-left bg-transparent border-none cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-pale"><span className="material-symbols-outlined fill-icon text-amber text-[18px]">bar_chart</span></div>
              <div className="flex-1"><p className="text-sm font-semibold text-forest">Panel de control</p><p className="text-xs text-stone">Estadísticas y proyecciones</p></div>
              <span className="material-symbols-outlined text-stone text-[20px]">chevron_right</span>
            </button>
            <div className="h-px bg-stone/10 mx-4"></div>
            <button onClick={() => router.push('/appointments')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-cream-dark transition-colors text-left bg-transparent border-none cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sage-light"><span className="material-symbols-outlined fill-icon text-forest text-[18px]">calendar_today</span></div>
              <div className="flex-1"><p className="text-sm font-semibold text-forest">Mis Citas</p><p className="text-xs text-stone">Seguimiento de agendamientos</p></div>
              <span className="material-symbols-outlined text-stone text-[20px]">chevron_right</span>
            </button>
            <div className="h-px bg-stone/10 mx-4"></div>
            <button onClick={() => router.push('/vets/panel')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-cream-dark transition-colors text-left bg-transparent border-none cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-forest text-white"><span className="material-symbols-outlined text-[18px]">medical_services</span></div>
              <div className="flex-1"><p className="text-sm font-semibold text-forest">Panel de Especialista</p><p className="text-xs text-stone">Gestionar consultas y servicios</p></div>
              <span className="material-symbols-outlined text-stone text-[20px]">chevron_right</span>
            </button>
          </Card>

          <Card className="overflow-hidden animate-up d3">
            <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-stone uppercase tracking-widest">Preferencias</p>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-cream-dark flex items-center justify-center"><span className="material-symbols-outlined text-stone text-[18px]">notifications</span></div>
              <div className="flex-1"><p className="text-sm font-semibold text-forest">Notificaciones</p></div>
              <Toggle on={notif} onToggle={() => setNotif(!notif)} />
            </div>
            <div className="h-px bg-stone/10 mx-4"></div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-cream-dark flex items-center justify-center"><span className="material-symbols-outlined text-stone text-[18px]">dark_mode</span></div>
              <div className="flex-1"><p className="text-sm font-semibold text-forest">Modo oscuro</p></div>
              <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
            </div>
          </Card>

          <button onClick={() => router.push('/')} className="w-full bg-[#fff9f9] border border-[#ffdad6] rounded-[16px] p-4 flex items-center justify-center gap-2 text-sm font-semibold text-error animate-up d5 cursor-pointer transition-colors hover:bg-[#ffebee]">
            <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
