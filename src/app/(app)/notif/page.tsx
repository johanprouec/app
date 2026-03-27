"use client";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { useNotifications } from "@/hooks/useNotifications";

export default function Notifications() {
  const { notifications, loading, markAllAsRead } = useNotifications();

  const getIconStyle = (type: string, severity: string) => {
    const styles: Record<string, { icon: string; bg: string; color: string; border: string }> = {
      alert_phytosanitary: { icon: "bug_report", bg: "bg-error-light", color: "text-error", border: "!border-l-error" },
      price_change: { icon: "trending_up", bg: "bg-amber-pale", color: "text-amber", border: "!border-l-amber" },
      vaccination: { icon: "vaccines", bg: "bg-sage-light", color: "text-forest", border: "" },
      irrigation: { icon: "water_drop", bg: "bg-sage-light", color: "text-forest", border: "" },
      chat_message: { icon: "chat", bg: "bg-cream-dark", color: "text-stone", border: "" },
      appointment: { icon: "calendar_today", bg: "bg-amber-pale", color: "text-amber", border: "" },
      system: { icon: "info", bg: "bg-cream-dark", color: "text-stone", border: "" },
    };
    return styles[type] || styles.system;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Ayer";
    return `Hace ${days} días`;
  };

  // Group by day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayNotifs = notifications.filter(n => new Date(n.created_at) >= today);
  const yesterdayNotifs = notifications.filter(n => {
    const d = new Date(n.created_at);
    return d >= yesterday && d < today;
  });
  const olderNotifs = notifications.filter(n => new Date(n.created_at) < yesterday);

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <TopNav 
        showBack
        backTo="/home"
        title="Notificaciones" 
        rightAction={
          <button onClick={markAllAsRead} className="text-amber text-xs font-semibold bg-transparent border-none cursor-pointer">
            Leer todas
          </button>
        }
      />
      <div className="scroll-area flex-1">
        <div className="px-5 pt-4 pb-4 space-y-2">
          {loading ? (
            <Card className="p-8 text-center text-stone">Cargando notificaciones...</Card>
          ) : notifications.length === 0 ? (
            <Card className="p-8 text-center text-stone">Sin notificaciones</Card>
          ) : (
            <>
              {todayNotifs.length > 0 && (
                <>
                  <p className="text-xs font-bold text-stone uppercase tracking-widest mb-3">Hoy</p>
                  {todayNotifs.map((n, i) => {
                    const style = getIconStyle(n.notification_type, n.severity);
                    return (
                      <Card key={n.id} className={`p-4 flex gap-3 animate-up d${Math.min(i + 1, 5)} ${!n.is_read ? `border-l-[3px] ${style.border}` : ''}`}>
                        <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                          <span className={`material-symbols-outlined fill-icon ${style.color} text-[20px]`}>{n.icon || style.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-forest">{n.title}</p>
                          {n.body && <p className="text-xs text-stone mt-0.5 leading-relaxed">{n.body}</p>}
                          <p className="text-xs text-stone mt-1.5">{timeAgo(n.created_at)}</p>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-error flex-shrink-0 mt-1.5"></div>}
                      </Card>
                    );
                  })}
                </>
              )}
              {yesterdayNotifs.length > 0 && (
                <>
                  <p className="text-xs font-bold text-stone uppercase tracking-widest mt-5 mb-3">Ayer</p>
                  {yesterdayNotifs.map((n, i) => {
                    const style = getIconStyle(n.notification_type, n.severity);
                    return (
                      <Card key={n.id} className={`p-4 flex gap-3 animate-up d${Math.min(i + 1, 5)}`}>
                        <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                          <span className={`material-symbols-outlined fill-icon ${style.color} text-[20px]`}>{n.icon || style.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-forest">{n.title}</p>
                          {n.body && <p className="text-xs text-stone mt-0.5">{n.body}</p>}
                          <p className="text-xs text-stone mt-1.5">{timeAgo(n.created_at)}</p>
                        </div>
                      </Card>
                    );
                  })}
                </>
              )}
              {olderNotifs.length > 0 && (
                <>
                  <p className="text-xs font-bold text-stone uppercase tracking-widest mt-5 mb-3">Anteriores</p>
                  {olderNotifs.map((n, i) => {
                    const style = getIconStyle(n.notification_type, n.severity);
                    return (
                      <Card key={n.id} className={`p-4 flex gap-3 animate-up d${Math.min(i + 1, 5)}`}>
                        <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                          <span className={`material-symbols-outlined fill-icon ${style.color} text-[20px]`}>{n.icon || style.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-forest">{n.title}</p>
                          {n.body && <p className="text-xs text-stone mt-0.5">{n.body}</p>}
                          <p className="text-xs text-stone mt-1.5">{timeAgo(n.created_at)}</p>
                        </div>
                      </Card>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
