"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVeterinarians, useCreateAppointment } from "@/hooks/useVets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";

export default function BookAppointment() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { vets, loading: vetsLoading } = useVeterinarians();
  const { createAppointment, loading: bookingLoading } = useCreateAppointment();
  
  const [selectedService, setSelectedService] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const vet = vets.find(v => v.id === id);

  if (vetsLoading) return <div className="p-10 text-center">Cargando...</div>;
  if (!vet) return <div className="p-10 text-center">Veterinario no encontrado</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      showToast("Por favor selecciona fecha y hora", "error");
      return;
    }

    const scheduled_at = `${date}T${time}:00Z`;
    const service = vet.services?.find(s => s.id === selectedService);
    
    const { error } = await createAppointment({
      vet_id: vet.id,
      scheduled_at,
      reason: service ? `${service.name}: ${reason}` : reason,
      price: service?.price || vet.consultation_price || 0,
    });

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Cita agendada con éxito", "success");
      router.push("/dashboard"); // Or to appointments page
    }
  };

  return (
    <div className="bg-cream min-h-full p-5 flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass flex items-center justify-center text-forest">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-headline font-bold text-forest">Agendar Cita</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex-1">
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-stone uppercase tracking-wider">Especialista</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold">
              {vet.user?.first_name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-forest">{vet.user?.first_name} {vet.user?.last_name}</p>
              <p className="text-xs text-stone">{vet.professional_title}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-stone uppercase tracking-wider">Servicio</h3>
          <div className="space-y-2">
            {vet.services && vet.services.length > 0 ? (
              vet.services.map((s) => (
                <label 
                  key={s.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedService === s.id ? 'border-amber bg-amber/5 ring-1 ring-amber' : 'border-forest/5 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="service" 
                      value={s.id} 
                      className="accent-amber"
                      checked={selectedService === s.id}
                      onChange={() => setSelectedService(s.id)}
                    />
                    <div>
                      <p className="text-sm font-bold text-forest">{s.name}</p>
                      <p className="text-[10px] text-stone">{s.duration_minutes} min</p>
                    </div>
                  </div>
                  <p className="font-bold text-forest text-sm">${s.price?.toLocaleString()}</p>
                </label>
              ))
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl border border-amber bg-amber/5">
                <p className="text-sm font-bold text-forest">Consulta General</p>
                <p className="font-bold text-forest text-sm">${vet.consultation_price?.toLocaleString()}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone uppercase ml-2">Fecha</label>
            <input 
              type="date" 
              className="w-full h-12 bg-white rounded-2xl border border-forest/5 px-4 text-forest font-medium focus:ring-2 focus:ring-amber outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone uppercase ml-2">Hora</label>
            <input 
              type="time" 
              className="w-full h-12 bg-white rounded-2xl border border-forest/5 px-4 text-forest font-medium focus:ring-2 focus:ring-amber outline-none"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone uppercase ml-2">Notas adicionales</label>
          <textarea 
            className="w-full bg-white rounded-2xl border border-forest/5 p-4 text-forest text-sm focus:ring-2 focus:ring-amber outline-none min-h-[100px]"
            placeholder="Describe el motivo de la consulta o detalles sobre el animal..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="pt-4 mt-auto">
          <Button 
            type="submit" 
            variant="amber" 
            className="w-full h-14 justify-center text-lg gap-2"
            disabled={bookingLoading}
          >
            {bookingLoading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                Confirmar Cita
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
