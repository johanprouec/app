"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";
import { useTierra } from "@/hooks/useTierras";
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);

export default function TierrasDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { tierra, loading } = useTierra(id);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (tierra?.image_url) {
      setActiveImage(tierra.image_url);
    }
  }, [tierra]);

  // Mock gallery images since we only have one in DB for now
  const gallery = useMemo(() => {
    if (!tierra) return [];
    return [
      tierra.image_url,
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80"
    ];
  }, [tierra]);

  if (loading) {
    return (
      <div className="bg-[#07090c] h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00e5a0] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white/50 text-sm font-bold uppercase tracking-widest">Cargando Propiedad...</p>
      </div>
    );
  }

  if (!tierra) {
    return (
      <div className="bg-[#07090c] h-screen flex flex-col items-center justify-center p-10 text-center">
        <span className="material-symbols-outlined text-white/10 text-6xl mb-4">error</span>
        <h2 className="text-white font-bold text-xl">Propiedad no encontrada</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/tierras')}>Volver a la lista</Button>
      </div>
    );
  }

  // Convert polygon data for Leaflet [lng, lat] -> [lat, lng]
  const leafletPolygon = tierra.polygon_data?.map((p: [number, number]) => [p[1], p[0]] as [number, number]);

  return (
    <div className="bg-[#07090c] min-h-screen text-white flex flex-col">
      <div className="scroll-area flex-1 pb-24">
        {/* HERO GALLERY */}
        <div className="relative h-[45vh] lg:h-[60vh] overflow-hidden">
          <img 
            src={activeImage} 
            className="w-full h-full object-cover animate-fade-in" 
            alt={tierra.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090c] via-transparent to-black/20"></div>
          
          <button 
            onClick={() => router.back()} 
            className="absolute top-12 left-5 w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all z-10"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>

          <div className="absolute bottom-6 left-5 right-5 flex flex-col gap-4">
             <div className="flex gap-2 h-16 overflow-x-auto pb-2 scrollbar-none">
                {gallery.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`h-full aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img ? 'border-[#00e5a0]' : 'border-transparent opacity-60'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* PROPERTY INFO */}
        <div className="px-6 -mt-4 relative z-10 space-y-8">
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#00e5a0] text-[#07090c] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{tierra.type}</span>
              <span className="bg-white/10 text-white/50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{tierra.transaction_type}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{tierra.name}</h1>
            <div className="flex items-center justify-between">
              <p className="text-white/40 flex items-center gap-2 text-sm font-medium">
                <span className="material-symbols-outlined text-[#00e5a0] text-[18px]">location_on</span>
                {tierra.location_city}, {tierra.location_department}
              </p>
              <div className="text-right">
                <p className="text-[#00e5a0] text-3xl font-bold tracking-tighter">${tierra.price_per_ha}M<span className="text-sm text-white/20 font-normal">/ha</span></p>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Total Est: ${(tierra.price_per_ha * tierra.area_ha).toFixed(1)}M</p>
              </div>
            </div>
          </header>

          {/* MAIN STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Uso de Suelo', value: tierra.soil_type, icon: 'layers' },
              { label: 'Fuente de Agua', value: tierra.water_source, icon: 'water_drop' },
              { label: 'Altitud', value: `${tierra.altitude}m`, icon: 'filter_hdr' },
              { label: 'Área Total', value: `${tierra.area_ha} Ha`, icon: 'square_foot' }
            ].map((stat, idx) => (
              <Card key={idx} className="bg-white/5 border-white/10 p-5 rounded-[24px] flex flex-col items-center text-center gap-2 hover:bg-white/[0.08] transition-all">
                <span className="material-symbols-outlined text-[#00e5a0]/40 text-[24px]">{stat.icon}</span>
                <div>
                  <p className="text-[9px] uppercase font-bold text-white/30 tracking-widest">{stat.label}</p>
                  <p className="text-sm font-bold text-white mt-1">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MAP SECTION */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Ubicación del Lote</h3>
                <button 
                  onClick={() => router.push(`/tierras?tab=3d&id=${tierra.id}`)}
                  className="text-[#00e5a0] text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">view_in_ar</span> Motor 3D
                </button>
              </div>
              <Card className="h-80 relative overflow-hidden bg-black/20 border-white/10 rounded-[32px]">
                {leafletPolygon && (
                  <MapContainer 
                    center={[leafletPolygon[0][0], leafletPolygon[0][1]]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polygon positions={leafletPolygon} pathOptions={{ color: '#00e5a0', fillColor: '#00e5a0', fillOpacity: 0.2 }} />
                  </MapContainer>
                )}
                {!leafletPolygon && (
                  <div className="flex items-center justify-center h-full text-white/20 uppercase font-black text-2xl tracking-tighter opacity-10">
                    No Map Data
                  </div>
                )}
                <div className="absolute bottom-4 left-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase text-[#00e5a0]">
                  Lat: {leafletPolygon?.[0][0].toFixed(4)} Lng: {leafletPolygon?.[0][1].toFixed(4)}
                </div>
              </Card>
            </div>

            {/* OWNER & CTA SECTION */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Información de Venta</h3>
              <Card className="p-7 bg-[#111827] border-white/10 rounded-[32px] space-y-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00e5a0] to-[#0066ff] flex items-center justify-center font-bold text-[#07090c] text-xl shadow-lg ring-4 ring-white/5">
                    MR
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">María Reyes</p>
                    <p className="text-xs text-[#00e5a0] font-medium tracking-tight">⭐ 4.8 · Inversionista Verificada</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                    <span className="text-xs text-white/60 font-medium">Estado Legal</span>
                    <span className="text-xs font-bold text-[#00e5a0] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">verified</span> Escritura Libre
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                    <span className="text-xs text-white/60 font-medium">Tiempo en Venta</span>
                    <span className="text-xs font-bold text-white/90">12 días publicado</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button variant="amber" className="w-full py-5 rounded-2xl justify-center font-bold text-lg shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:scale-[1.02] transition-all" onClick={() => showToast('Iniciando negociación...','info')}>
                    Iniciar Negociación
                  </Button>
                  <Button variant="outline" className="w-full py-4 rounded-2xl justify-center font-bold border-white/20 text-white/80 hover:bg-white/5" onClick={() => router.push(`/chat/${tierra.id}`)}>
                    Contactar Vendedor
                  </Button>
                </div>
              </Card>

              <button 
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] text-xs font-bold uppercase tracking-widest text-white/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => router.push(`/tierras?tab=analisis&id=${tierra.id}`)}
              >
                <span className="material-symbols-outlined text-[18px]">analytics</span> Ver Análisis de Rentabilidad IA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
