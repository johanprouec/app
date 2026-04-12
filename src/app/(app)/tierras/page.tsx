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
import { useTierras, useMyAssets, toggleListingStatus, purchaseProperty } from "@/hooks/useTierras";

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
  const [viewMode, setViewMode] = useState<'market' | 'assets'>('market');
  const [filter, setFilter] = useState('Todos');

  const { tierras, loading: marketLoading } = useTierras({ 
    type: filter !== 'Todos' ? filter : undefined,
    onlyListed: true 
  });

  const { assets, loading: assetsLoading, refresh: refreshAssets } = useMyAssets();

  const loading = viewMode === 'market' ? marketLoading : assetsLoading;
  const currentItems = viewMode === 'market' ? tierras : assets;

  const totalValuation = assets.reduce((acc, curr) => acc + (curr.current_valuation || (curr.price_per_ha * curr.area_ha)), 0);

  return (
    <>
      <TopNav 
        title={viewMode === 'market' ? "Tierras Productivas" : "Mis Activos"} 
        subtitle={
          <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-2 h-2 rounded-full bg-[#00e5a0] inline-block animate-pulse"></span>
            {loading ? '...' : currentItems.length} {viewMode === 'market' ? 'disponibles' : 'propiedades'}
          </span>
        }
        rightAction={
          <Button variant="amber" className="!py-2 !px-4 !text-sm" onClick={() => showToast('Publicar propiedad','info')}>
            <span className="material-symbols-outlined text-[16px]">add</span> Publicar
          </Button>
        } 
      />
      <div className="scroll-area">
        <div className="px-5 pt-4 pb-4 space-y-4">
          {/* Main Navigation Tabs */}
          <div className="flex gap-2 animate-up overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
            <Chip selected={tab==='lista'} onClick={()=>setTab('lista')}>🗂 Lista</Chip>
            <Chip selected={tab==='mapa'} onClick={()=>setTab('mapa')}>🗺 Mapa</Chip>
            <Chip selected={tab==='analisis'} onClick={()=>setTab('analisis')}>🤖 Análisis IA</Chip>
            <Chip selected={tab==='3d'} onClick={()=>setTab('3d')}>🌐 Motor 3D</Chip>
          </div>

          {/* Market vs Assets Toggle */}
          <div className="relative flex p-1.5 bg-[#1a2030] border border-white/15 rounded-[20px] w-full shadow-inner">
            {/* Sliding indicator background */}
            <div
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[14px] transition-all duration-300 ease-in-out bg-[#00e5a0] shadow-[0_4px_20px_rgba(0,229,160,0.3)]"
              style={{ left: viewMode === 'market' ? '6px' : 'calc(50% + 0px)' }}
            />
            <button
              onClick={() => setViewMode('market')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-bold uppercase tracking-widest transition-all duration-300 border-none cursor-pointer z-10 ${viewMode === 'market' ? 'text-[#07090c]' : 'text-white/60 hover:text-white/80'}`}
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              Mercado
            </button>
            <button
              onClick={() => setViewMode('assets')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-bold uppercase tracking-widest transition-all duration-300 border-none cursor-pointer z-10 ${viewMode === 'assets' ? 'text-[#07090c]' : 'text-white/60 hover:text-white/80'}`}
            >
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              Mis Activos
            </button>
          </div>

          {viewMode === 'assets' && !loading && (
            <Card className="p-5 bg-gradient-to-br from-[#00e5a0]/10 to-transparent border-[#00e5a0]/20 animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Valor Total Portafolio</p>
                <span className="text-[10px] font-bold py-1 px-2 rounded-lg bg-[#00e5a0]/20 text-[#00e5a0] tracking-tighter">+8.4% este año</span>
              </div>
              <p className="text-4xl font-bold tracking-tighter">${totalValuation.toFixed(1)}M</p>
              <div className="flex gap-4 mt-4">
                <div className="flex flex-col gap-0.5"><p className="text-[9px] text-white/30 uppercase font-black tracking-widest">Retorno Est.</p><p className="text-sm font-bold">12.4% / año</p></div>
                <div className="flex flex-col gap-0.5"><p className="text-[9px] text-white/30 uppercase font-black tracking-widest">Liquidez</p><p className="text-sm font-bold text-amber">Baja</p></div>
              </div>
            </Card>
          )}

          {(tab === 'lista' || tab === 'mapa') && viewMode === 'market' && (
            <div className="flex gap-2 overflow-x-auto pb-1 animate-up d1" style={{scrollbarWidth:'none'}}>
              {['Todos', 'Agrícola', 'Ganadero', 'Mixto'].map(f => (
                <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
              ))}
            </div>
          )}

          {tab === 'lista' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-up d2">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="h-96 bg-white/50 animate-pulse rounded-3xl"><div /></Card>
                ))
              ) : currentItems.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white/5 rounded-[32px] border border-white/5">
                  <span className="material-symbols-outlined text-stone/20 text-6xl">inventory_2</span>
                  <p className="text-stone text-sm mt-4 font-medium">No se encontraron {viewMode === 'market' ? 'propiedades' : 'activos'}</p>
                </div>
              ) : (
                currentItems.map(tierra => (
                  <Card key={tierra.id} className="group overflow-hidden flex flex-col h-full border border-white/10 shadow-xl hover:shadow-[#00e5a0]/10 transition-all duration-500 bg-[#111827] rounded-[32px]">
                    {/* Top Image Section */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img 
                        src={tierra.image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={tierra.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div>
                      
                      <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-[#00e5a0] text-[#07090c] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                          {tierra.type}
                        </div>
                        {viewMode === 'assets' && (
                          <div className={`text-[#07090c] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg ${tierra.is_listed ? 'bg-[#00e5a0]' : 'bg-white/40 text-white'}`}>
                            {tierra.is_listed ? 'EN VENTA' : 'PRIVADO'}
                          </div>
                        )}
                        {viewMode === 'market' && tierra.transaction_type === 'Alquiler' && (
                          <div className="bg-amber text-[#07090c] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            Alquiler
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="text-[#00e5a0] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{tierra.location_city}</p>
                        <h3 className="text-white font-bold text-2xl leading-tight group-hover:text-[#00e5a0] transition-colors">{tierra.name}</h3>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-1 bg-gradient-to-b from-[#111827] to-[#0f172a]">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                          <span className="material-symbols-outlined text-[18px] text-[#00e5a0]">square_foot</span>
                          <span className="text-sm font-bold text-white">{tierra.area_ha} <span className="text-white/40 font-normal text-xs uppercase">Ha</span></span>
                        </div>
                        <div className="text-right">
                          <p className="text-[#00e5a0] font-headline font-bold text-3xl tracking-tighter shadow-sm">
                            ${viewMode === 'market' ? tierra.price_per_ha : (tierra.current_valuation || (tierra.price_per_ha * tierra.area_ha)).toFixed(1)}M
                            <span className="text-sm text-white/30 font-normal ml-0.5">{viewMode === 'market' ? '/ha' : ''}</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/15 transition-colors">
                          <span className="material-symbols-outlined text-[20px] text-[#00e5a0] mb-1.5">layers</span>
                          <p className="text-[10px] font-bold text-white leading-tight">{tierra.soil_type}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/15 transition-colors">
                          <span className="material-symbols-outlined text-[20px] text-[#00e5a0] mb-1.5">water_drop</span>
                          <p className="text-[10px] font-bold text-white leading-tight">{tierra.water_source}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/15 transition-colors">
                          <span className="material-symbols-outlined text-[20px] text-[#00e5a0] mb-1.5">filter_hdr</span>
                          <p className="text-[10px] font-bold text-white leading-tight">{tierra.altitude}m</p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-auto">
                        <button 
                          onClick={() => router.push(`/tierras/${tierra.id}`)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all text-sm border border-white/10 cursor-pointer"
                        >
                          {viewMode === 'market' ? 'Ver Detalles' : 'Gestionar'}
                        </button>
                        <button 
                          onClick={async () => {
                            if (viewMode === 'market') {
                              showToast('Procesando compra...', 'info');
                              await purchaseProperty(tierra.id);
                              showToast('¡Finca adquirida!', 'success');
                              router.refresh();
                            } else {
                              showToast(tierra.is_listed ? 'Retirando del mercado...' : 'Publicando en mercado...', 'info');
                              await toggleListingStatus(tierra.id, tierra.is_listed);
                              refreshAssets();
                              showToast('Estado actualizado', 'success');
                            }
                          }}
                          className={`flex-[1.2] ${viewMode === 'market' ? 'bg-[#00e5a0]' : (tierra.is_listed ? 'bg-amber' : 'bg-white/10 text-white')} text-[#07090c] font-bold py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-sm border-none cursor-pointer shadow-lg`}
                        >
                          {viewMode === 'market' ? 'Comprar' : (tierra.is_listed ? 'Retirar venta' : 'Poner en venta')}
                        </button>
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
