"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";
import { useLandDetail } from "@/hooks/useListings";

export default function TierrasDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { listing, loading } = useLandDetail(id);

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const landTypeLabels: Record<string, string> = {
    agricola: "AGRÍCOLA",
    ganadero: "GANADERO",
    mixto: "MIXTO",
    forestal: "FORESTAL",
  };

  if (loading) {
    return (
      <div className="bg-cream h-full flex items-center justify-center">
        <p className="text-stone">Cargando...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-cream h-full flex flex-col items-center justify-center gap-4">
        <p className="text-stone">Propiedad no encontrada</p>
        <Button onClick={() => router.push('/tierras')}>Volver a tierras</Button>
      </div>
    );
  }

  const ownerName = listing.owner
    ? `${listing.owner.first_name} ${listing.owner.last_name}`
    : "Propietario";
  const ownerInitials = listing.owner
    ? `${listing.owner.first_name.charAt(0)}${listing.owner.last_name.charAt(0)}`
    : "P";

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="scroll-area">
        <div className="relative">
          <img src={listing.cover_image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'} className="w-full h-56 object-cover"/>
          <button onClick={() => router.back()} className="absolute top-12 left-5 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer border-none hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
        </div>
        <div className="px-5 pt-5 pb-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="chip mb-2 bg-forest text-white tracking-widest text-[11px] font-bold px-3 py-1 rounded-full uppercase inline-block">
                {landTypeLabels[listing.land_type] || listing.land_type.toUpperCase()} · {listing.listing_type === 'alquiler' ? 'ALQUILER' : 'VENTA'}
              </div>
              <h2 className="font-headline font-bold text-2xl text-forest">{listing.title}</h2>
              <p className="text-stone text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined fill-icon text-[14px] text-error">location_on</span>
                {listing.location_department || ''}, CO · {listing.area_hectares} Ha
              </p>
            </div>
            <div className="text-right">
              <p className="font-headline font-bold text-2xl text-amber">
                {listing.price_per_hectare ? `${formatPrice(listing.price_per_hectare)}/ha` : 'Consultar'}
              </p>
              {listing.total_price && <p className="text-xs text-stone">Total: ~{formatPrice(listing.total_price)}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 text-center"><p className="text-[9px] uppercase font-bold text-stone">Tipo de suelo</p><p className="font-bold text-forest mt-1">{listing.soil_type || 'N/A'}</p></Card>
            <Card className="p-3 text-center"><p className="text-[9px] uppercase font-bold text-stone">Agua</p><p className="font-bold text-forest mt-1">{listing.water_source || 'N/A'}</p></Card>
            <Card className="p-3 text-center"><p className="text-[9px] uppercase font-bold text-stone">Altitud</p><p className="font-bold text-forest mt-1">{listing.altitude_meters ? `${listing.altitude_meters} msnm` : 'N/A'}</p></Card>
            <Card className="p-3 text-center"><p className="text-[9px] uppercase font-bold text-stone">Escritura</p><p className={`font-bold mt-1 ${listing.has_clear_deed ? 'text-green-600' : 'text-stone'}`}>{listing.has_clear_deed ? '✓ Libre' : 'Verificar'}</p></Card>
          </div>
          <Card className="overflow-hidden">
            <div className="map-mock h-36 relative">
              <div className="map-pin" style={{top:'40%',left:'45%'}}>Finca</div>
              <div className="absolute top-3 right-3 flex gap-1">
                <button className="w-7 h-7 rounded-lg bg-white shadow text-forest font-bold text-sm flex items-center justify-center border-none">+</button>
                <button className="w-7 h-7 rounded-lg bg-white shadow text-forest font-bold text-sm flex items-center justify-center border-none">−</button>
              </div>
            </div>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 justify-center text-sm py-2" onClick={() => router.push('/tierras?tab=analisis')}>
              <span className="material-symbols-outlined text-[15px]">psychology</span> Analizar suelo
            </Button>
            <Button variant="outline" className="flex-1 justify-center text-sm py-2" onClick={() => router.push(`/tierras?tab=3d&id=${params.id}`)}>
              <span className="material-symbols-outlined text-[15px]">view_in_ar</span> Ver 3D
            </Button>
          </div>
          <Card className="p-4">
            <h3 className="font-semibold text-forest mb-3">Propietario</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-light flex items-center justify-center font-bold text-forest flex-shrink-0">{ownerInitials}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-forest truncate">{ownerName}</p>
                <p className="text-xs text-stone truncate">
                  ⭐ {listing.owner?.rating || 0} · {listing.owner?.total_sales || 0} propiedades
                  {listing.owner?.is_verified && ' · Verificada'}
                </p>
              </div>
              <Button variant="outline" className="!py-2 !px-3 !text-sm flex-shrink-0" onClick={() => router.push(`/chat/new?userId=${listing.owner_id}`)}>
                <span className="material-symbols-outlined text-[15px]">chat</span>
              </Button>
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
