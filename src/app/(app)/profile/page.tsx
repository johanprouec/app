"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDashboardMetrics } from "@/hooks/useDashboard";
import { showToast } from "@/components/ui/ToastProvider";
import { getSupabase } from "@/lib/supabase/client";

export default function Profile() {
  const router = useRouter();
  const { profile, signOut, refreshProfile, loading } = useAuth();
  const { metrics } = useDashboardMetrics();

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : "Usuario";
  const initials = profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}` : "U";
  const livestockCount = metrics.livestock_count?.value ?? 0;
  const cultivatedArea = metrics.cultivated_area?.value ?? 0;
  const livestockTrend = metrics.livestock_count?.trend_pct;

  const producerTypeLabels: Record<string, string> = {
    ganadero_independiente: "Ganadero independiente",
    agricultor_independiente: "Agricultor independiente",
    empresa_agropecuaria: "Empresa agropecuaria",
    cooperativa: "Cooperativa",
  };

  const toggleNotifications = async () => {
    if (!profile) return;
    const supabase = getSupabase();
    const { error } = await supabase
      .from("profiles")
      .update({ notifications_enabled: !profile.notifications_enabled })
      .eq("id", profile.id);
    if (!error) {
      await refreshProfile();
      showToast(profile.notifications_enabled ? "Notificaciones desactivadas" : "Notificaciones activadas", "info");
    }
  };

  const toggleDarkMode = async () => {
    if (!profile) return;
    const supabase = getSupabase();
    const { error } = await supabase
      .from("profiles")
      .update({ dark_mode: !profile.dark_mode })
      .eq("id", profile.id);
    if (!error) {
      await refreshProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const yearsSinceJoined = profile 
    ? Math.max(1, Math.round((Date.now() - new Date(profile.created_at).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : 0;

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="flex-shrink-0 relative overflow-hidden" style={{background: 'linear-gradient(180deg,#002d1c 0%,#1a4a32 100%)'}}>
        <div className="pt-14 pb-6 px-5 text-center relative z-10 animate-fade">
          <div className="w-20 h-20 rounded-full bg-amber-light flex items-center justify-center mx-auto font-headline font-bold text-2xl text-forest shadow-editorial">
            {loading ? "..." : initials}
          </div>
          <h2 className="font-headline font-bold text-xl text-white mt-3">{loading ? "Cargando..." : displayName}</h2>
          <p className="text-green-300/60 text-xs mt-0.5">
            {profile ? `${producerTypeLabels[profile.producer_type || ''] || 'Productor'} · ${profile.location_city || 'Colombia'}` : "..."}
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center"><p className="font-headline font-bold text-lg text-white">{livestockCount}</p><p className="text-[9px] text-green-300/50 uppercase tracking-wider">Cabezas</p></div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center"><p className="font-headline font-bold text-lg text-white">{cultivatedArea}ha</p><p className="text-[9px] text-green-300/50 uppercase tracking-wider">Área</p></div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center"><p className="font-headline font-bold text-lg text-white">{yearsSinceJoined} {yearsSinceJoined === 1 ? 'año' : 'años'}</p><p className="text-[9px] text-green-300/50 uppercase tracking-wider">En AgroLink</p></div>
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
                <p className="font-headline font-bold text-xl text-forest mt-0.5">{livestockCount} cab.</p>
                {livestockTrend && livestockTrend > 0 && <p className="text-[10px] text-green-600 font-semibold mt-1">+{livestockTrend}% este mes</p>}
              </Card>
              <Card className="p-4" onClick={() => router.push('/tierras')}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 bg-forest-mid"><span className="text-xl">🌾</span></div>
                <p className="text-[10px] uppercase font-bold text-stone">Tierras</p>
                <p className="font-headline font-bold text-xl text-forest mt-0.5">{cultivatedArea}ha</p>
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
          </Card>

          <Card className="overflow-hidden animate-up d3">
            <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-stone uppercase tracking-widest">Preferencias</p>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-cream-dark flex items-center justify-center"><span className="material-symbols-outlined text-stone text-[18px]">notifications</span></div>
              <div className="flex-1"><p className="text-sm font-semibold text-forest">Notificaciones</p></div>
              <Toggle on={profile?.notifications_enabled ?? true} onToggle={toggleNotifications} />
            </div>
            <div className="h-px bg-stone/10 mx-4"></div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-cream-dark flex items-center justify-center"><span className="material-symbols-outlined text-stone text-[18px]">dark_mode</span></div>
              <div className="flex-1"><p className="text-sm font-semibold text-forest">Modo oscuro</p></div>
              <Toggle on={profile?.dark_mode ?? false} onToggle={toggleDarkMode} />
            </div>
          </Card>

          <button onClick={handleSignOut} className="w-full bg-[#fff9f9] border border-[#ffdad6] rounded-[16px] p-4 flex items-center justify-center gap-2 text-sm font-semibold text-error animate-up d5 cursor-pointer transition-colors hover:bg-[#ffebee]">
            <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
