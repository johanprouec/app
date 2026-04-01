"use client";
import { useState } from "react";
import { useUserAppointments, useCreateAppointment } from "@/hooks/useVets";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";

export default function MyAppointments() {
  const { appointments, loading, error, refetch, submitReview } = useUserAppointments();
  const { cancelAppointment } = useCreateAppointment();
  const router = useRouter();
  const [filter, setFilter] = useState<'active' | 'past'>('active');

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'active') return ['pending', 'confirmed', 'in_progress'].includes(apt.status);
    return ['completed', 'cancelled'].includes(apt.status);
  });

  const handleCancel = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      const { error } = await cancelAppointment(id);
      if (error) {
        showToast(error.message, "error");
      } else {
        showToast("Cita cancelada", "success");
        refetch();
      }
    }
  };

  const handleReview = async (apt: any) => {
    const comment = prompt("Cuéntanos tu experiencia (opcional):");
    const ratingStr = prompt("Califica del 1 al 5:");
    const rating = parseInt(ratingStr || "5");
    
    if (isNaN(rating) || rating < 1 || rating > 5) {
      showToast("Calificación inválida", "error");
      return;
    }

    const { error } = await submitReview(apt.vet_id, apt.id, rating, comment || "");
    if (error) {
       showToast(error.message, "error");
    } else {
       showToast("¡Gracias por tu calificación!", "success");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '!bg-amber-light !text-amber';
      case 'confirmed': return '!bg-forest/10 !text-forest';
      case 'completed': return '!bg-cream !text-stone';
      case 'cancelled': return '!bg-error/10 !text-error';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="px-5 pt-8 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-forest/5">
        <h1 className="font-headline font-bold text-3xl text-forest">Mis Citas</h1>
        <p className="text-stone text-sm pb-4">Gestiona tus consultas veterinarias</p>
        
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

      <div className="flex-1 scroll-area p-5">
        {loading ? (
          <div className="h-full flex items-center justify-center">
             <span className="material-symbols-outlined animate-spin text-forest">progress_activity</span>
          </div>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : filteredAppointments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <span className="material-symbols-outlined text-4xl mb-2">calendar_today</span>
            <p className="text-stone font-medium">No tienes citas {filter === 'active' ? 'pendientes' : 'pasadas'}</p>
            {filter === 'active' && (
              <Button variant="outline" className="mt-4" onClick={() => router.push('/vets')}>Buscar Veterinario</Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => {
              const date = new Date(apt.scheduled_at);
              const vetName = apt.vet?.user ? `${apt.vet.user.first_name} ${apt.vet.user.last_name}` : "Veterinario";
              
              return (
                <Card key={apt.id} className={`p-4 space-y-3 ${apt.status === 'completed' ? 'opacity-80' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest font-bold">
                        {vetName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-forest">{vetName}</p>
                        <p className="text-[10px] text-stone uppercase">{apt.vet?.professional_title}</p>
                      </div>
                    </div>
                    <Chip className={getStatusColor(apt.status)}>
                      {getStatusText(apt.status)}
                    </Chip>
                  </div>
                  
                  <div className="bg-cream/50 rounded-xl p-3 flex gap-4">
                    <div className="flex flex-col items-center justify-center pr-4 border-r border-forest/10 min-w-[60px]">
                      <p className="text-[10px] text-stone uppercase font-bold">{date.toLocaleDateString('es-CO', { month: 'short' })}</p>
                      <p className="text-xl font-headline font-bold text-forest">{date.getDate()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-forest flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-stone mt-1">{apt.service?.name || apt.reason || "Consulta General"}</p>
                    </div>
                  </div>

                  {apt.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 !py-2 !text-xs border-error/20 !text-error hover:bg-error/5"
                        onClick={() => handleCancel(apt.id)}
                      >
                        Cancelar
                      </Button>
                      <Button variant="outline" className="flex-1 !py-2 !text-xs" onClick={() => router.push(`/chat/new?userId=${apt.vet?.user_id}`)}>
                        Mensaje
                      </Button>
                    </div>
                  )}

                  {apt.status === 'completed' && (
                    <Button variant="amber" className="w-full !py-2 !text-xs" onClick={() => handleReview(apt)}>
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      Calificar Atención
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
