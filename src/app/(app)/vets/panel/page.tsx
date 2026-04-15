"use client";
import React, { useState } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";
import { useVetAccount, useVetAppointments, updateAppointmentStatus, Appointment } from "@/hooks/useVets";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function getAppointmentDate(appointment: Appointment) {
  return appointment.scheduled_at || appointment.appointment_date || appointment.created_at;
}

export default function VetPanel() {
  const { vet, loading: loadingVet } = useVetAccount();
  const { appointments, loading: loadingAppointments, refresh } = useVetAppointments(vet?.id);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    potentialIncome: appointments
      .filter(a => a.status !== 'cancelled')
      .length * (vet?.consultation_price || 0),
    earned: appointments
      .filter(a => a.status === 'completed')
      .length * (vet?.consultation_price || 0)
  };

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      showToast(`Cita ${status === 'confirmed' ? 'confirmada' : status === 'completed' ? 'completada' : 'cancelada'}`, 'success');
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar estado';
      showToast(message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loadingVet) {
    return (
      <div className="bg-cream h-full flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-sage-light/20 rounded-full mb-4" />
        <p className="text-sm text-stone">Cargando panel profesional...</p>
      </div>
    );
  }

  if (!vet) {
    return (
      <div className="bg-cream h-full flex flex-col">
        <TopNav title="Panel Profesional" showBack backTo="/profile" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-forest/5 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-forest text-[40px]">medical_services</span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-forest">¿Eres médico veterinario?</h2>
          <p className="text-sm text-stone mt-3 mb-8 px-4">
            Únete a la red AgroLink para conectar con miles de ganaderos y gestionar tus consultas de forma profesional.
          </p>
          <Button variant="amber" className="px-8 !py-4 font-bold" onClick={() => showToast('Solicitud enviada a revisión', 'success')}>
             Postularme como Especialista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNav 
        title="Mi Consulta" 
        subtitle={`${vet.professional_title} · ${vet.location_city}`}
        showBack 
        backTo="/profile"
        rightAction={
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${vet.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-stone'}`} />
            <span className="text-[10px] font-bold text-stone uppercase tracking-widest">{vet.status}</span>
          </div>
        }
      />

      <div className="scroll-area">
        <div className="px-5 pt-4 pb-20 space-y-5">
          
          {/* Earnings Card */}
          <Card className="p-6 bg-forest text-white overflow-hidden relative border-none shadow-2xl animate-up">
            <div className="relative z-10">
               <p className="text-[10px] font-bold uppercase tracking-widest text-green-300/60">Ingresos Potenciales</p>
               <h3 className="font-headline font-bold text-4xl mt-1 text-white">${(stats.potentialIncome / 1000).toFixed(0)}k<span className="text-lg font-normal text-white/50 ml-1">COP</span></h3>
               
               <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-green-300/40">Total Ganado</p>
                   <p className="font-headline font-bold text-xl text-white">${(stats.earned / 1000).toFixed(0)}k</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-green-300/40">Consultas</p>
                   <p className="font-headline font-bold text-xl text-white">{stats.completed + stats.confirmed}<span className="text-[11px] font-normal opacity-50 ml-1">activas</span></p>
                 </div>
               </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
            </div>
          </Card>

          {/* Quick Actions / Stats */}
          <div className="grid grid-cols-2 gap-3 animate-up d1">
            <Card className="p-4 bg-white/80 border-none shadow-sm flex flex-col items-center">
              <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Pendientes</p>
              <p className="font-headline font-bold text-2xl text-amber">{stats.pending}</p>
            </Card>
            <Card className="p-4 bg-white/80 border-none shadow-sm flex flex-col items-center">
              <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Calificación</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-forest fill-icon text-[18px]">star</span>
                <p className="font-headline font-bold text-2xl text-forest">{vet.rating}</p>
              </div>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="space-y-4 animate-up d2">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-forest text-lg">Solicitudes Recientes</h2>
              <button onClick={() => refresh()} className="text-stone hover:text-forest transition-colors">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>

            {loadingAppointments ? (
              [1, 2].map(i => <div key={i} className="h-40 bg-white/50 animate-pulse rounded-[32px]" />)
            ) : appointments.length === 0 ? (
              <div className="py-12 bg-white/40 rounded-[32px] border border-dashed border-stone/20 text-center">
                <span className="material-symbols-outlined text-stone text-[40px] opacity-20 mb-2">event_busy</span>
                <p className="text-sm text-stone italic font-medium">No hay solicitudes de citas todavía.</p>
              </div>
            ) : (
              appointments.map((apt, i) => (
                <Card key={apt.id} className={`p-5 overflow-hidden animate-up d${(i%3)+1} bg-white shadow- editorial`}>
                  <div className="flex justify-between items-start">
                     <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-stone mb-1">Solicitado el {format(new Date(apt.created_at), "d MMM", { locale: es })}</p>
                       <h4 className="font-headline font-bold text-lg text-forest">Consulta General</h4>
                       <div className="flex items-center gap-3 mt-3">
                         <div className="flex items-center gap-1.5 text-xs text-stone font-medium">
                           <span className="material-symbols-outlined text-[16px] text-amber">calendar_today</span>
                           {format(new Date(getAppointmentDate(apt)), "d 'de' MMMM", { locale: es })}
                         </div>
                         <div className="flex items-center gap-1.5 text-xs text-stone font-medium">
                           <span className="material-symbols-outlined text-[16px] text-amber">schedule</span>
                           {format(new Date(getAppointmentDate(apt)), "HH:mm")}
                         </div>
                       </div>
                     </div>
                     <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border 
                        ${apt.status === 'pending' ? 'bg-amber-pale text-amber border-amber/20' : 
                          apt.status === 'confirmed' ? 'bg-sage-light text-forest border-sage-light/20' : 
                          apt.status === 'completed' ? 'bg-forest/10 text-forest border-forest/10' : 
                          'bg-error-light text-error border-error/10'}`}
                      >
                        {apt.status === 'pending' ? 'Por confirmar' : 
                         apt.status === 'confirmed' ? 'Confirmada' : 
                         apt.status === 'completed' ? 'Finalizada' : 'Cancelada'}
                      </div>
                  </div>

                  {apt.notes && (
                    <div className="mt-4 p-3 bg-cream/30 rounded-2xl border border-stone/5">
                      <p className="text-[10px] text-stone font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">comment</span> Notas del agricultor
                      </p>
                      <p className="text-xs text-stone leading-relaxed italic">&ldquo;{apt.notes}&rdquo;</p>
                    </div>
                  )}

                  <div className="mt-5 pt-5 border-t border-stone/5 flex gap-2">
                    {apt.status === 'pending' ? (
                      <>
                        <Button 
                          variant="primary" 
                          className="flex-1 justify-center !py-2.5 !text-xs font-bold"
                          onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                          disabled={!!updatingId}
                        >
                          Confirmar Cita
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-center !py-2.5 !text-xs font-bold border-error text-error"
                          onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                          disabled={!!updatingId}
                        >
                          Rechazar
                        </Button>
                      </>
                    ) : apt.status === 'confirmed' ? (
                      <Button 
                        variant="amber" 
                        className="flex-1 justify-center !py-2.5 !text-xs font-bold"
                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        disabled={!!updatingId}
                      >
                        Marcar como Completada
                      </Button>
                    ) : (
                      <div className="text-center w-full">
                        <p className="text-[10px] text-stone font-bold uppercase tracking-widest">Atención finalizada el {format(new Date(getAppointmentDate(apt)), "d MMM", { locale: es })}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
