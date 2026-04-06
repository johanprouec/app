"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/hooks/useCart";
import { showToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";

const PAYMENT_METHODS = [
  { id: "card", icon: "credit_card", label: "Tarjeta de crédito/débito", sub: "Visa, Mastercard, Amex" },
  { id: "pse", icon: "account_balance", label: "PSE – Débito bancario", sub: "Todos los bancos colombianos" },
  { id: "efecty", icon: "storefront", label: "Efecty / Baloto", sub: "Pago en punto físico" },
  { id: "crypto", icon: "currency_bitcoin", label: "Criptomonedas", sub: "BTC, ETH, USDT" },
];

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, removeFromCart, clearCart, total, count } = useCart();
  const [step, setStep] = useState<"cart" | "payment" | "confirm">("cart");
  const [payMethod, setPayMethod] = useState<string>("");
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [processing, setProcessing] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const formatPrice = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const handlePay = async () => {
    if (!payMethod) { showToast("Selecciona un método de pago", "error"); return; }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2200));
    setProcessing(false);
    setStep("confirm");
    await clearCart();
  };

  if (!mounted) return null;

  const drawer = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn .2s ease" }}
      />
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] max-h-[90dvh] flex flex-col overflow-hidden"
        style={{ animation: "slideUp .3s cubic-bezier(.16,1,.3,1)" }}
      >
        <div className="w-10 h-1 bg-black/10 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {step === "cart" && (
          <>
            <div className="px-5 py-3 flex items-center justify-between border-b border-black/5 flex-shrink-0">
              <div>
                <h2 className="font-headline font-bold text-xl text-forest">Mi Carrito</h2>
                <p className="text-xs text-stone">{count} {count === 1 ? "artículo" : "artículos"}</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-forest">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-stone/30">shopping_cart</span>
                  <p className="text-stone mt-2 text-sm">Tu carrito está vacío</p>
                  <Button variant="outline" className="mt-4 mx-auto" onClick={onClose}>Explorar ganado</Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-[#f5f0e8] rounded-2xl">
                    <img
                      src={item.listing.cover_image_url || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=200&q=60"}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      alt={item.listing.title}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-forest text-sm truncate">{item.listing.title}</p>
                      <p className="text-xs text-stone capitalize">{item.listing.animal_type} · {item.listing.units} unidades</p>
                      <p className="font-headline font-bold text-forest mt-1">{formatPrice(item.listing.price)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.listing.id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-red-500">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="px-5 pb-8 pt-3 border-t border-black/5 flex-shrink-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone text-sm">Total</span>
                  <span className="font-headline font-bold text-2xl text-forest">{formatPrice(total)}</span>
                </div>
                <Button variant="amber-light" className="w-full" onClick={() => setStep("payment")}>
                  <span className="material-symbols-outlined text-[20px]">payment</span>
                  Proceder al pago
                </Button>
              </div>
            )}
          </>
        )}

        {step === "payment" && (
          <>
            <div className="px-5 py-3 flex items-center gap-3 border-b border-black/5 flex-shrink-0">
              <button onClick={() => setStep("cart")} className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-forest">arrow_back</span>
              </button>
              <div>
                <h2 className="font-headline font-bold text-xl text-forest">Método de pago</h2>
                <p className="text-xs text-stone">Total: {formatPrice(total)}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPayMethod(pm.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    payMethod === pm.id
                      ? "border-forest bg-forest/5"
                      : "border-black/8 bg-[#f5f0e8] hover:border-forest/30"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${payMethod === pm.id ? "bg-forest" : "bg-white"}`}>
                    <span className={`material-symbols-outlined text-[22px] ${payMethod === pm.id ? "text-white" : "text-forest"}`}>{pm.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-forest text-sm">{pm.label}</p>
                    <p className="text-xs text-stone">{pm.sub}</p>
                  </div>
                  {payMethod === pm.id && (
                    <span className="material-symbols-outlined fill-icon text-[22px] text-forest">check_circle</span>
                  )}
                </button>
              ))}

              {payMethod === "card" && (
                <div className="bg-forest/5 rounded-2xl p-4 space-y-3 border border-forest/10">
                  <p className="font-semibold text-forest text-sm">Datos de la tarjeta</p>
                  <input
                    placeholder="Número de tarjeta"
                    maxLength={19}
                    value={cardForm.number}
                    onChange={e => setCardForm(f => ({ ...f, number: e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim() }))}
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-forest focus:outline-none focus:border-forest bg-white"
                  />
                  <input
                    placeholder="Nombre en la tarjeta"
                    value={cardForm.name}
                    onChange={e => setCardForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-forest focus:outline-none focus:border-forest bg-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="MM/AA"
                      maxLength={5}
                      value={cardForm.expiry}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, "");
                        setCardForm(f => ({ ...f, expiry: v.length >= 3 ? `${v.slice(0,2)}/${v.slice(2)}` : v }));
                      }}
                      className="border border-black/10 rounded-xl px-4 py-3 text-sm text-forest focus:outline-none focus:border-forest bg-white"
                    />
                    <input
                      placeholder="CVV"
                      maxLength={4}
                      type="password"
                      value={cardForm.cvv}
                      onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "") }))}
                      className="border border-black/10 rounded-xl px-4 py-3 text-sm text-forest focus:outline-none focus:border-forest bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-8 pt-3 border-t border-black/5 flex-shrink-0">
              <Button
                variant="amber-light"
                className="w-full"
                disabled={processing}
                onClick={handlePay}
              >
                {processing ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Procesando...</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">lock</span> Pagar {formatPrice(total)}</>
                )}
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5"
              style={{ animation: "bounceIn .5s ease" }}>
              <span className="material-symbols-outlined fill-icon text-[44px] text-forest">check_circle</span>
            </div>
            <h2 className="font-headline font-bold text-2xl text-forest">¡Pago exitoso!</h2>
            <p className="text-stone text-sm mt-2 leading-relaxed">
              Tu pedido fue procesado correctamente. El vendedor se comunicará contigo pronto.
            </p>
            <Button variant="primary" className="mt-6 w-full" onClick={onClose}>
              Volver al mercado
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes bounceIn { 0% { transform:scale(0) } 70% { transform:scale(1.15) } 100% { transform:scale(1) } }
      `}</style>
    </>
  );

  return createPortal(drawer, document.body);
}
