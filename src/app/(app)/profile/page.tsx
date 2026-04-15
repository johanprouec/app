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

  if (loading) {
    return (
      <div className="bg-cream h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-forest font-medium animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : "Usuario AgroLink";
  const initials = profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}` : "AG";
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
    const supabaseClient = getSupabase();
    const { error } = await supabaseClient
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
    const supabaseClient = getSupabase();
    const { error } = await supabaseClient
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
    : 1;

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="flex-shrink-0 relative overflow-hidden" style={{background: 'linear-gradient(180deg,#002d1c 0%,#1a4a32 100%)'}}>
        <div className="pt-14 pb-8 px-5 text-center relative z-10 animate-fade">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-amber-light flex items-center justify-center mx-auto font-headline font-bold text-3xl text-forest shadow-[0_8px_32px_rgba(0,45,28,0.3)] border-4 border-white/10 overflow-hidden">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
               ) : initials}
            </div>
            {profile?.is_verified && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-[#002d1c] flex items-center justify-center text-white" title="Verificado">
                <span className="material-symbols-outlined text-base font-bold">check</span>
              </div>
            )}
          </div>
          <h2 className="font-headline font-bold text-2xl text-white mt-4">{displayName}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-green-300/80 text-sm">
              {profile ? `${producerTypeLabels[profile.producer_type || ''] || 'Productor'} · ${profile.location_city || 'Colombia'}` : "Productor"}
            </span>
          </div>
          
          <div className="flex justify-center gap-6 mt-6 bg-white/5 backdrop-blur-md rounded-2xl py-4 mx-4 border border-white/10">
            <div className="text-center">
              <p className="font-headline font-bold text-xl text-white">{livestockCount}</p>
              <p className="text-[9px] text-green-300/50 uppercase tracking-[0.2em]">Ganado</p>
            </div>
            <div className="w-px bg-white/10 h-8 mt-1"></div>
            <div className="text-center">
              <p className="font-headline font-bold text-xl text-white">{cultivatedArea}ha</p>
              <p className="text-[9px] text-green-300/50 uppercase tracking-[0.2em]">Área</p>
            </div>
            <div className="w-px bg-white/10 h-8 mt-1"></div>
            <div className="text-center">
              <p className="font-headline font-bold text-xl text-white">{yearsSinceJoined}</p>
              <p className="text-[9px] text-green-300/50 uppercase tracking-[0.2em]">Años</p>
            </div>
          </div>
        </div>
        {/* Subtle background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-light/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-forest-mid/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      </div>

      <div className="scroll-area flex-1">
        <div className="px-5 pt-6 pb-20 space-y-6">
          {/* Bio Section */}
          {profile?.bio && (
            <div className="animate-up">
               <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-2 ml-1">Sobre mí</p>
               <Card className="p-4 bg-white shadow-sm border-none italic text-forest/80 text-sm leading-relaxed">
                 "{profile.bio}"
               </Card>
            </div>
          )}

          <div className="animate-up d1">
            <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-3 ml-1">Mi Actividad</p>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-white hover:bg-forest/5 transition-all cursor-pointer group" onClick={() => router.push('/ganado')}>
                <div className="w-10 h-10 rounded-2xl bg-sage-light flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><span className="text-xl">🐄</span></div>
                <p className="text-[10px] uppercase font-bold text-stone tracking-wider">Mis Reses</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="font-headline font-bold text-2xl text-forest">{livestockCount}</p>
                  {livestockTrend && livestockTrend > 0 && <span className="text-[10px] text-green-600 font-bold">+{livestockTrend}%</span>}
                </div>
              </Card>
              <Card className="p-4 bg-white hover:bg-forest/5 transition-all cursor-pointer group" onClick={() => router.push('/tierras')}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-amber-pale group-hover:scale-110 transition-transform"><span className="text-xl">🌾</span></div>
                <p className="text-[10px] uppercase font-bold text-stone tracking-wider">Mis Tierras</p>
                <p className="font-headline font-bold text-2xl text-forest mt-1">{cultivatedArea}ha</p>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden animate-up d2 shadow-editorial border-none bg-white">
            <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-stone uppercase tracking-widest">Gestión</p>
            <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-cream/50 transition-colors text-left bg-transparent border-none cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl bg-sage-light flex items-center justify-center group-hover:bg-forest/10 transition-colors"><span className="material-symbols-outlined fill-icon text-forest text-[20px]">person</span></div>
              <div className="flex-1"><p className="text-sm font-bold text-forest">Información de Perfil</p><p className="text-[11px] text-stone">Actualiza tus datos y contacto</p></div>
              <span className="material-symbols-outlined text-stone/40 group-hover:text-forest transition-all">chevron_right</span>
            </button>
            <div className="h-px bg-stone/5 mx-5"></div>
            <button onClick={() => router.push('/panel')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-cream/50 transition-colors text-left bg-transparent border-none cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-pale group-hover:bg-amber/10 transition-colors"><span className="material-symbols-outlined fill-icon text-amber text-[20px]">insights</span></div>
              <div className="flex-1"><p className="text-sm font-bold text-forest">Análisis y Métricas</p><p className="text-[11px] text-stone">Rendimiento de tu operación</p></div>
              <span className="material-symbols-outlined text-stone/40 group-hover:text-forest transition-all">chevron_right</span>
            </button>
            <div className="h-px bg-stone/5 mx-5"></div>
            <button onClick={() => router.push('/appointments')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-cream/50 transition-colors text-left bg-transparent border-none cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-sage-light group-hover:bg-forest/10 transition-colors"><span className="material-symbols-outlined fill-icon text-forest text-[20px]">calendar_month</span></div>
              <div className="flex-1"><p className="text-sm font-bold text-forest">Mis Citas Agendadas</p><p className="text-[11px] text-stone">Control de visitas técnicas</p></div>
              <span className="material-symbols-outlined text-stone/40 group-hover:text-forest transition-all">chevron_right</span>
            </button>
          </Card>

          <Card className="overflow-hidden animate-up d3 shadow-editorial border-none bg-white">
            <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-stone uppercase tracking-widest">Preferencias</p>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-2xl bg-cream-dark flex items-center justify-center"><span className="material-symbols-outlined text-stone text-[20px]">notifications</span></div>
              <div className="flex-1"><p className="text-sm font-bold text-forest">Notificaciones Push</p></div>
              <Toggle on={profile?.notifications_enabled ?? true} onToggle={toggleNotifications} />
            </div>
            <div className="h-px bg-stone/5 mx-5"></div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-2xl bg-cream-dark flex items-center justify-center"><span className="material-symbols-outlined text-stone text-[20px]">dark_mode</span></div>
              <div className="flex-1"><p className="text-sm font-bold text-forest">Modo Noche</p></div>
              <Toggle on={profile?.dark_mode ?? false} onToggle={toggleDarkMode} />
            </div>
          </Card>

          <Card className="overflow-hidden animate-up d3 shadow-editorial border-none bg-white">
            <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-stone uppercase tracking-widest">Cuenta</p>
            <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-cream/50 transition-colors text-left bg-transparent border-none cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl bg-sage-light flex items-center justify-center group-hover:bg-forest/10 transition-colors"><span className="material-symbols-outlined fill-icon text-forest text-[20px]">security</span></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-forest">Seguridad y Privacidad</p>
                <p className="text-[11px] text-stone">Contraseña y datos personales</p>
              </div>
              <span className="material-symbols-outlined text-stone/40 group-hover:text-forest transition-all">chevron_right</span>
            </button>
            <div className="h-px bg-stone/5 mx-5"></div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 transition-colors text-left bg-transparent border-none cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors"><span className="material-symbols-outlined text-red-500 text-[20px]">logout</span></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-500">Cerrar Sesión</p>
                <p className="text-[11px] text-red-400">Desvincular tu cuenta del dispositivo</p>
              </div>
              <span className="material-symbols-outlined text-red-500/40 group-hover:text-red-500 transition-all">chevron_right</span>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
