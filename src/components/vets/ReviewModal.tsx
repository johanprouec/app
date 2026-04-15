"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/ToastProvider';
import { createVetReview, Appointment } from '@/hooks/useVets';

interface ReviewModalProps {
  appointment: Appointment;
  onClose: (success?: boolean) => void;
}

export function ReviewModal({ appointment, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Por favor selecciona una calificación', 'error');
      return;
    }

    setLoading(true);
    try {
      await createVetReview({
        vet_id: appointment.vet_id,
        appointment_id: appointment.id,
        rating,
        comment
      });
      showToast('¡Reseña enviada con éxito!', 'success');
      onClose(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar reseña';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4 bg-forest/60 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={() => onClose()} />
      <Card className="w-full max-w-md bg-white overflow-hidden animate-up z-10 rounded-[32px] border-none shadow-2xl">
        <div className="p-6 text-center space-y-2">
          <h3 className="font-headline font-bold text-2xl text-forest">¿Cómo fue tu experiencia?</h3>
          <p className="text-sm text-stone">Tu calificación ayuda a mejorar la comunidad de AgroLink.</p>
        </div>
        
        <div className="px-6 pb-8 space-y-6">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="transition-transform active:scale-90 p-1"
              >
                <span className={`material-symbols-outlined text-[40px] transition-colors ${
                  s <= (hoverRating || rating) ? 'text-amber fill-icon' : 'text-stone/20'
                }`}>
                  star
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone uppercase tracking-widest ml-1">Comparte tu opinión</label>
            <textarea 
              className="w-full p-4 rounded-3xl border border-sage-light/30 bg-sage-light/5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/20 min-h-[120px] resize-none leading-relaxed"
              placeholder="Ej. El Dr. fue muy puntual y el tratamiento funcionó perfectamente..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 justify-center !py-3.5 font-bold !rounded-2xl"
              onClick={() => onClose()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="amber" 
              className="flex-[1.5] justify-center !py-3.5 font-bold !rounded-2xl shadow-lg shadow-amber/30"
              onClick={handleSubmit}
              loading={loading}
              disabled={loading || rating === 0}
            >
              Publicar Reseña
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
