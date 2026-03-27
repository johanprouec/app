"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { showToast } from "@/components/ui/ToastProvider";
import { useLandListings } from "@/hooks/useListings";
import dynamic from "next/dynamic";
const Terrain3DEngine = dynamic(() => import("@/components/terrain/Terrain3DEngine"), { ssr: false });

function TierrasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'lista';
  const propertyId = searchParams.get('id');
  
  const [tab, setTab] = useState(initialTab);
  const [filter, setFilter] = useState('Todos');
  const { listings, loading } = useLandListings(filter);

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

  return (
    <>
      <TopNav 
        title="Tierras Productivas" 
        subtitle={<span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>{loading ? "Cargando..." : `${listings.length} propiedades`}</span>}
        rightAction={
          <Button variant="amber" className="!py-2 !px-4 !text-sm" onClick={() => showToast('Publicar propiedad','info')}>
            <span className="material-symbols-outlined text-[16px]">add</span> Publicar
          </Button>
        } 
      />
      <div className="scroll-area">
        <div className="px-5 pt-4 pb-4 space-y-4">
          <div className="flex gap-2 animate-up overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
            <Chip selected={tab==='lista'} onClick={()=>setTab('lista')}>🗂 Lista</Chip>
            <Chip selected={tab==='mapa'} onClick={()=>setTab('mapa')}>🗺 Mapa</Chip>
            <Chip selected={tab==='analisis'} onClick={()=>setTab('analisis')}>🤖 Análisis IA</Chip>
            <Chip selected={tab==='3d'} onClick={()=>setTab('3d')}>🌐 Motor 3D</Chip>
          </div>

          {(tab === 'lista' || tab === 'mapa') && (
            <div className="flex gap-2 overflow-x-auto pb-1 animate-up d1" style={{scrollbarWidth:'none'}}>
              {['Todos', 'Agrícola', 'Ganadero', 'Mixto'].map(f => (
                <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
              ))}
            </div>
          )}

          {tab === 'lista' && (
            <div className="space-y-4 animate-up d2">
              {loading ? (
                <Card className="p-8 text-center text-stone">Cargando propiedades...</Card>
              ) : listings.length === 0 ? (
                <Card className="p-8 text-center text-stone">No hay propiedades disponibles</Card>
              ) : (
                listings.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="h-40 overflow-hidden relative">
                      <img src={item.cover_image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80'} className="w-full h-full object-cover"/>
                      <div className="chip absolute top-3 left-3 bg-forest text-white">{landTypeLabels[item.land_type] || item.land_type.toUpperCase()}</div>
                      {item.listing_type === 'alquiler' && <div className="chip absolute top-3 right-3 bg-amber-light text-forest">Alquiler</div>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline font-bold text-lg text-forest">{item.title}</h3>
                          <p className="text-xs text-stone flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>
                            {item.location_department || ''}, CO · {item.area_hectares} Ha
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-headline font-bold text-xl text-amber">
                            {item.price_per_hectare ? `${formatPrice(item.price_per_hectare)}/ha` : 'Consultar'}
                          </p>
                          <p className="text-[10px] text-stone">{item.listing_type === 'alquiler' ? 'Alquiler/año' : 'Venta'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                        <div className="text-center p-2 rounded-xl bg-cream">
                          <p className="text-[9px] text-stone font-bold">Suelo</p>
                          <p className="text-xs font-bold text-forest">{item.soil_type || 'N/A'}</p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-cream">
                          <p className="text-[9px] text-stone font-bold">Agua</p>
                          <p className="text-xs font-bold text-forest">{item.water_source || 'N/A'}</p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-cream">
                          <p className="text-[9px] text-stone font-bold">Altitud</p>
                          <p className="text-xs font-bold text-forest">{item.altitude_meters ? `${item.altitude_meters}m` : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 justify-center !text-sm !py-2" onClick={() => router.push(`/tierras/${item.id}`)}>Ver detalles</Button>
                        <Button variant="primary" className="flex-1 justify-center !text-sm !py-2" onClick={() => router.push(`/chat/new?userId=${item.owner_id}&type=land&listingId=${item.id}`)}>Contactar</Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {tab === 'mapa' && (
            <div className="space-y-3 animate-up d2">
              <Card className="overflow-hidden">
                <div className="map-mock h-72 relative rounded-2xl">
                  <p className="absolute text-xs font-bold text-forest/40 top-4 left-1/2 -translate-x-1/2">COLOMBIA</p>
                  {listings.map((item, i) => (
                    <div key={item.id} className="map-pin" style={{top: `${30 + i * 12}%`, left: `${40 + i * 8}%`}}>
                      {item.price_per_hectare ? `${formatPrice(item.price_per_hectare)}/ha` : '?'}
                    </div>
                  ))}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <button className="w-8 h-8 rounded-lg bg-white shadow text-forest font-bold text-lg flex items-center justify-center border-none cursor-pointer">+</button>
                    <button className="w-8 h-8 rounded-lg bg-white shadow text-forest font-bold text-lg flex items-center justify-center border-none cursor-pointer">−</button>
                  </div>
                </div>
              </Card>
              {listings.map(item => (
                <Card key={item.id} className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/tierras/${item.id}`)}>
                  <img src={item.cover_image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80'} className="w-16 h-16 rounded-xl object-cover flex-shrink-0"/>
                  <div className="flex-1"><p className="font-semibold text-forest text-sm">{item.title}</p><p className="text-xs text-stone">{item.location_department} · {item.area_hectares} Ha</p></div>
                  <p className="font-headline font-bold text-amber">{item.price_per_hectare ? `${formatPrice(item.price_per_hectare)}/ha` : '?'}</p>
                </Card>
              ))}
            </div>
          )}

          {tab === 'analisis' && (
            <div className="space-y-4 animate-up d2">
              <div className="rounded-2xl p-5" style={{background:'linear-gradient(135deg,#002d1c,#1a4a32)'}}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-light/20 flex items-center justify-center">
                    <span className="material-symbols-outlined fill-icon text-amber-light text-[18px]">psychology</span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-white text-sm">Análisis de Suelo con IA</p>
                    <p className="text-green-300/60 text-[10px] uppercase tracking-wider font-bold">AgroML · v3.2</p>
                  </div>
                </div>
                <p className="text-green-300/70 text-sm leading-relaxed mb-4">Carga imágenes satelitales o datos de suelo para obtener predicciones de rendimiento y recomendaciones personalizadas.</p>
                <Button variant="amber" className="w-full justify-center" onClick={() => showToast('Analizando muestra...','info')}>
                  <span className="material-symbols-outlined text-[16px]">upload</span> Cargar muestra de suelo
                </Button>
              </div>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-forest">Resultado · Lote A</h3>
                  <span className="chip bg-sage-light text-forest tracking-wider uppercase text-[11px] font-bold py-1 px-3 rounded-full">✓ Analizado</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-stone font-medium">pH del suelo</span><span className="font-bold text-forest">6.4 (Óptimo)</span></div>
                    <ProgressBar progress={64} className="bg-forest-light" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-stone font-medium">Materia orgánica</span><span className="font-bold text-forest">3.8% (Bueno)</span></div>
                    <ProgressBar progress={76} className="bg-forest-light" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-stone font-medium">Nitrógeno disponible</span><span className="font-bold text-amber">Bajo (22 ppm)</span></div>
                    <ProgressBar progress={28} className="bg-amber" colorClass="bg-amber" />
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-amber-pale">
                  <p className="text-xs font-bold text-amber mb-1">💡 Recomendación IA</p>
                  <p className="text-xs text-stone leading-relaxed">Aplicar 80 kg/ha de urea antes de la siembra. Rendimiento estimado: <strong className="text-forest">4.6 ton/ha</strong> de maíz. Cultivos recomendados: maíz, soya, sorgo.</p>
                </div>
              </Card>
            </div>
          )}

          {tab === '3d' && (
            <div className="space-y-4 animate-up d2">
              <Terrain3DEngine propertyId={propertyId} />
              <Card className="p-4">
                <h3 className="font-semibold text-forest mb-3">Modelos guardados</h3>
                <div className="space-y-2">
                  {listings.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-cream">
                      <span className="material-symbols-outlined fill-icon text-forest text-[22px]">view_in_ar</span>
                      <div className="flex-1"><p className="text-sm font-semibold text-forest">{item.title}</p><p className="text-xs text-stone">{item.area_hectares} Ha · {item.location_department}</p></div>
                      <button className="text-amber text-xs font-bold border-none bg-transparent cursor-pointer">Abrir</button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Tierras() {
  return (
    <Suspense>
      <TierrasContent />
    </Suspense>
  );
}
