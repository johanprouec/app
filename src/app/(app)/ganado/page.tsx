"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";

const GANADO_DATA = [
  { id: 1, type: 'Bovino', title: 'Lote Angus Premium', loc: 'Córdoba, CO', unities: 18, price: '$8.4M', certified: true, img: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&q=80', badge: 'BOVINO · ANGUS', badgeClass: 'bg-forest text-white' },
  { id: 2, type: 'Bovino', title: 'Brahman Rojo Selecto', loc: 'Meta, CO', unities: 24, price: '$12.8M', certified: false, img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80', badge: 'BOVINO · BRAHMAN', badgeClass: 'bg-forest text-white' },
  { id: 3, type: 'Porcino', title: 'Pie de Cría Landrace', loc: 'Antioquia, CO', unities: 45, price: '$5.2M', certified: true, img: 'https://images.unsplash.com/photo-1584467735871-8e4b1d0d3f3a?w=600&q=80', badge: 'PORCINO', badgeClass: 'bg-forest-mid text-white' },
  { id: 4, type: 'Equino', title: 'Criollos Colombianos', loc: 'Boyacá, CO', unities: 6, price: '$18M', certified: false, img: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&q=80', badge: 'EQUINO', badgeClass: 'bg-forest-light text-white' },
  { id: 5, type: 'Bovino', title: 'Holstein Lechero', loc: 'Cundinamarca, CO', unities: 12, price: '$9.6M', certified: true, img: 'https://images.unsplash.com/photo-1548445929-4f60a497f851?w=600&q=80', badge: 'BOVINO · HOLSTEIN', badgeClass: 'bg-forest text-white' }
];

export default function Ganado() {
  const router = useRouter();
  const [filter, setFilter] = useState('Todos');

  const filteredData = GANADO_DATA.filter(item => {
    if (filter === 'Todos') return true;
    if (filter === 'Certificado') return item.certified;
    return item.type === filter;
  });

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
            {filteredData.map((item, idx) => (
              <Card key={item.id} className={`overflow-hidden animate-up d${Math.min(idx+1, 5)}`}>
                <div className="h-44 overflow-hidden relative">
                  <img src={item.img} className="w-full h-full object-cover"/>
                  <div className={`chip absolute top-3 left-3 ${item.badgeClass}`}>{item.badge}</div>
                  {item.certified && <div className="absolute top-3 right-3 chip bg-amber-light text-forest">✓ Certificado</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-headline font-bold text-lg text-forest">{item.title}</h3>
                  <p className="text-xs text-stone flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>{item.loc} · {item.unities} unidades</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-headline font-bold text-2xl text-forest">{item.price}</p>
                    <Button variant="primary" className="!py-2 !px-4 !text-sm" onClick={() => router.push(`/ganado/${item.id}`)}>Ver más</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
