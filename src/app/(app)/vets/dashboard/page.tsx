"use client";
import { useVetAppointments } from "@/hooks/useVets";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";

export default function VetDashboard() {
  const { appointments, loading, error, updateStatus } = useVetAppointments();

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await updateStatus(id, status);
    if (error) {
      const message = error instanceof Error ? error.message : "No pudimos actualizar la cita";
      showToast(message, "error");
    } else {
      showToast(`Cita ${status === 'confirmed' ? 'confirmada' : 'actualizada'}`, "success");
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

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="px-5 pt-8 pb-4 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-forest/5">
        <h1 className="font-headline font-bold text-3xl text-forest">Panel Veterinario</h1>
        <p className="text-stone text-sm">Gestiona tus consultas y pacientes</p>
      </div>

      <div className="flex-1 scroll-area p-5">
        {loading ? (
          <div className="h-full flex items-center justify-center">
             <span className="material-symbols-outlined animate-spin text-forest">progress_activity</span>
          </div>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : appointments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
            <p className="text-stone font-medium">No tienes citas pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const date = new Date(apt.scheduled_at);
              const patientName = apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : "Paciente";
              
              return (
                <Card key={apt.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest font-bold">
                        {patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-forest">{patientName}</p>
                        <p className="text-[10px] text-stone font-bold uppercase">{apt.patient?.phone || "Sin teléfono"}</p>
                      </div>
                    </div>
                    <Chip className={getStatusColor(apt.status)}>
                      {apt.status === 'pending' ? 'Pendiente' : apt.status}
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 !py-2 !text-xs"
                        onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                      >
                        Rechazar
                      </Button>
                      <Button 
                        variant="amber" 
                        className="flex-1 !py-2 !text-xs"
                        onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                      >
                        Confirmar
                      </Button>
                    </div>
                  )}

                  {apt.status === 'confirmed' && (
                    <Button 
                      variant="primary" 
                      className="w-full !py-2 !text-xs"
                      onClick={() => handleStatusUpdate(apt.id, 'completed')}
                    >
                      Marcar como Finalizada
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
