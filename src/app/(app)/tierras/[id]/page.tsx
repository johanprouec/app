"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";
import { useTierra } from "@/hooks/useTierras";

export default function TierrasDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { tierra, loading } = useTierra(id);

  if (loading) {
    return (
      <div className="bg-cream h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-forest font-semibold">Cargando detalles...</p>
      </div>
    );
  }

  if (!tierra) {
    return (
      <div className="bg-cream h-full flex flex-col items-center justify-center p-10 text-center">
        <span className="material-symbols-outlined text-stone/20 text-6xl mb-4">error</span>
        <h2 className="text-forest font-bold text-xl">Propiedad no encontrada</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/tierras')}>Volver a la lista</Button>
      </div>
    );
  }

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="scroll-area">
        <div className="relative">
          <img src={tierra.image_url} className="w-full h-56 object-cover"/>
          <button onClick={() => router.back()} className="absolute top-12 left-5 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer border-none hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
        </div>
        <div className="px-5 pt-5 pb-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="chip mb-2 bg-forest text-white tracking-widest text-[11px] font-bold px-3 py-1 rounded-full uppercase inline-block">{tierra.type} · {tierra.transaction_type}</div>
              <h2 className="font-headline font-bold text-2xl text-forest">{tierra.name}</h2>
              <p className="text-stone text-sm flex items-center gap-1 mt-1"><span className="material-symbols-outlined fill-icon text-[14px] text-error">location_on</span>{tierra.location_city}, {tierra.location_department} · {tierra.area_ha} Ha</p>
            </div>
            <div className="text-right">
              <p className="font-headline font-bold text-2xl text-amber">${tierra.price_per_ha}M/ha</p>
              <p className="text-xs text-stone">Total: ~${(tierra.price_per_ha * tierra.area_ha).toFixed(1)}M</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 text-center"><p className="text-[9px] uppercase font-bold text-stone">Tipo de suelo</p><p className="font-bold text-forest mt-1 truncate">{tierra.soil_type}</p></Card>
            <Card className="p-3 text-center"><p className="text-[9px] uppercase font-bold text-stone">Agua</p><p className="font-bold text-forest mt-1 truncate">{tierra.water_source}</p></Card>
            <Card className="p-3 text-center"><p className="text-[9px] uppercase font-bold text-stone">Altitud</p><p className="font-bold text-forest mt-1">{tierra.altitude} msnm</p></Card>
            <Card className="p-3 text-center"><p className="text-[9px] uppercase font-bold text-stone">Escritura</p><p className="font-bold text-green-600 mt-1">✓ Libre</p></Card>
          </div>
          {/* Map mini */}
          <Card className="overflow-hidden">
            <div className="map-mock h-36 relative">
              <div className="map-pin" style={{top:'40%',left:'45%'}}>{tierra.name}</div>
              <div className="absolute top-3 right-3 flex gap-1">
                <button className="w-7 h-7 rounded-lg bg-white shadow text-forest font-bold text-sm flex items-center justify-center border-none">+</button>
                <button className="w-7 h-7 rounded-lg bg-white shadow text-forest font-bold text-sm flex items-center justify-center border-none">−</button>
              </div>
            </div>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 justify-center text-sm py-2" onClick={() => router.push(`/tierras?tab=analisis&id=${tierra.id}`)}>
              <span className="material-symbols-outlined text-[15px]">psychology</span> Analizar suelo
            </Button>
            <Button variant="outline" className="flex-1 justify-center text-sm py-2" onClick={() => router.push(`/tierras?tab=3d&id=${tierra.id}`)}>
              <span className="material-symbols-outlined text-[15px]">view_in_ar</span> Ver 3D
            </Button>
          </div>
          <Card className="p-4">
            <h3 className="font-semibold text-forest mb-3">Propietario</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-light flex items-center justify-center font-bold text-forest flex-shrink-0">MR</div>
              <div className="flex-1 min-w-0"><p className="font-semibold text-forest truncate">María Reyes</p><p className="text-xs text-stone truncate">⭐ 4.8 · 12 propiedades · Verificada</p></div>
              <Button variant="outline" className="!py-2 !px-3 !text-sm flex-shrink-0" onClick={() => router.push(`/chat/${tierra.id}`)}><span className="material-symbols-outlined text-[15px]">chat</span></Button>
            </div>
          </Card>
          <Button variant="amber" className="w-full justify-center" onClick={() => showToast('Solicitud enviada','success')}>
            <span className="material-symbols-outlined text-[16px]">handshake</span> Iniciar negociación
          </Button>
        </div>
      </div>
    </div>
  );
}
