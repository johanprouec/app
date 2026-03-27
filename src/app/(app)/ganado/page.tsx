"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";
import { useLivestockListings } from "@/hooks/useListings";

const BADGE_CLASSES: Record<string, string> = {
  bovino: "bg-forest text-white",
  porcino: "bg-forest-mid text-white",
  equino: "bg-forest-light text-white",
  ovino: "bg-amber text-white",
  caprino: "bg-amber text-white",
  avicola: "bg-amber-light text-forest",
};

export default function Ganado() {
  const router = useRouter();
  const [filter, setFilter] = useState("Todos");
  const { listings, loading } = useLivestockListings(filter);

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <>
      <TopNav 
        title="Mercado de Ganado" 
        rightAction={
          <Button variant="amber" className="!py-2 !px-4 !text-sm" onClick={() => showToast('Publicación iniciada','info')}>
            <span className="material-symbols-outlined text-[16px]">add</span> Publicar
          </Button>
        } 
      />
      <div className="scroll-area">
        <div className="px-5 pt-4 pb-4 space-y-4">
          <p className="text-xs text-stone animate-up">Ganado certificado · Transacciones verificadas</p>

          <div className="flex gap-2 overflow-x-auto pb-1 animate-up d1" style={{scrollbarWidth:'none'}}>
            {['Todos', 'Bovino', 'Porcino', 'Equino', 'Ovino', 'Certificado'].map(f => (
              <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
                {f === 'Certificado' ? '✓ Certificado' : f}
              </Chip>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <Card className="p-8 text-center text-stone">Cargando ganado...</Card>
            ) : listings.length === 0 ? (
              <Card className="p-8 text-center text-stone">No hay publicaciones disponibles</Card>
            ) : (
              listings.map((item, idx) => {
                const badgeLabel = `${item.animal_type.toUpperCase()}${item.breed ? ` · ${item.breed.toUpperCase()}` : ''}`;
                const badgeClass = BADGE_CLASSES[item.animal_type] || 'bg-forest text-white';
                return (
                  <Card key={item.id} className={`overflow-hidden animate-up d${Math.min(idx+1, 5)}`}>
                    <div className="h-44 overflow-hidden relative">
                      <img src={item.cover_image_url || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&q=80'} className="w-full h-full object-cover"/>
                      <div className={`chip absolute top-3 left-3 ${badgeClass}`}>{badgeLabel}</div>
                      {item.is_certified && <div className="absolute top-3 right-3 chip bg-amber-light text-forest">✓ Certificado</div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline font-bold text-lg text-forest">{item.title}</h3>
                      <p className="text-xs text-stone flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>
                        {item.location_department ? `${item.location_city}, ${item.location_department}` : 'Colombia'} · {item.units} unidades
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="font-headline font-bold text-2xl text-forest">{formatPrice(item.price)}</p>
                        <Button variant="primary" className="!py-2 !px-4 !text-sm" onClick={() => router.push(`/ganado/${item.id}`)}>Ver más</Button>
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
