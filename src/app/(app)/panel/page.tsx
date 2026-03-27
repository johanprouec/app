"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { showToast } from "@/components/ui/ToastProvider";
import { useDashboardMetrics } from "@/hooks/useDashboard";
import { useNotifications } from "@/hooks/useNotifications";

export default function Panel() {
  const router = useRouter();
  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  const { notifications, loading: notifLoading } = useNotifications();

  const livestockCount = metrics.livestock_count?.value ?? 0;
  const livestockTrend = metrics.livestock_count?.trend_pct ?? 0;
  const monthlySales = metrics.monthly_sales?.value ?? 0;
  const herdVitality = metrics.herd_vitality?.value ?? 0;
  const weightGain = metrics.weight_gain?.value ?? 0;

  const criticalAlerts = notifications.filter(n => n.severity === 'error' || n.severity === 'warning').slice(0, 3);
  const isLoading = metricsLoading || notifLoading;

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

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
                {livestockTrend > 0 && <span className="text-[11px] font-bold py-0.5 px-2 rounded-[10px] bg-sage-light text-forest">+{livestockTrend}%</span>}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone">Población total</p>
              <p className="font-headline text-[32px] font-bold text-forest leading-[1.1] mt-1">
                {isLoading ? "..." : livestockCount} <span className="text-sm font-normal text-stone">cabezas</span>
              </p>
              <ProgressBar progress={Math.min(100, (livestockCount / 150) * 100)} className="mt-2" />
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-pale">
                  <span className="material-symbols-outlined fill-icon text-amber text-[18px]">payments</span>
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone">Ventas mensuales</p>
              <p className="font-headline text-[32px] font-bold text-forest leading-[1.1] mt-1">
                {isLoading ? "..." : formatPrice(monthlySales)}
              </p>
              <ProgressBar progress={monthlySales > 0 ? Math.min(100, (monthlySales / 60000000) * 100) : 0} colorClass="bg-amber" className="mt-1" />
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-pale">
                  <span className="material-symbols-outlined fill-icon text-amber text-[18px]">health_and_safety</span>
                </div>
                {herdVitality < 95 && <span className="text-[11px] font-bold py-0.5 px-2 rounded-[10px] bg-error-light text-error">⚠ Alerta</span>}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone">Vitalidad hato</p>
              <p className="font-headline text-[32px] font-bold text-forest leading-[1.1] mt-1">
                {isLoading ? "..." : `${herdVitality}%`}
              </p>
              <ProgressBar progress={herdVitality} className="mt-2" />
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-cream-dark flex items-center justify-center">
                  <span className="material-symbols-outlined fill-icon text-forest text-[18px]">monitor_weight</span>
                </div>
                {weightGain > 0 && <span className="text-[11px] font-bold py-0.5 px-2 rounded-[10px] bg-sage-light text-forest">↑ Positivo</span>}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone">Ganancia de peso</p>
              <p className="font-headline text-[32px] font-bold text-forest leading-[1.1] mt-1">
                {isLoading ? "..." : weightGain}<span className="text-sm font-normal text-stone"> kg/día</span>
              </p>
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
              <span className="bg-error-light text-error tracking-wider uppercase text-[11px] font-bold py-1 px-3 rounded-full">
                {criticalAlerts.length} activas
              </span>
            </div>
            <div className="space-y-2">
              {criticalAlerts.length === 0 ? (
                <p className="text-sm text-stone text-center py-2">Sin alertas críticas</p>
              ) : (
                criticalAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#fff9f0]">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-pale">
                      <span className="material-symbols-outlined fill-icon text-amber text-[18px]">{alert.icon || 'warning'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-forest">{alert.title}</p>
                      <p className="text-xs text-stone">{alert.body}</p>
                    </div>
                    <button className="text-amber text-xs font-bold border-none bg-transparent cursor-pointer">Ver</button>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full justify-center mt-3 !text-sm !py-2" onClick={() => router.push('/notif')}>Ver historial completo</Button>
          </Card>

          <Button variant="amber" className="w-full justify-center animate-up d4" onClick={() => showToast('Creando tarea...','info')}>
            <span className="material-symbols-outlined text-[16px]">add_task</span> Nueva Tarea
          </Button>
        </div>
      </div>
    </>
  );
}
