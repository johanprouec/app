"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";
import { useVeterinarians } from "@/hooks/useVets";

export default function Vets() {
  const router = useRouter();
  const [filter, setFilter] = useState("Todos");
  const { vets, loading } = useVeterinarians(filter !== "Todos" ? filter : undefined);

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <>
      <TopNav 
        title="Servicios Especializados" 
        subtitle="Red certificada de profesionales agropecuarios"
        rightAction={
          <Button variant="amber" className="!py-2 !px-4 !text-sm" onClick={() => showToast('Agendando cita...','info')}>
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span> Agendar
          </Button>
        } 
      />
      <div className="scroll-area">
        <div className="px-5 pt-4 pb-4 space-y-4">
          <div className="field flex items-center gap-3 px-4 h-11 animate-up">
            <span className="material-symbols-outlined text-stone text-[20px]">search</span>
            <input type="text" placeholder="Buscar veterinario o especialidad..." className="flex-1 bg-transparent text-sm text-forest w-full"/>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 animate-up d1" style={{scrollbarWidth:'none'}}>
            {['Todos', 'Bovinos', 'Porcinos', 'Equinos', 'Aves', 'Nutrición'].map((f, i) => (
              <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <Card className="p-8 text-center text-stone">Cargando veterinarios...</Card>
            ) : vets.length === 0 ? (
              <Card className="p-8 text-center text-stone">No hay veterinarios disponibles</Card>
            ) : (
              vets.map((vet, idx) => {
                const fullName = vet.user
                  ? `${vet.professional_title === 'Veterinaria' ? 'Dra.' : 'Dr.'} ${vet.user.first_name} ${vet.user.last_name}`
                  : vet.professional_title;
                const specLabel = vet.animal_specialization?.length
                  ? vet.animal_specialization.map(s => s.toUpperCase()).join(' · ')
                  : '';
                const badgeLabel = `${vet.professional_title.toUpperCase()}${specLabel ? ` · ${specLabel}` : ''}`;

                return (
                  <Card key={vet.id} className={`overflow-hidden animate-up d${Math.min(idx + 1, 5)}`}>
                    <div className="h-48 relative overflow-hidden">
                      <img src={vet.profile_image_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80'} className="w-full h-full object-cover"/>
                      <div className="vet-badge">{badgeLabel}</div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline font-bold text-lg text-forest">{fullName}</h3>
                          <p className="text-xs text-stone flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>
                            {vet.location_city || ''}{vet.location_department ? `, ${vet.location_department}` : ''}
                          </p>
                          <p className="text-xs text-stone mt-1">
                            ⭐ {vet.rating} · {vet.total_consultations} consultas · {vet.years_experience || 0} años exp.
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-headline font-bold text-lg text-amber">
                            {vet.consultation_price ? formatPrice(vet.consultation_price) : 'Consultar'}
                          </p>
                          <p className="text-[10px] text-stone">/consulta</p>
                        </div>
                      </div>
                      {vet.specialties && vet.specialties.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {vet.specialties.map(s => (
                            <Chip key={s.specialty} selected={false} className="!text-[9px] !bg-sage-light !text-forest">{s.specialty}</Chip>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" className="flex-1 justify-center !text-sm !py-2" onClick={() => router.push(`/chat/new?userId=${vet.user_id}`)}>
                          <span className="material-symbols-outlined text-[15px]">chat</span> Consultar
                        </Button>
                        <Button variant="amber" className="flex-1 justify-center !text-sm !py-2" onClick={() => showToast('Cita agendada ✓','success')}>Agendar</Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
