"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { showToast } from "@/components/ui/ToastProvider";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { useAgricultureDetail } from "@/hooks/useListings";
import { useCart } from "@/hooks/useCart";
import { useCreateConversation } from "@/hooks/useChat";
import { useState } from "react";

const CATEGORY_EMOJIS: Record<string, string> = {
  "tubérculos": "🥔", vegetales: "🥬", frutas: "🍎", cereales: "🌾",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`material-symbols-outlined text-[14px] ${i <= Math.round(rating) ? "fill-icon text-amber" : "text-stone/30"}`}
        >
          star
        </span>
      ))}
      <span className="text-xs text-stone ml-1">{Number(rating || 0).toFixed(1)}</span>
    </span>
  );
}

export default function AgriculturaDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { listing, loading } = useAgricultureDetail(id);
  const { addToCart, count: cartCount } = useCart();
  const { createConversation } = useCreateConversation();
  const [cartAdded, setCartAdded] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const formatPrice = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const handleAddToCart = async () => {
    if (!listing) return;
    await addToCart(listing as any);
    setCartAdded(true);
    showToast("Añadido al carrito 🛒", "success");
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleOpenConversation = async () => {
    if (!listing?.seller_id) {
      showToast("No pudimos identificar al vendedor", "error");
      return;
    }

    try {
      const conversationId = await createConversation(listing.seller_id, "agriculture", listing.id);
      if (!conversationId) {
        showToast("No pudimos iniciar la conversación", "error");
        return;
      }
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos abrir el chat";
      showToast(message, "error");
    }
  };

  if (loading) {
    return (
      <div className="bg-cream h-full flex flex-col">
        <div className="h-56 bg-forest/10 animate-pulse" />
        <div className="px-5 pt-5 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-forest/5 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-cream h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-stone/30">search_off</span>
        <p className="text-stone">Publicación no encontrada</p>
        <Button onClick={() => router.push("/agricultura")}>Volver al mercado</Button>
      </div>
    );
  }

  const sellerName = listing.seller
    ? `${listing.seller.first_name} ${listing.seller.last_name}`
    : "Vendedor";
  const sellerInitials = listing.seller
    ? `${listing.seller.first_name?.charAt(0)}${listing.seller.last_name?.charAt(0)}`
    : "V";
  const emoji = CATEGORY_EMOJIS[listing.category] || "🌱";
  const docs: Array<{ name: string; url: string; type: string }> =
    Array.isArray(listing.documents) ? listing.documents : [];

  return (
    <div className="bg-cream h-full flex flex-col">
      <div className="scroll-area flex-1">
        {/* Hero image */}
        <div className="relative">
          <img
            src={listing.cover_image_url || "https://images.unsplash.com/photo-1595856454070-5bfa9b8cc5cc?w=800&q=80"}
            className="w-full h-64 object-cover"
            alt={listing.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button
            onClick={() => router.back()}
            className="absolute top-12 left-5 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer border-none hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          {/* Cart button in hero */}
          <button
            onClick={() => setShowCart(true)}
            className="absolute top-12 right-5 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer border-none hover:bg-white/20 transition-colors relative"
          >
            <span className="material-symbols-outlined text-white">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          {listing.is_organic && (
            <div className="chip absolute bottom-4 right-4 bg-green-500 text-white">🌱 Orgánico</div>
          )}
        </div>

        <div className="px-5 pt-5 pb-8 space-y-4">
          {/* Title & price */}
          <div>
            <Chip className="mb-2 !bg-forest !text-white" selected={false}>
              {emoji} {listing.category.toUpperCase()}{listing.variety ? ` · ${listing.variety.toUpperCase()}` : ""}
            </Chip>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-headline font-bold text-2xl text-forest flex-1">{listing.title}</h2>
              <p className="font-headline font-bold text-2xl text-forest flex-shrink-0">{formatPrice(listing.price)}</p>
            </div>
            <p className="text-stone text-sm flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined fill-icon text-[14px] text-error">location_on</span>
              {listing.location_city || ""}{listing.location_department ? `, ${listing.location_department}` : ""}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <p className="text-[10px] uppercase font-bold text-stone">Cantidad</p>
              <p className="font-headline font-bold text-xl text-forest mt-1">{listing.units_available}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-[10px] uppercase font-bold text-stone">Unidad</p>
              <p className="font-headline font-bold text-xl text-forest mt-1">
                {listing.sale_unit.toUpperCase()}
              </p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-[10px] uppercase font-bold text-stone">Variedad</p>
              <p className="font-headline font-bold text-lg text-forest mt-1 truncate">
                {listing.variety || "N/A"}
              </p>
            </Card>
          </div>

          {/* Description */}
          {listing.description && (
            <Card className="p-4">
              <h3 className="font-semibold text-forest mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">description</span> Descripción
              </h3>
              <p className="text-sm text-stone leading-relaxed">{listing.description}</p>
            </Card>
          )}

          {/* Documents & certificates */}
          <Card className="p-4">
            <h3 className="font-semibold text-forest mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Certificados y Documentos
            </h3>
            {listing.certifications?.length > 0 || docs.length > 0 ? (
              <div className="space-y-2">
                {(listing.certifications || []).map((cert: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <span className="material-symbols-outlined fill-icon text-[20px] text-forest">verified</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest truncate">{cert}</p>
                      <p className="text-xs text-stone">Certificación</p>
                    </div>
                  </div>
                ))}
                {docs.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#f5f0e8] rounded-xl hover:bg-forest/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-forest">
                      {doc.type === "pdf" ? "picture_as_pdf" : "attach_file"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest truncate">{doc.name}</p>
                      <p className="text-xs text-stone uppercase">{doc.type}</p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-stone">open_in_new</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-black/3 rounded-xl">
                <span className="material-symbols-outlined text-[20px] text-stone/50">info</span>
                <p className="text-sm text-stone">Sin documentos adjuntos</p>
              </div>
            )}
          </Card>

          {/* Seller */}
          <Card className="p-4">
            <h3 className="font-semibold text-forest mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">person</span> Vendedor
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center text-white font-bold flex-shrink-0">
                {sellerInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-forest truncate">{sellerName}</p>
                  {listing.seller?.is_verified && (
                    <span className="material-symbols-outlined fill-icon text-[16px] text-forest flex-shrink-0">verified</span>
                  )}
                </div>
                <StarRating rating={listing.seller?.rating || 0} />
                <p className="text-xs text-stone mt-0.5">{listing.seller?.total_sales || 0} ventas realizadas</p>
              </div>
              <Button
                variant="outline"
                className="!py-2 !px-3 !text-sm flex-shrink-0"
                onClick={handleOpenConversation}
              >
                <span className="material-symbols-outlined text-[16px]">chat</span> Chat
              </Button>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-center h-12"
              onClick={handleOpenConversation}
            >
              <span className="material-symbols-outlined text-[16px]">handshake</span> Negociar
            </Button>
            <Button
              variant={cartAdded ? "primary" : "amber-light"}
              className="justify-center h-12 text-forest"
              onClick={handleAddToCart}
            >
              <span className="material-symbols-outlined text-[18px]">
                {cartAdded ? "check" : "add_shopping_cart"}
              </span>
              {cartAdded ? "¡Añadido!" : "Al carrito"}
            </Button>
          </div>

          {/* Buy now */}
          <Button
            variant="amber"
            className="w-full h-14 text-base justify-center"
            onClick={() => { handleAddToCart(); setTimeout(() => setShowCart(true), 100); }}
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            Comprar ahora
          </Button>
        </div>
      </div>

      {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    </div>
  );
}
