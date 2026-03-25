"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { showToast } from "@/components/ui/ToastProvider";

export default function GanadoDetail() {
  const router = useRouter();
  const params = useParams(); // params.id
  
  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="scroll-area flex-1">
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&q=80" className="w-full h-64 object-cover"/>
          <button onClick={() => router.back()} className="absolute top-12 left-5 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer border-none hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <div className="chip absolute top-12 right-5 bg-amber-light text-forest">✓ Certificado</div>
        </div>
        <div className="px-5 pt-5 pb-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Chip className="mb-2 !bg-forest !text-white" selected={false}>BOVINO · ANGUS</Chip>
              <h2 className="font-headline font-bold text-2xl text-forest">Lote Angus Premium</h2>
              <p className="text-stone text-sm flex items-center gap-1 mt-1"><span className="material-symbols-outlined fill-icon text-[14px] text-error">location_on</span>Córdoba, CO</p>
            </div>
            <p className="font-headline font-bold text-2xl text-forest">$8.4M</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center"><p className="text-[10px] uppercase font-bold text-stone">Unidades</p><p className="font-headline font-bold text-xl text-forest mt-1">18</p></Card>
            <Card className="p-3 text-center"><p className="text-[10px] uppercase font-bold text-stone">Peso prom.</p><p className="font-headline font-bold text-xl text-forest mt-1">480kg</p></Card>
            <Card className="p-3 text-center"><p className="text-[10px] uppercase font-bold text-stone">Edad prom.</p><p className="font-headline font-bold text-xl text-forest mt-1">3.2 años</p></Card>
          </div>
          <Card className="p-4">
            <h3 className="font-semibold text-forest mb-2">Descripción</h3>
            <p className="text-sm text-stone leading-relaxed">Lote de bovinos Angus seleccionados, con registros sanitarios al día. Excelente conformación carnicera, adaptados al clima de la Costa Atlántica. Incluye certificados de brucelosis y tuberculosis.</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-forest mb-3">Vendedor</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center text-white font-bold flex-shrink-0">JR</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-forest truncate">José Rincón</p>
                <p className="text-xs text-stone truncate">⭐ 4.9 · 47 ventas · Verificado</p>
              </div>
              <Button variant="outline" className="!py-2 !px-3 !text-sm flex-shrink-0" onClick={() => router.push('/chat/1')}>
                <span className="material-symbols-outlined text-[16px]">chat</span> Chat
              </Button>
            </div>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 justify-center" onClick={() => showToast('Guardado en favoritos','success')}>
              <span className="material-symbols-outlined text-[16px]">favorite_border</span> Guardar
            </Button>
            <Button variant="amber" className="flex-1 justify-center" onClick={() => showToast('Contactando al vendedor...','info')}>
              <span className="material-symbols-outlined text-[16px]">handshake</span> Negociar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
