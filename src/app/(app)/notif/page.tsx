"use client";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function Notifications() {
  const router = useRouter();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment': return 'calendar_today';
      case 'chat': return 'chat';
      default: return 'notifications';
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'appointment': return 'bg-amber-pale text-amber';
      case 'chat': return 'bg-sage-light text-forest';
      default: return 'bg-cream-dark text-stone';
    }
  };

  const today = notifications.filter(n => isToday(new Date(n.created_at)));
  const yesterday = notifications.filter(n => isYesterday(new Date(n.created_at)));
  const older = notifications.filter(n => !isToday(new Date(n.created_at)) && !isYesterday(new Date(n.created_at)));

  const NotificationItem = ({ n, i }: { n: Notification, i: number }) => (
    <Card 
      key={n.id} 
      className={`p-4 flex gap-3 animate-up d${(i % 3) + 1} transition-all active:scale-[0.99] cursor-pointer 
        ${!n.is_read ? 'border-l-[3px] border-amber shadow-md bg-white' : 'opacity-70 bg-white/60 border-none'}`}
      onClick={() => {
        markAsRead(n.id);
        if (n.link) router.push(n.link);
      }}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${getColor(n.type)} shadow-sm`}>
        <span className="material-symbols-outlined fill-icon text-[20px]">{getIcon(n.type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold text-forest ${!n.is_read ? '' : 'font-medium'}`}>{n.title}</p>
        <p className="text-xs text-stone mt-0.5 leading-relaxed">{n.message}</p>
        <p className="text-[10px] text-stone/60 font-bold uppercase tracking-widest mt-2">
          {format(new Date(n.created_at), "HH:mm '·' d MMM", { locale: es })}
        </p>
      </div>
      {!n.is_read && <div className="w-2 h-2 rounded-full bg-amber flex-shrink-0 mt-2 animate-pulse"></div>}
    </Card>
  );

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <TopNav 
        showBack
        backTo="/home"
        title="Centro de Alertas" 
        rightAction={
          <button 
            onClick={() => markAllAsRead()}
            className="text-amber text-xs font-bold bg-transparent border-none cursor-pointer uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-amber/5 transition-colors"
          >
            Leer todas
          </button>
        }
      />
      <div className="scroll-area flex-1">
        <div className="px-5 pt-4 pb-20 space-y-6">
          
          {loading ? (
             [1, 2, 3].map(i => <div key={i} className="h-24 bg-white/50 animate-pulse rounded-[28px]" />)
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center opacity-30 px-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-[60px] mb-4">notifications_off</span>
              <p className="text-sm font-medium">Bandeja vacía</p>
              <p className="text-xs mt-2 leading-relaxed">Te avisaremos cuando haya novedades en tus citas o mensajes privados.</p>
            </div>
          ) : (
            <>
              {today.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-stone uppercase tracking-[0.2em] ml-2">Recientes</p>
                  {today.map((n, i) => <NotificationItem key={n.id} n={n} i={i} />)}
                </div>
              )}

              {yesterday.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-stone uppercase tracking-[0.2em] ml-2">Ayer</p>
                  {yesterday.map((n, i) => <NotificationItem key={n.id} n={n} i={i} />)}
                </div>
              )}

              {older.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-stone uppercase tracking-[0.2em] ml-2">Anteriores</p>
                  {older.map((n, i) => <NotificationItem key={n.id} n={n} i={i} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
