"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { showToast } from "@/components/ui/ToastProvider";
import { useLivestockDetail } from "@/hooks/useListings";
import { useFavorites } from "@/hooks/useDashboard";

export default function GanadoDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { listing, loading } = useLivestockDetail(id);
  const { addFavorite } = useFavorites();

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const handleFavorite = async () => {
    const { error } = await addFavorite("livestock", id);
    if (error) {
      showToast("Error al guardar", "error");
    } else {
      showToast("Guardado en favoritos", "success");
    }
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
        <p className="text-stone">Publicación no encontrada</p>
        <Button onClick={() => router.push('/ganado')}>Volver al mercado</Button>
      </div>
    );
  }

  const sellerName = listing.seller
    ? `${listing.seller.first_name} ${listing.seller.last_name}`
    : "Vendedor";
  const sellerInitials = listing.seller
    ? `${listing.seller.first_name.charAt(0)}${listing.seller.last_name.charAt(0)}`
    : "V";

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="scroll-area flex-1">
        <div className="relative">
          <img src={listing.cover_image_url || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&q=80'} className="w-full h-64 object-cover"/>
          <button onClick={() => router.back()} className="absolute top-12 left-5 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer border-none hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          {listing.is_certified && <div className="chip absolute top-12 right-5 bg-amber-light text-forest">✓ Certificado</div>}
        </div>
        <div className="px-5 pt-5 pb-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Chip className="mb-2 !bg-forest !text-white" selected={false}>
                {listing.animal_type.toUpperCase()}{listing.breed ? ` · ${listing.breed.toUpperCase()}` : ''}
              </Chip>
              <h2 className="font-headline font-bold text-2xl text-forest">{listing.title}</h2>
              <p className="text-stone text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined fill-icon text-[14px] text-error">location_on</span>
                {listing.location_city || ''}{listing.location_department ? `, ${listing.location_department}` : ''}
              </p>
            </div>
            <p className="font-headline font-bold text-2xl text-forest">{formatPrice(listing.price)}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center"><p className="text-[10px] uppercase font-bold text-stone">Unidades</p><p className="font-headline font-bold text-xl text-forest mt-1">{listing.units}</p></Card>
            <Card className="p-3 text-center"><p className="text-[10px] uppercase font-bold text-stone">Peso prom.</p><p className="font-headline font-bold text-xl text-forest mt-1">{listing.avg_weight_kg ? `${listing.avg_weight_kg}kg` : 'N/A'}</p></Card>
            <Card className="p-3 text-center"><p className="text-[10px] uppercase font-bold text-stone">Edad prom.</p><p className="font-headline font-bold text-xl text-forest mt-1">{listing.avg_age_years ? `${listing.avg_age_years} años` : 'N/A'}</p></Card>
          </div>
          {listing.description && (
            <Card className="p-4">
              <h3 className="font-semibold text-forest mb-2">Descripción</h3>
              <p className="text-sm text-stone leading-relaxed">{listing.description}</p>
            </Card>
          )}
          <Card className="p-4">
            <h3 className="font-semibold text-forest mb-3">Vendedor</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center text-white font-bold flex-shrink-0">{sellerInitials}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-forest truncate">{sellerName}</p>
                <p className="text-xs text-stone truncate">
                  ⭐ {listing.seller?.rating || 0} · {listing.seller?.total_sales || 0} ventas
                  {listing.seller?.is_verified && ' · Verificado'}
                </p>
              </div>
              <Button variant="outline" className="!py-2 !px-3 !text-sm flex-shrink-0" onClick={() => router.push(`/chat/new?userId=${listing.seller_id}&type=livestock&listingId=${listing.id}`)}>
                <span className="material-symbols-outlined text-[16px]">chat</span> Chat
              </Button>
            </div>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 justify-center" onClick={handleFavorite}>
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
