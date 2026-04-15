"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useVets, useAllTechnicalSpecialties, useAllCities, Vet } from "@/hooks/useVets";
import { BookingModal } from "@/components/vets/BookingModal";
import { showToast } from "@/components/ui/ToastProvider";

const CATEGORIES = ["Todos", "Bovinos", "Equinos", "Porcinos", "Caprinos", "Pequeños Animales"];

export default function VetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeAnimal, setActiveAnimal] = useState("Todos");
  const [activeTech, setActiveTech] = useState("Todos");
  const [activeCity, setActiveCity] = useState("Todas");
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { vets, loading, error } = useVets({ 
    search, 
    animalSpecialty: activeAnimal, 
    technicalSpecialty: activeTech,
    city: activeCity 
  });

  const { specs: techSpecs } = useAllTechnicalSpecialties();
  const { cities } = useAllCities();

  const handleBook = (vet: Vet) => {
    setSelectedVet(vet);
  };

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <TopNav 
        title="Especialistas Agro" 
        subtitle="Encuentra al profesional ideal"
        rightAction={
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${showFilters ? 'bg-amber text-white' : 'bg-sage-light/20 text-stone'}`}
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        } 
      />
      <div className="scroll-area">
        <div className="px-5 pt-4 pb-20 space-y-4">
          <div className="field flex items-center gap-3 px-4 h-11 animate-up">
            <span className="material-symbols-outlined text-stone text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Nombre, título o biografía..." 
              className="flex-1 bg-transparent text-sm text-forest w-full focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 animate-up d1 no-scrollbar">
            {CATEGORIES.map((f) => (
              <Chip 
                key={f} 
                selected={activeAnimal === f}
                onClick={() => setActiveAnimal(f)}
              >
                {f}
              </Chip>
            ))}
          </div>

          {showFilters && (
            <div className="space-y-4 p-4 bg-sage-light/5 rounded-2xl border border-sage-light/20 animate-fade-in">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-stone uppercase tracking-widest ml-1">Especialidad Técnica</p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {techSpecs.map((s: string) => (
                    <Chip 
                      key={s} 
                      selected={activeTech === s} 
                      onClick={() => setActiveTech(s)}
                      className="!text-[11px] !py-1.5"
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-stone uppercase tracking-widest ml-1">Ubicación</p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {cities.map((c: string) => (
                    <Chip 
                      key={c} 
                      selected={activeCity === c} 
                      onClick={() => setActiveCity(c)}
                      className="!text-[11px] !py-1.5"
                    >
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-sage-light/20" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-sage-light/20 w-1/2 rounded" />
                    <div className="h-4 bg-sage-light/20 w-1/4 rounded" />
                    <div className="h-10 bg-sage-light/20 w-full rounded mt-3" />
                  </div>
                </Card>
              ))
            ) : error ? (
              <div className="p-8 text-center bg-error-light/10 rounded-2xl border border-error/10 animate-fade-in">
                <span className="material-symbols-outlined text-error text-[40px] mb-2">database_off</span>
                <p className="text-sm text-error font-bold uppercase tracking-tight">Error de Conexión</p>
                <p className="text-[11px] text-stone mt-1">{error.message}</p>
              </div>
            ) : vets.length === 0 ? (
              <div className="p-12 text-center bg-sage-light/5 rounded-2xl border border-dashed border-sage-light animate-fade-in">
                <span className="material-symbols-outlined text-stone text-[40px] mb-2">person_search</span>
                <p className="text-sm text-stone font-medium">No se encontraron profesionales</p>
              </div>
            ) : (
              vets.map((vet, i) => {
                const fullName = vet.user
                  ? `${vet.professional_title.includes('Veterinari') ? (vet.professional_title.endsWith('a') ? 'Dra.' : 'Dr.') : ''} ${vet.user.first_name} ${vet.user.last_name}`
                  : vet.professional_title;
                
                return (
                  <Card 
                    key={vet.id} 
                    className={`overflow-hidden animate-up d${(i%3)+1} cursor-pointer active:scale-[0.98] transition-transform`}
                    onClick={() => router.push(`/vets/${vet.id}`)}
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={vet.profile_image_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80"} 
                        className="w-full h-full object-cover"
                        alt={fullName}
                      />
                      <div className="vet-badge uppercase">
                        {vet.animal_specialization?.[0] || 'VETERINARIO'} · {vet.location_city}
                      </div>
                      {vet.is_verified && (
                        <div className="absolute top-3 right-3 bg-forest text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/20 backdrop-blur-md">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Verificado
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline font-bold text-lg text-forest">{fullName}</h3>
                          <p className="text-xs text-stone flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>
                            {vet.location_city}, {vet.location_department}
                          </p>
                          <p className="text-xs text-stone mt-1">
                            ⭐ {vet.rating || '0.0'} · {vet.years_experience} años exp.
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-headline font-bold text-lg text-amber">${(vet.consultation_price || 0) / 1000}K</p>
                          <p className="text-[10px] text-stone">/consulta</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {vet.specialties?.slice(0, 3).map(s => (
                          <Chip key={s.specialty} selected={false} className="!text-[9px] !bg-sage-light !text-forest !px-2 !py-0.5">{s.specialty}</Chip>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-center !text-sm !py-2" 
                          onClick={() => {
                            showToast("Abriendo chat...", "info");
                            router.push(`/chat/vet_${vet.id}`);
                          }}
                        >
                          <span className="material-symbols-outlined text-[15px]">chat</span> Chat
                        </Button>
                        <Button 
                          variant="amber" 
                          className="flex-1 justify-center !text-sm !py-2 font-bold" 
                          onClick={() => handleBook(vet)}
                        >
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedVet && (
        <BookingModal 
          vet={selectedVet} 
          onClose={() => setSelectedVet(null)} 
        />
      )}
    </div>
  );
}
