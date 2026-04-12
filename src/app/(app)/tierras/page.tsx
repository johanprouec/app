"use client";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { showToast } from "@/components/ui/ToastProvider";
import { useTierras } from "@/hooks/useTierras";

const Terrain3DEngine = dynamic(
  () => import("@/components/terrain/Terrain3DEngine"),
  { ssr: false, loading: () => <div className="h-80 bg-white/50 animate-pulse rounded-[28px]" /> }
);

function TierrasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'lista';
  const propertyId = searchParams.get('id');
  
  const [tab, setTab] = useState(initialTab);
  const [filter, setFilter] = useState('Todos');

  const { tierras, loading } = useTierras({ type: filter !== 'Todos' ? filter : undefined });

  return (
    <>
      <TopNav 
        title="Tierras Productivas" 
        subtitle={<span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>{loading ? '...' : tierras.length} propiedades verificadas</span>}
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
                Array(2).fill(0).map((_, i) => (
                  <Card key={i} className="h-64 bg-white/50 animate-pulse rounded-2xl" />
                ))
              ) : tierras.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-stone/20 text-5xl">inventory_2</span>
                  <p className="text-stone text-sm mt-2">No se encontraron propiedades</p>
                </div>
              ) : (
                tierras.map(tierra => (
                  <Card key={tierra.id} className="overflow-hidden">
                    <div className="h-40 overflow-hidden relative">
                      <img src={tierra.image_url} className="w-full h-full object-cover"/>
                      <div className="chip absolute top-3 left-3 bg-forest text-white uppercase">{tierra.type}</div>
                      {tierra.transaction_type === 'Alquiler' && (
                        <div className="chip absolute top-3 right-3 bg-amber-light text-forest">Alquiler</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline font-bold text-lg text-forest">{tierra.name}</h3>
                          <p className="text-xs text-stone flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>
                            {tierra.location_department}, CO · {tierra.area_ha} Ha
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-headline font-bold text-xl text-amber">${tierra.price_per_ha}M/ha</p>
                          <p className="text-[10px] text-stone">{tierra.transaction_type}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                        <div className="text-center p-2 rounded-xl bg-cream"><p className="text-[9px] text-stone font-bold">Suelo</p><p className="text-xs font-bold text-forest truncate">{tierra.soil_type}</p></div>
                        <div className="text-center p-2 rounded-xl bg-cream"><p className="text-[9px] text-stone font-bold">Agua</p><p className="text-xs font-bold text-forest truncate">{tierra.water_source}</p></div>
                        <div className="text-center p-2 rounded-xl bg-cream"><p className="text-[9px] text-stone font-bold">Altitud</p><p className="text-xs font-bold text-forest">{tierra.altitude}m</p></div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 justify-center !text-sm !py-2" onClick={() => router.push(`/tierras/${tierra.id}`)}>Ver detalles</Button>
                        <Button variant={tierra.type === 'Ganadero' ? 'amber' : 'primary'} className="flex-1 justify-center !text-sm !py-2" onClick={() => router.push(`/chat/${tierra.id}`)}>
                          {tierra.transaction_type === 'Venta' ? 'Contactar' : 'Negociar'}
                        </Button>
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
                  {/* Simulated Colombia map labels */}
                  <p className="absolute text-xs font-bold text-forest/40 top-4 left-1/2 -translate-x-1/2">COLOMBIA</p>
                  <p className="absolute text-[9px] text-forest/30 top-12 left-1/3">Medellín</p>
                  <p className="absolute text-[9px] text-forest/30 top-8 right-1/3">Bogotá</p>
                  <p className="absolute text-[9px] text-forest/30 bottom-1/3 left-1/4">Cali</p>
                  
                  {/* Dynamic pins if we had coordinates, for now keeping mock-ish pins but labels could be dynamic */}
                  {tierras.slice(0, 4).map((t, idx) => (
                    <div key={t.id} className="map-pin" style={{top:`${30 + idx*10}%`, left:`${40 + idx*5}%`}}>
                      ${t.price_per_ha}M/ha
                    </div>
                  ))}

                  {/* Controls */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <button className="w-8 h-8 rounded-lg bg-white shadow text-forest font-bold text-lg flex items-center justify-center border-none cursor-pointer">+</button>
                    <button className="w-8 h-8 rounded-lg bg-white shadow text-forest font-bold text-lg flex items-center justify-center border-none cursor-pointer">−</button>
                  </div>
                  <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                    <button className="bg-white text-forest border-[1.5px] border-forest rounded-xl py-1.5 px-2.5 font-semibold text-xs transition-colors hover:bg-forest/5 flex items-center gap-1 cursor-pointer">
                      <span className="material-symbols-outlined text-[14px]">thermostat</span> Clima
                    </button>
                    <button className="bg-white text-forest border-[1.5px] border-forest rounded-xl py-1.5 px-2.5 font-semibold text-xs transition-colors hover:bg-forest/5 flex items-center gap-1 cursor-pointer">
                      <span className="material-symbols-outlined text-[14px]">layers</span> Suelo
                    </button>
                  </div>
                </div>
              </Card>
              
              {!loading && tierras.slice(0, 2).map(t => (
                <Card key={t.id} className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/tierras/${t.id}`)}>
                  <img src={t.image_url} className="w-16 h-16 rounded-xl object-cover flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="font-semibold text-forest text-sm">{t.name}</p>
                    <p className="text-xs text-stone">{t.location_city} · {t.area_ha} Ha</p>
                  </div>
                  <p className="font-headline font-bold text-amber">${t.price_per_ha}M/ha</p>
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

              <Card className="p-4">
                <h3 className="font-semibold text-forest mb-3">Predicción de rendimiento 2026</h3>
                <div className="flex items-end gap-2 h-24">
                  <div className="flex flex-col items-center gap-1 flex-1"><div className="bar flex-1 w-full" style={{height:'50%'}}></div><p className="text-[9px] text-stone">Ene</p></div>
                  <div className="flex flex-col items-center gap-1 flex-1"><div className="bar flex-1 w-full" style={{height:'65%'}}></div><p className="text-[9px] text-stone">Feb</p></div>
                  <div className="flex flex-col items-center gap-1 flex-1"><div className="bar flex-1 w-full" style={{height:'72%'}}></div><p className="text-[9px] text-stone">Mar</p></div>
                  <div className="flex flex-col items-center gap-1 flex-1"><div className="bar flex-1 w-full" style={{height:'68%'}}></div><p className="text-[9px] text-stone">Abr</p></div>
                  <div className="flex flex-col items-center gap-1 flex-1"><div className="bar flex-1 w-full" style={{height:'80%'}}></div><p className="text-[9px] text-stone">May</p></div>
                  <div className="flex flex-col items-center gap-1 flex-1"><div className="bar current flex-1 w-full bg-forest" style={{height:'100%'}}></div><p className="text-[9px] text-stone">Jun</p></div>
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
                  {!loading && tierras.length > 0 ? (
                    tierras.map(t => (
                      <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl bg-cream">
                        <span className="material-symbols-outlined fill-icon text-forest text-[22px]">view_in_ar</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-forest">{t.name}</p>
                          <p className="text-xs text-stone">{t.area_ha} Ha · {t.location_department} · Actualizado</p>
                        </div>
                        <button 
                          className="text-amber text-xs font-bold border-none bg-transparent cursor-pointer"
                          onClick={() => router.push(`/tierras?tab=3d&id=${t.id}`)}
                        >
                          Abrir
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone text-center py-4">No hay modelos guardados disponibles</p>
                  )}
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
