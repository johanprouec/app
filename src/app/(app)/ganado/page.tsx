"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { useLivestockListings, LivestockFilters } from "@/hooks/useListings";

const SPECIES_FILTERS = ["Todos", "Bovino", "Porcino", "Equino", "Ovino", "Caprino", "Avícola", "Certificado"];

const BADGE_CLASSES: Record<string, string> = {
  bovino: "bg-forest text-white",
  porcino: "bg-forest-mid text-white",
  equino: "bg-forest-light text-white",
  ovino: "bg-amber text-white",
  caprino: "bg-amber text-white",
  avicola: "bg-amber-light text-forest",
};

const ANIMAL_EMOJIS: Record<string, string> = {
  bovino: "🐄", porcino: "🐷", equino: "🐴", ovino: "🐑", caprino: "🐐", avicola: "🐔",
};

function RangeSlider({
  label, unit, min, max, value, onChange,
}: {
  label: string; unit: string; min: number; max: number;
  value: [number, number]; onChange: (v: [number, number]) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-stone mb-1">
        <span className="font-semibold text-forest">{label}</span>
        <span>{value[0]}{unit} – {value[1] >= max ? `${max}+` : `${value[1]}${unit}`}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="range" min={min} max={max} step={1} value={value[0]}
          onChange={e => onChange([Number(e.target.value), value[1]])}
          className="flex-1 accent-forest"
        />
        <input
          type="range" min={min} max={max} step={1} value={value[1]}
          onChange={e => onChange([value[0], Number(e.target.value)])}
          className="flex-1 accent-forest"
        />
      </div>
    </div>
  );
}

export default function Ganado() {
  const router = useRouter();
  const { count: cartCount, addToCart } = useCart();

  const [speciesFilter, setSpeciesFilter] = useState("Todos");
  const [weightRange, setWeightRange] = useState<[number, number]>([0, 800]);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 15]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filters: LivestockFilters = {
    animalType: speciesFilter,
    minWeight: weightRange[0] > 0 ? weightRange[0] : undefined,
    maxWeight: weightRange[1] < 800 ? weightRange[1] : undefined,
    minAge: ageRange[0] > 0 ? ageRange[0] : undefined,
    maxAge: ageRange[1] < 15 ? ageRange[1] : undefined,
  };

  const { listings, loading, refetch } = useLivestockListings(filters);

  const formatPrice = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const handleAddToCart = async (item: typeof listings[0], e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(item as any);
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(item.id); return s; }), 1500);
  };

  const activeFilterCount = [
    speciesFilter !== "Todos",
    weightRange[0] > 0 || weightRange[1] < 800,
    ageRange[0] > 0 || ageRange[1] < 15,
  ].filter(Boolean).length;

  return (
    <>
      <TopNav
        title="Mercado de Ganado"
        rightAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCart(true)}
              className="relative w-10 h-10 rounded-full bg-amber-light/20 flex items-center justify-center cursor-pointer hover:bg-amber-light/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-forest">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Button variant="amber" className="!py-2 !px-4 !text-sm" onClick={() => router.push("/ganado/publicar")}>
              <span className="material-symbols-outlined text-[16px]">add</span> Publicar
            </Button>
          </div>
        }
      />

      <div className="scroll-area">
        <div className="px-5 pt-4 pb-8 space-y-4">
          <p className="text-xs text-stone animate-up">Ganado certificado · Transacciones verificadas</p>

          {/* Species chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 animate-up d1" style={{ scrollbarWidth: "none" }}>
            {SPECIES_FILTERS.map(f => (
              <Chip key={f} selected={speciesFilter === f} onClick={() => setSpeciesFilter(f)}>
                {ANIMAL_EMOJIS[f.toLowerCase()] ? `${ANIMAL_EMOJIS[f.toLowerCase()]} ${f}` : f === "Certificado" ? "✓ Certificado" : f}
              </Chip>
            ))}
          </div>

          {/* Advanced filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer animate-up d2 px-4 py-2 rounded-xl ${
              showFilters ? "text-white bg-forest" : "text-forest bg-forest/8 hover:bg-forest/12"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filtros avanzados
            {activeFilterCount > 0 && (
              <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${showFilters ? "bg-white text-forest" : "bg-amber text-white"}`}>
                {activeFilterCount}
              </span>
            )}
            <span className="material-symbols-outlined text-[18px] ml-auto">{showFilters ? "expand_less" : "expand_more"}</span>
          </button>

          {/* Filter panel */}
          {showFilters && (
            <Card className="p-4 space-y-4 animate-up border-forest/20">
              <RangeSlider
                label="Peso promedio"
                unit=" kg"
                min={0}
                max={800}
                value={weightRange}
                onChange={setWeightRange}
              />
              <RangeSlider
                label="Edad promedio"
                unit=" años"
                min={0}
                max={15}
                value={ageRange}
                onChange={setAgeRange}
              />
              <button
                onClick={() => { setWeightRange([0, 800]); setAgeRange([0, 15]); setSpeciesFilter("Todos"); }}
                className="text-xs text-stone hover:text-forest underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </Card>
          )}

          {/* Listings */}
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-forest/5 animate-pulse" />
              ))
            ) : listings.length === 0 ? (
              <Card className="p-10 text-center">
                <span className="material-symbols-outlined text-[48px] text-stone/30">search_off</span>
                <p className="text-stone mt-2">No hay publicaciones con esos filtros</p>
                <button onClick={refetch} className="text-xs text-forest underline mt-2 cursor-pointer">Recargar</button>
              </Card>
            ) : (
              listings.map((item, idx) => {
                const emoji = ANIMAL_EMOJIS[item.animal_type] || "🐄";
                const badgeClass = BADGE_CLASSES[item.animal_type] || "bg-forest text-white";
                const isAdded = addedIds.has(item.id);
                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden animate-up d${Math.min(idx + 1, 5)} cursor-pointer`}
                    onClick={() => router.push(`/ganado/${item.id}`)}
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={item.cover_image_url || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&q=80"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        alt={item.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className={`chip absolute top-3 left-3 text-xs ${badgeClass}`}>
                        {emoji} {item.animal_type.toUpperCase()}{item.breed ? ` · ${item.breed}` : ""}
                      </div>
                      {item.is_certified && (
                        <div className="chip absolute top-3 right-3 bg-amber-light text-forest text-xs">✓ Cert.</div>
                      )}
                      {item.seller && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-forest flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {item.seller.first_name?.charAt(0)}{item.seller.last_name?.charAt(0)}
                          </div>
                          <span className="text-white text-[11px] font-semibold drop-shadow">
                            {item.seller.first_name} {item.seller.last_name}
                            {item.seller.is_verified && " ✓"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline font-bold text-base text-forest leading-tight">{item.title}</h3>
                      <p className="text-xs text-stone flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>
                        {item.location_city && item.location_department
                          ? `${item.location_city}, ${item.location_department}`
                          : item.location_department || "Colombia"}
                        {" · "}{item.units} cab.
                        {item.avg_weight_kg && ` · ~${item.avg_weight_kg}kg`}
                        {item.avg_age_years && ` · ${item.avg_age_years}a`}
                      </p>
                      {item.seller && (
                        <p className="text-xs text-stone mt-0.5">
                          ⭐ {Number(item.seller.rating).toFixed(1)} · {item.seller.total_sales} ventas
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3 gap-2">
                        <p className="font-headline font-bold text-2xl text-forest">{formatPrice(item.price)}</p>
                        <button
                          onClick={e => handleAddToCart(item, e)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            isAdded
                              ? "bg-green-500 text-white scale-95"
                              : "bg-amber-light text-forest hover:bg-amber hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isAdded ? "check" : "add_shopping_cart"}
                          </span>
                          {isAdded ? "Añadido" : "Al carrito"}
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    </>
  );
}
