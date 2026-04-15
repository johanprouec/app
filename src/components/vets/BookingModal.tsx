"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/ToastProvider';
import { Vet, useCreateAppointment } from '@/hooks/useVets';

interface BookingModalProps {
  vet: Vet;
  onClose: () => void;
}

export function BookingModal({ vet, onClose }: BookingModalProps) {
  const [selectedService, setSelectedService] = useState('consulta_general');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const { createAppointment, loading } = useCreateAppointment();

  const handleBooking = async () => {
    if (!date || !time) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      const result = await createAppointment({
        vet_id: vet.id,
        scheduled_at: `${date}T${time}:00Z`,
        reason: selectedService === 'consulta_general' ? 'Consulta general' : selectedService,
        price: vet.consultation_price,
        notes: notes
      });

      if (result?.error) {
        throw result.error;
      }

      showToast('¡Cita agendada con éxito!', 'success');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agendar cita';
      showToast(message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 bg-forest/60 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <Card className="w-full max-w-md bg-white overflow-hidden animate-up z-10">
        <div className="p-5 border-b border-sage-light flex justify-between items-center bg-sage-light/30">
          <div>
            <h3 className="font-headline font-bold text-lg text-forest">Agendar Cita</h3>
            <p className="text-xs text-stone">Con {vet.professional_title}</p>
          </div>
          <button onClick={onClose} className="text-stone hover:text-forest">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone ml-1">Servicio</label>
            <select 
              className="w-full h-11 px-4 rounded-xl border border-sage-light bg-sage-light/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              disabled
            >
              <option value="consulta_general">Consulta General - ${vet.consultation_price / 1000}K</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone ml-1">Fecha</label>
              <input 
                type="date" 
                className="w-full h-11 px-4 rounded-xl border border-sage-light bg-sage-light/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber/20"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone ml-1">Hora</label>
              <input 
                type="time" 
                className="w-full h-11 px-4 rounded-xl border border-sage-light bg-sage-light/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber/20"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone ml-1">Notas adicionales (opcional)</label>
            <textarea 
              className="w-full p-4 rounded-xl border border-sage-light bg-sage-light/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber/20 min-h-[80px]"
              placeholder="Ej. Mi vaca tiene fiebre desde ayer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button 
              variant="amber" 
              className="w-full justify-center !py-3 font-bold"
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? 'Agendando...' : 'Confirmar Agendamiento'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
