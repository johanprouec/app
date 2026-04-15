"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDashboardMetrics } from "@/hooks/useDashboard";
import { useNotifications } from "@/hooks/useNotifications";

export default function Home() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  const { notifications, loading: notifLoading } = useNotifications();

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : "Usuario";
  const livestockCount = metrics.livestock_count?.value ?? 0;
  const livestockTrend = metrics.livestock_count?.trend_pct ?? 0;
  const cultivatedArea = metrics.cultivated_area?.value ?? 0;
  const monthlySales = metrics.monthly_sales?.value ?? 0;
  const alertCount = notifications.filter(n => !n.is_read && n.severity === 'error').length;
  const recentNotifs = notifications.slice(0, 3);

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const getIconForType = (type: string) => {
    const map: Record<string, { icon: string; bg: string; color: string }> = {
      alert_phytosanitary: { icon: "bug_report", bg: "bg-error-light", color: "text-error" },
      price_change: { icon: "trending_up", bg: "bg-amber-pale", color: "text-amber" },
      vaccination: { icon: "vaccines", bg: "bg-sage-light", color: "text-forest" },
      irrigation: { icon: "water_drop", bg: "bg-sage-light", color: "text-forest" },
      chat: { icon: "chat", bg: "bg-sage-light", color: "text-forest" },
      system: { icon: "info", bg: "bg-cream-dark", color: "text-stone" },
    };
    return map[type] || map.system;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Ahora";
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const isLoading = authLoading || metricsLoading || notifLoading;

  return (
    <>
      <TopNav isHome />
      <div className="scroll-area flex-1">
        <div className="px-5 pt-5 pb-24 space-y-5">
          {/* Greeting */}
          <div className="animate-up">
            <p className="text-stone text-sm">Buenos días,</p>
            <h2 className="font-headline text-2xl font-bold text-forest">{isLoading ? "Cargando..." : `${displayName} 👋`}</h2>
          </div>

          {/* Weather hero */}
          <div className="animate-up d1 rounded-2xl overflow-hidden shadow-editorial" style={{background:'linear-gradient(135deg,#002d1c 0%,#1a4a32 100%)'}}>
            <div className="p-5 flex items-start justify-between">
              <div>
                <p className="text-green-300/70 text-xs font-semibold uppercase tracking-wider mb-1">Clima · {profile?.location_city || 'Colombia'}</p>
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
            <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar" style={{ scrollbarWidth: "none" }}>
              <button onClick={() => router.push('/ganado')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent min-w-[64px]">
                <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center shadow-editorial transition-transform hover:-translate-y-1 shrink-0">
                  <span className="text-2xl">🐄</span>
                </div>
                <span className="text-[10px] font-semibold text-forest text-center leading-tight">Ganado</span>
              </button>
              <button onClick={() => router.push('/agricultura')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent min-w-[64px]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-editorial bg-error-light transition-transform hover:-translate-y-1 shrink-0">
                  <span className="text-2xl">🍎</span>
                </div>
                <span className="text-[10px] font-semibold text-forest text-center leading-tight">Agricul.</span>
              </button>
              <button onClick={() => router.push('/tierras')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent min-w-[64px]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-editorial bg-forest-mid transition-transform hover:-translate-y-1 shrink-0">
                  <span className="text-2xl">🌾</span>
                </div>
                <span className="text-[10px] font-semibold text-forest text-center leading-tight">Tierras</span>
              </button>
              <button onClick={() => router.push('/vets')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent min-w-[64px]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-editorial bg-forest-light transition-transform hover:-translate-y-1 shrink-0">
                  <span className="text-2xl">🩺</span>
                </div>
                <span className="text-[10px] font-semibold text-forest text-center leading-tight">Vet</span>
              </button>
              <button onClick={() => router.push('/panel')} className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent min-w-[64px]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-editorial bg-amber transition-transform hover:-translate-y-1 shrink-0">
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
                <p className="font-headline text-3xl font-bold text-forest mt-1">{isLoading ? "..." : livestockCount}</p>
                {livestockTrend > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-0.5"><span className="material-symbols-outlined text-[13px]">arrow_upward</span>+{livestockTrend}%</p>
                )}
              </Card>
              <Card className="p-4" onClick={() => router.push('/panel')}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone">Área cultivada</p>
                <p className="font-headline text-3xl font-bold text-forest mt-1">{isLoading ? "..." : `${cultivatedArea}ha`}</p>
                <p className="text-xs text-stone font-medium mt-1">Cultivos activos</p>
              </Card>
              <Card className="p-4" onClick={() => router.push('/panel')}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone">Ventas mes</p>
                <p className="font-headline text-3xl font-bold text-forest mt-1">{isLoading ? "..." : formatPrice(monthlySales)}</p>
              </Card>
              <Card className="p-4" onClick={() => router.push('/notif')}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone">Alertas</p>
                <p className={`font-headline text-3xl font-bold mt-1 ${alertCount > 0 ? 'text-error' : 'text-forest'}`}>{isLoading ? "..." : alertCount}</p>
                {alertCount > 0 && <p className="text-xs text-error font-medium mt-1">Requieren acción</p>}
              </Card>
            </div>
          </div>

          {/* Recent activity */}
          <div className="animate-up d3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-stone">Actividad reciente</p>
              <button onClick={() => router.push('/notif')} className="text-amber text-xs font-semibold cursor-pointer border-none bg-transparent hover:brightness-90 transition-all">Ver todas</button>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <Card className="p-3.5 text-center text-sm text-stone">Cargando actividad...</Card>
              ) : recentNotifs.length > 0 ? (
                recentNotifs.map(n => {
                  const style = getIconForType(n.notification_type || n.type);
                  return (
                    <Card key={n.id} className="p-3.5 flex items-center gap-3" onClick={() => router.push('/notif')}>
                      <div className={`w-9 h-9 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined fill-icon ${style.color} text-[18px]`}>{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-forest truncate">{n.title}</p>
                        <p className="text-xs text-stone truncate">{n.message || n.body}</p>
                      </div>
                      <span className="text-[10px] text-stone flex-shrink-0">{timeAgo(n.created_at)}</span>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-3.5 text-center text-sm text-stone">Sin actividad reciente</Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
