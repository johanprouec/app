"use client";
import { useCart } from "@/hooks/useCart";
import { Button } from "./Button";
import { Card } from "./Card";

interface CartDrawerProps {
  onClose: () => void;
}

export function CartDrawer({ onClose }: CartDrawerProps) {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#fdfaf5] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-stone/10 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold text-forest">Tu Carrito</h2>
            <p className="text-xs text-stone">{items.length} productos seleccionados</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone/10 transition-colors"
          >
            <span className="material-symbols-outlined text-stone">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <span className="material-symbols-outlined text-[64px] text-stone/30">shopping_cart_off</span>
              <p className="text-stone font-medium">Tu carrito está vacío</p>
              <Button variant="outline" onClick={onClose} className="!text-xs">
                Seguir explorando
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="p-3 flex gap-4 border-forest/5">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone/5 flex-shrink-0">
                  <img 
                    src={item.cover_image_url || "https://images.unsplash.com/photo-1595856454070-5bfa9b8cc5cc?w=200&q=80"} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-forest text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-stone">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-forest/5 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-forest hover:bg-forest/10 rounded w-6 h-6 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="text-xs font-bold text-forest w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-forest hover:bg-forest/10 rounded w-6 h-6 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone hover:text-error transition-colors p-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-stone/10 space-y-4">
            <div className="flex justify-between items-center text-stone">
              <button 
                onClick={clearCart}
                className="text-xs underline hover:text-error transition-colors"
              >
                Vaciar carrito
              </button>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider font-bold opacity-40">Total estimado</p>
                <p className="text-3xl font-headline font-bold text-forest">
                  {formatPrice(total)}
                </p>
              </div>
            </div>
            <Button variant="amber" className="w-full !py-4 h-auto text-base group">
              Proceder al pago
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Button>
            <p className="text-[10px] text-stone text-center">
              * Los precios pueden variar según el transporte y documentos legales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
