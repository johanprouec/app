"use client";
import { useParams, useRouter } from "next/navigation";
import { useVeterinarians } from "@/hooks/useVets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export default function VetDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { vets, loading } = useVeterinarians();
  
  const vet = vets.find(v => v.id === id);

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!vet) return <div className="p-10 text-center">Veterinario no encontrado</div>;

  const fullName = vet.user ? `${vet.user.first_name} ${vet.user.last_name}` : "Veterinario";

  return (
    <div className="bg-cream min-h-full pb-20">
      <div className="relative h-48 bg-forest overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-forest/50" />
        <button 
          onClick={() => router.back()} 
          className="absolute top-12 left-5 w-10 h-10 rounded-full glass flex items-center justify-center text-white z-20"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div className="px-5 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-forest/5">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-cream flex items-center justify-center text-forest text-3xl font-bold overflow-hidden mb-4">
              {vet.profile_image_url ? (
                <img src={vet.profile_image_url} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0)
              )}
            </div>
            <h1 className="text-2xl font-headline font-bold text-forest">{fullName}</h1>
            <p className="text-stone font-medium uppercase text-xs tracking-widest mt-1">
              {vet.professional_title}
            </p>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-xl font-bold text-forest">{vet.rating}</p>
                <p className="text-[10px] text-stone uppercase">Rating</p>
              </div>
              <div className="w-px h-8 bg-forest/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-forest">{vet.total_consultations}</p>
                <p className="text-[10px] text-stone uppercase">Visitas</p>
              </div>
              <div className="w-px h-8 bg-forest/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-forest">{vet.years_experience || 0}y</p>
                <p className="text-[10px] text-stone uppercase">Exp</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-2">Biografía</h3>
              <p className="text-sm text-stone leading-relaxed">
                {vet.bio || "Especialista dedicado a la salud animal con amplia experiencia en el sector agropecuario."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-3">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {vet.specialties?.map((s, i) => (
                  <Chip key={i} className="!bg-forest/5 !text-forest border-none normal-case">
                    {s.specialty}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-3">Servicios</h3>
              <div className="space-y-3">
                {vet.services && vet.services.length > 0 ? (
                  vet.services.map((service) => (
                    <Card key={service.id} className="p-4 flex items-center justify-between border-forest/5 bg-cream/30">
                      <div>
                        <p className="font-bold text-forest">{service.name}</p>
                        <p className="text-[10px] text-stone">{service.duration_minutes} min</p>
                      </div>
                      <p className="font-headline font-bold text-forest">${service.price?.toLocaleString()}</p>
                    </Card>
                  ))
                ) : (
                  <Card className="p-4 border-dashed border-forest/20 text-center">
                    <p className="text-stone text-xs italic">Consulta general disponible</p>
                    <p className="text-forest font-bold mt-1">${vet.consultation_price?.toLocaleString()}</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-lg border-t border-forest/5 z-20">
        <Button 
          variant="amber" 
          className="w-full h-14 justify-center gap-2 text-lg shadow-lg shadow-amber/20"
          onClick={() => router.push(`/vets/${vet.id}/book`)}
        >
          <span className="material-symbols-outlined">calendar_month</span>
          Agendar Consulta
        </Button>
      </div>
    </div>
  );
}
