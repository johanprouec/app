"use client";
import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVet, useVetReviews, useVetSpecialties, useSimilarVets, VetReview, Vet } from '@/hooks/useVets';
import { getOrCreateChatRoom } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { BookingModal } from '@/components/vets/BookingModal';
import { showToast } from '@/components/ui/ToastProvider';

function ReviewCard({ review }: { review: VetReview }) {
  return (
    <div className="p-4 bg-white/60 backdrop-blur-sm rounded-[24px] border border-white/40 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs">
            {review.comment.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-forest">Usuario AgroLink</p>
            <p className="text-[10px] text-stone font-medium">{new Date(review.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 bg-amber/10 px-2 py-1 rounded-full">
          <span className="material-symbols-outlined text-amber fill-icon text-[14px]">star</span>
          <span className="text-xs font-bold text-amber">{review.rating}.0</span>
        </div>
      </div>
      <p className="text-xs text-stone leading-relaxed italic">"{review.comment}"</p>
    </div>
  );
}

function SimilarVetCard({ vet, onClick }: { vet: Vet, onClick: () => void }) {
  return (
    <div 
      className="flex-shrink-0 w-64 bg-white rounded-[28px] border border-sage-light/20 overflow-hidden active:scale-[0.98] transition-transform cursor-pointer shadow-editorial"
      onClick={onClick}
    >
      <div className="h-36 relative">
        <img src={vet.profile_image_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80"} className="w-full h-full object-cover" alt={vet.professional_title} />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-amber fill-icon text-[14px]">star</span>
          <span className="text-xs font-bold text-forest">{vet.rating || '0.0'}</span>
        </div>
      </div>
      <div className="p-4 bg-gradient-to-b from-white to-cream/30">
        <p className="text-sm font-bold text-forest truncate">{vet.professional_title}</p>
        <p className="text-[11px] text-stone flex items-center gap-1 mt-1 font-medium">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {vet.location_city}
        </p>
      </div>
    </div>
  );
}

export default function VetDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { vet, loading: loadingVet, error: errorVet } = useVet(id);
  const { reviews, loading: loadingReviews, error: errorReviews } = useVetReviews(id);
  const { specialties, loading: loadingSpecs } = useVetSpecialties(id);
  const { vets: similarVets, loading: loadingSimilar } = useSimilarVets(vet);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : (vet?.rating || 0).toFixed(1);

  if (loadingVet) {
    return (
      <div className="flex flex-col h-screen bg-cream animate-pulse">
        <div className="h-80 bg-stone/5" />
        <div className="px-6 -mt-20 space-y-6">
          <div className="h-28 w-28 rounded-[32px] bg-white shadow-xl" />
          <div className="space-y-3">
            <div className="h-8 bg-stone/5 w-2/3 rounded-xl" />
            <div className="h-4 bg-stone/5 w-1/3 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (errorVet || !vet) {
    return (
      <div className="bg-cream h-screen flex flex-col p-8 text-center items-center justify-center">
        <div className="w-20 h-20 bg-error-light/20 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-error text-[40px]">error</span>
        </div>
        <h3 className="font-headline font-bold text-2xl text-forest">No encontramos el perfil</h3>
        <p className="text-sm text-stone mt-2 mb-8">El veterinario solicitado no existe o hubo un error de conexión.</p>
        <Button variant="outline" onClick={() => router.back()}>Regresar</Button>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen relative overflow-x-hidden">
      {/* Immersive Header */}
      <div className="relative h-80 w-full overflow-hidden">
        <img 
          src={vet.profile_image_url || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=80"} 
          className="w-full h-full object-cover scale-110"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/40 via-forest/20 to-cream" />
        <div className="absolute inset-0 backdrop-blur-[20px] bg-forest/30" />
        
        {/* Transparent Nav */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
          <button 
            onClick={() => router.back()} 
            className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          {vet.is_verified && (
            <div className="bg-forest-mid/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-2 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
              <span className="material-symbols-outlined text-[14px] fill-icon text-green-400">verified</span>
              EXPERTO VERIFICADO
            </div>
          )}
        </div>

        {/* Floating vet photo in header */}
        <div className="absolute bottom-10 left-0 right-0 px-6 flex flex-col items-center animate-fade">
           <div className="relative">
              <div className="h-32 w-32 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl animate-scaleIn">
                <img 
                  src={vet.profile_image_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80"} 
                  className="w-full h-full object-cover"
                  alt={vet.professional_title}
                />
              </div>
              {vet.available_for_emergency && (
                <div className="absolute -bottom-2 -right-2 bg-error text-white h-8 w-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-[16px] animate-pulse">emergency_home</span>
                </div>
              )}
           </div>
           <h1 className="font-headline font-bold text-3xl text-white mt-4 text-center drop-shadow-editorial">
             {vet.professional_title}
           </h1>
           <p className="text-white/80 font-medium text-xs mt-1 flex items-center gap-1.5 uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {vet.location_city}, {vet.location_department}
           </p>
        </div>
      </div>

      <div className="scroll-area -mt-4 rounded-t-[40px] bg-cream relative z-10">
        <div className="px-6 pt-10 pb-32 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 animate-up d1">
            <Card className="p-4 bg-white/80 border-none shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-amber-pale flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-amber fill-icon">star</span>
              </div>
              <p className="font-headline font-bold text-lg text-forest leading-none">{averageRating}</p>
              <p className="text-[10px] text-stone font-bold uppercase tracking-widest mt-1">Calific.</p>
            </Card>
            <Card className="p-4 bg-white/80 border-none shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-sage-light/30 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-forest-mid">workspace_premium</span>
              </div>
              <p className="font-headline font-bold text-lg text-forest leading-none">{vet.years_experience}</p>
              <p className="text-[10px] text-stone font-bold uppercase tracking-widest mt-1">Exp.</p>
            </Card>
            <Card className="p-4 bg-white/80 border-none shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-amber-pale flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-amber">payments</span>
              </div>
              <p className="font-headline font-bold text-lg text-forest leading-none">${(vet.consultation_price || 0) / 1000}k</p>
              <p className="text-[10px] text-stone font-bold uppercase tracking-widest mt-1">Precio</p>
            </Card>
          </div>

          {/* About Section */}
          <div className="space-y-3 animate-up d2">
            <h2 className="font-headline font-bold text-forest text-xl flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              Acerca de mí
            </h2>
            <div className="p-6 bg-white rounded-[28px] shadow-sm border border-sage-light/20 leading-relaxed text-sm text-stone italic">
              "{vet.bio || "Este profesional aún no ha completado su biografía detallada, pero cuenta con toda la certificación AgroLink para atender a tus animales con la mayor dedicación."}"
            </div>
          </div>

          {/* Specializations Tags */}
          <div className="space-y-3 animate-up d3">
            <h2 className="font-headline font-bold text-forest text-xl flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              Habilidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {vet.animal_specialization?.map(s => (
                <Chip key={s} selected={false} className="!text-[11px] !bg-forest !text-white border-none !px-4 !py-2 !rounded-xl font-bold uppercase tracking-wider">{s}</Chip>
              ))}
              {specialties.map(s => (
                <Chip key={s.id} selected={false} className="!text-[11px] !bg-cream-dark !text-forest border-none !px-4 !py-2 !rounded-xl font-bold uppercase tracking-wider">⚡ {s.specialty}</Chip>
              ))}
            </div>
          </div>

           {/* Feedback Section */}
           <div className="space-y-4 animate-up d4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-forest text-xl flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                Reseñas
              </h2>
              {reviews.length > 0 && <span className="text-[10px] font-bold text-stone uppercase tracking-[0.1em] bg-stone/10 px-2 py-1 rounded-lg">{reviews.length} opiniones</span>}
            </div>
            
            <div className="space-y-3">
              {loadingReviews ? (
                <div className="h-32 bg-white/50 animate-pulse rounded-[28px]" />
              ) : reviews.length === 0 ? (
                <div className="p-10 bg-white/40 text-center rounded-[32px] border border-dashed border-stone/20">
                  <p className="text-xs text-stone font-semibold italic opacity-60">No hay reseñas para este perfil todavía.</p>
                </div>
              ) : (
                reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </div>
          </div>

          {/* Cross-selling Section */}
          <div className="pt-4 space-y-4 animate-up d5">
            <h2 className="font-headline font-bold text-forest text-xl flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              Sugeridos
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar">
              {loadingSimilar ? (
                [1, 2].map(i => <div key={i} className="flex-shrink-0 w-64 h-56 bg-white/50 animate-pulse rounded-[28px]" />)
              ) : similarVets.length === 0 ? (
                <p className="text-xs text-stone italic opacity-60">No se encontraron similares en la zona.</p>
              ) : (
                similarVets.map(v => (
                  <SimilarVetCard 
                    key={v.id} 
                    vet={v} 
                    onClick={() => router.push(`/vets/${v.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FIXED PREMIUM ACTION BAR */}
      {!showBooking && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-cream via-cream/95 to-transparent z-40 animate-fade">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button 
              className="w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              onClick={async () => {
                try {
                  const roomId = await getOrCreateChatRoom(vet.id);
                  router.push(`/chat/${roomId}`);
                } catch (err: any) {
                  showToast(err.message || 'Error al iniciar chat', 'error');
                }
              }}
            >
              <span className="material-symbols-outlined text-[24px]">chat</span>
            </button>
            <button 
              className="flex-1 h-14 rounded-2xl bg-amber text-white font-headline font-bold text-lg shadow-xl shadow-amber/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              onClick={() => setShowBooking(true)}
            >
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
              Agendar Ahora
            </button>
          </div>
        </div>
      )}

      {showBooking && vet && (
        <BookingModal 
          vet={vet} 
          onClose={() => setShowBooking(false)} 
        />
      )}
    </div>
  );
}
