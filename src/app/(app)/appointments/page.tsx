"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";
import { useUserAppointments, Appointment, updateAppointmentStatus } from "@/hooks/useVets";
import { ReviewModal } from "@/components/vets/ReviewModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function getAppointmentDate(appointment: Appointment) {
  return appointment.scheduled_at || appointment.appointment_date || appointment.created_at;
}

export default function Appointments() {
  const router = useRouter();
  const { appointments, loading, error, refresh } = useUserAppointments();
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<'active' | 'past'>('active');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-pale text-amber border-amber/20';
      case 'confirmed': return 'bg-sage-light text-forest border-sage-light/20';
      case 'completed': return 'bg-forest/10 text-forest border-forest/10';
      case 'cancelled': return 'bg-error-light text-error border-error/10';
      default: return 'bg-stone/10 text-stone border-stone/10';
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'active') return ['pending', 'confirmed'].includes(apt.status);
    return ['completed', 'cancelled'].includes(apt.status);
  });

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, "cancelled");
      showToast("Cita cancelada correctamente", "success");
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos cancelar la cita";
      showToast(message, "error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <TopNav 
        title="Mis Citas" 
        subtitle="Seguimiento de agendamientos" 
        showBack
        backTo="/profile"
      />
      
      <div className="px-5 pt-4 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-forest/5">
        <div className="flex gap-4 pb-2">
          <button 
            onClick={() => setFilter('active')}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all ${filter === 'active' ? 'border-amber text-amber' : 'border-transparent text-stone'}`}
          >
            PRÓXIMAS
          </button>
          <button 
            onClick={() => setFilter('past')}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all ${filter === 'past' ? 'border-amber text-amber' : 'border-transparent text-stone'}`}
          >
            PASADAS
          </button>
        </div>
      </div>

      <div className="scroll-area flex-1">
        <div className="px-5 pt-4 pb-10 space-y-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-sage-light/20" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-sage-light/20 w-1/2 rounded" />
                    <div className="h-3 bg-sage-light/20 w-1/3 rounded" />
                  </div>
                </div>
              </Card>
            ))
          ) : error ? (
            <div className="p-8 text-center bg-error-light/10 rounded-2xl border border-error/10">
              <span className="material-symbols-outlined text-error text-[40px] mb-2">error</span>
              <p className="text-sm text-error font-bold">Error al cargar citas</p>
              <p className="text-[11px] text-stone mt-1">{error.message}</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-20 text-center animate-fade-in">
              <div className="w-20 h-20 bg-sage-light/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-sage-light">
                <span className="material-symbols-outlined text-stone text-[32px]">calendar_today</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-forest">No tienes citas {filter === 'active' ? 'pendientes' : 'pasadas'}</h3>
              <p className="text-sm text-stone mt-2 px-10">Agenda tu primera consulta con uno de nuestros especialistas agro.</p>
              {filter === 'active' && (
                <button 
                  onClick={() => router.push('/vets')}
                  className="mt-6 text-amber font-bold text-sm underline underline-offset-4"
                >
                  Explorar veterinarios
                </button>
              )}
            </div>
          ) : (
            filteredAppointments.map((apt, i) => {
              const date = new Date(getAppointmentDate(apt));
              const vetName = apt.vet?.user ? `${apt.vet.user.first_name} ${apt.vet.user.last_name}` : (apt.vet?.professional_title || "Especialista");
              
              return (
                <Card key={apt.id} className={`overflow-hidden animate-up d${(i%3)+1} ${apt.status === 'completed' ? 'opacity-90' : ''}`}>
                  <div className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-sage-light/20 shadow-sm">
                        <img 
                          src={apt.vet?.profile_image_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80"} 
                          className="w-full h-full object-cover"
                          alt={apt.vet?.professional_title}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-headline font-bold text-forest truncate pr-2">
                               {vetName}
                            </h4>
                            <p className="text-[10px] text-stone font-bold uppercase tracking-widest mt-0.5">
                              {apt.reason || apt.service_id?.replace('_', ' ') || 'Consulta general'}
                            </p>
                          </div>
                          <div className={`text-[9px] font-bold uppercase tracking-tight py-1 px-2 rounded-lg border ${getStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-stone">
                            <span className="material-symbols-outlined text-[16px] text-amber">calendar_month</span>
                            {format(date, "d 'de' MMMM", { locale: es })}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-stone/20" />
                          <div className="flex items-center gap-1.5 text-xs text-stone">
                            <span className="material-symbols-outlined text-[16px] text-amber">schedule</span>
                            {format(date, "HH:mm")}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {apt.notes && (
                      <div className="mt-4 p-3 bg-sage-light/5 rounded-xl border border-sage-light/10">
                        <p className="text-[10px] items-center gap-1 flex text-stone font-bold uppercase tracking-widest mb-1">
                          <span className="material-symbols-outlined text-[12px]">notes</span> Notas
                        </p>
                        <p className="text-xs text-stone leading-relaxed italic">&ldquo;{apt.notes}&rdquo;</p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-sage-light/20 flex gap-2">
                       <button 
                        onClick={() => router.push(`/vets/${apt.vet_id}`)}
                        className="flex-1 py-2 text-xs font-bold text-forest bg-sage-light/20 rounded-xl hover:bg-sage-light/30 transition-colors"
                      >
                         Ver Perfil
                      </button>
                      {apt.status === 'pending' && (
                        <button 
                          className="flex-1 py-2 text-xs font-bold text-error bg-error-light/10 rounded-xl hover:bg-error-light/20 transition-colors"
                          onClick={() => handleCancelAppointment(apt.id)}
                          disabled={cancellingId === apt.id}
                        >
                          {cancellingId === apt.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                      {apt.status === 'completed' && (
                        <button 
                          onClick={() => setSelectedApt(apt)}
                          className="flex-1 py-2 text-xs font-bold text-white bg-amber rounded-xl hover:bg-[#a86e22] transition-all shadow-lg shadow-amber/20"
                        >
                          Calificar Servicio
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {selectedApt && (
        <ReviewModal 
          appointment={selectedApt} 
          onClose={(success) => {
            setSelectedApt(null);
            if (success) refresh();
          }} 
        />
      )}
    </div>
  );
}
