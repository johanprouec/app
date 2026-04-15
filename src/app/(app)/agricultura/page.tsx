"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { useAgricultureListings, AgricultureFilters } from "@/hooks/useListings";

const CATEGORY_FILTERS = ["Todos", "Tubérculos", "Vegetales", "Frutas", "Cereales", "Orgánico"];

const CATEGORY_EMOJIS: Record<string, string> = {
  "tubérculos": "🥔", vegetales: "🥬", frutas: "🍎", cereales: "🌾",
};

const BADGE_CLASSES: Record<string, string> = {
  "tubérculos": "bg-amber-light text-forest",
  vegetales: "bg-forest-mid text-white",
  frutas: "bg-error text-white",
  cereales: "bg-amber text-white",
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

export default function Agricultura() {
  const router = useRouter();
  const { count: cartCount, addToCart } = useCart();

  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [saleUnitFilter, setSaleUnitFilter] = useState("Todos");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [varietyFilter, setVarietyFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState<{value: number, label: string}>({value: 0, label: "Todas las calificaciones"});
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc">("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filters: AgricultureFilters = {
    category: categoryFilter !== "Todos" && categoryFilter !== "Orgánico" ? categoryFilter : undefined,
    sale_unit: saleUnitFilter !== "Todos" ? saleUnitFilter : undefined,
    is_organic: categoryFilter === "Orgánico" ? true : undefined,
    variety: varietyFilter || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 50000000 ? priceRange[1] : undefined,
    minRating: ratingFilter.value > 0 ? ratingFilter.value : undefined,
    sortBy: sortBy,
  };

  const { listings, loading, refetch } = useAgricultureListings(filters);

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
    categoryFilter !== "Todos",
    saleUnitFilter !== "Todos",
    priceRange[0] > 0 || priceRange[1] < 50000000,
    varietyFilter !== "",
    ratingFilter.value > 0,
    sortBy !== "recent"
  ].filter(Boolean).length;

  return (
    <>
      <TopNav
        title="Mercado Agrícola"
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
            <Button variant="amber" className="!py-2 !px-4 !text-sm" onClick={() => router.push("/agricultura/publicar")}>
              <span className="material-symbols-outlined text-[16px]">add</span> Publicar
            </Button>
          </div>
        }
      />

      <div className="scroll-area">
        <div className="px-5 pt-4 pb-8 space-y-4">
          <p className="text-xs text-stone animate-up">Productos frescos directamente del campo</p>

          <div className="flex gap-2 overflow-x-auto pb-1 animate-up d1" style={{ scrollbarWidth: "none" }}>
            {CATEGORY_FILTERS.map(f => (
              <Chip key={f} selected={categoryFilter === f} onClick={() => setCategoryFilter(f)}>
                {CATEGORY_EMOJIS[f.toLowerCase()] ? `${CATEGORY_EMOJIS[f.toLowerCase()]} ${f}` : f === "Orgánico" ? "🌱 Orgánico" : f}
              </Chip>
            ))}
          </div>

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

          {showFilters && (
            <Card className="p-4 space-y-4 animate-up border-forest/20">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1.5">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                  >
                    <option value="recent">Más recientes</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1.5">Calificación</label>
                  <select
                    value={ratingFilter.value}
                    onChange={e => setRatingFilter({value: Number(e.target.value), label: e.target.options[e.target.selectedIndex].text})}
                    className="w-full border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                  >
                    <option value={0}>Todas</option>
                    <option value={4}>4+ Estrellas</option>
                    <option value={4.5}>4.5+ Estrellas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1.5">Unidad de Venta</label>
                  <select
                    value={saleUnitFilter}
                    onChange={e => setSaleUnitFilter(e.target.value)}
                    className="w-full border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                  >
                    <option value="Todos">Todas las unidades</option>
                    <option value="kg">Por kilogramo (kg)</option>
                    <option value="unidad">Por unidad</option>
                    <option value="bulto">Por bulto</option>
                    <option value="tonelada">Por tonelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1.5">Filtrar por Variedad</label>
                  <input
                    type="text"
                    placeholder="Ej: Hass..."
                    value={varietyFilter}
                    onChange={e => setVarietyFilter(e.target.value)}
                    className="w-full border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                  />
                </div>
              </div>

              <RangeSlider
                label="Rango de Precio"
                unit=""
                min={0}
                max={50000000}
                value={priceRange}
                onChange={setPriceRange}
              />
              <p className="text-xs text-stone mt-[-10px]">{formatPrice(priceRange[0])} - {priceRange[1] >= 50000000 ? formatPrice(50000000) + '+' : formatPrice(priceRange[1])}</p>

              <button
                onClick={() => { 
                  setSaleUnitFilter("Todos"); 
                  setCategoryFilter("Todos"); 
                  setPriceRange([0, 50000000]);
                  setVarietyFilter("");
                  setRatingFilter({value: 0, label: "Todas las calificaciones"});
                  setSortBy("recent");
                }}
                className="text-xs text-stone hover:text-forest underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-forest/5 animate-pulse" />
              ))
            ) : listings.length === 0 ? (
              <Card className="p-10 text-center">
                <span className="material-symbols-outlined text-[48px] text-stone/30">search_off</span>
                <p className="text-stone mt-2">No hay productos con esos filtros</p>
                <button onClick={refetch} className="text-xs text-forest underline mt-2 cursor-pointer">Recargar</button>
              </Card>
            ) : (
              listings.map((item, idx) => {
                const emoji = CATEGORY_EMOJIS[item.category] || "🌱";
                const badgeClass = BADGE_CLASSES[item.category] || "bg-forest text-white";
                const isAdded = addedIds.has(item.id);
                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden animate-up d${Math.min(idx + 1, 5)} cursor-pointer`}
                    onClick={() => router.push(`/agricultura/${item.id}`)}
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={item.cover_image_url || "https://images.unsplash.com/photo-1595856454070-5bfa9b8cc5cc?w=600&q=80"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        alt={item.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className={`chip absolute top-3 left-3 text-xs ${badgeClass}`}>
                        {emoji} {item.category.toUpperCase()}{item.variety ? ` · ${item.variety}` : ""}
                      </div>
                      {item.is_organic && (
                        <div className="chip absolute top-3 right-3 bg-green-500 text-white text-xs">🌱 Orgánico</div>
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
                        {" · "}{item.units_available} {item.sale_unit} DISP.
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
