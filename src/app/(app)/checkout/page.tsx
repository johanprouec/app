"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/ToastProvider";
import { useCart } from "@/hooks/useCart";

const SHIPPING_OPTIONS = [
  { id: "estandar", label: "Envio estandar", description: "Entrega en 3 a 5 dias habiles", fee: 18000 },
  { id: "express", label: "Envio express", description: "Entrega prioritaria en 24 a 48 horas", fee: 32000 },
  { id: "refrigerado", label: "Envio refrigerado", description: "Cadena de frio y manejo especial", fee: 48000 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, clearCart } = useCart();
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [shippingType, setShippingType] = useState(SHIPPING_OPTIONS[0].id);
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const shippingFee = useMemo(
    () => SHIPPING_OPTIONS.find((option) => option.id === shippingType)?.fee ?? SHIPPING_OPTIONS[0].fee,
    [shippingType]
  );
  const commission = useMemo(() => Math.round(total * 0.035), [total]);
  const grandTotal = total + shippingFee + commission;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!items.length) {
      showToast("Tu carrito esta vacio", "error");
      return;
    }

    if (!cardName || cardNumber.replace(/\s/g, "").length < 16 || expiry.length < 5 || cvv.length < 3) {
      showToast("Completa correctamente los datos de la tarjeta", "error");
      return;
    }

    if (!department || !city || !address || !phone) {
      showToast("Completa la ubicacion y direccion de envio", "error");
      return;
    }

    if (!acceptPolicy) {
      showToast("Debes aceptar la politica de compra para continuar.", "error");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setOrderCreated(true);
    setLoading(false);
    await clearCart();
    showToast("Solicitud de compra registrada. Queda pendiente de confirmar el pago.", "success");
  };

  return (
    <div className="flex h-full flex-col bg-cream">
      <TopNav
        title="Checkout"
        subtitle={`${count} item${count === 1 ? "" : "s"} listos para pago`}
        showBack
      />

      <div className="scroll-area">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 pb-28 pt-5 lg:flex-row">
          <form id="checkout-form" onSubmit={handleSubmit} className="flex-1 space-y-5">
            <section className="animate-up rounded-[28px] bg-gradient-to-br from-forest via-forest-mid to-[#2d6b4a] p-6 text-white shadow-editorial">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-green-200/80">Checkout provisional</p>
                  <h1 className="mt-2 font-headline text-4xl font-bold leading-tight">Finaliza tu solicitud de compra en AgroLink</h1>
                  <p className="mt-3 max-w-xl text-sm text-green-100/80">
                    Revisa el monto total, define el tipo de envio y deja lista la informacion para confirmar el pago mas adelante.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 text-right backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-green-100/70">Monto estimado</p>
                  <p className="mt-2 font-headline text-4xl font-bold">{formatPrice(grandTotal)}</p>
                </div>
              </div>
            </section>

            {orderCreated && (
              <Card className="animate-up d1 border-forest/10 bg-white p-5 shadow-editorial">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Estado de la solicitud</p>
                    <h2 className="mt-1 font-headline text-2xl font-bold text-forest">Pendiente de pago</h2>
                    <p className="mt-2 text-sm text-stone">
                      Tu solicitud de compra quedó registrada en la app y el pago se confirmará cuando activemos la pasarela.
                    </p>
                  </div>
                  <span className="rounded-full bg-sage-light/30 px-3 py-1 text-xs font-bold text-forest">LISTA</span>
                </div>
              </Card>
            )}

            <Card className="animate-up d1 overflow-hidden border-forest/5 bg-white p-5 shadow-editorial">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Tarjeta</p>
                  <h2 className="font-headline text-2xl font-bold text-forest">Datos del pago</h2>
                </div>
                <span className="material-symbols-outlined rounded-full bg-amber-pale p-3 text-amber">credit_card</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">Nombre en la tarjeta</span>
                  <div className="field px-4 py-3">
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Como aparece en la tarjeta"
                      className="w-full bg-transparent text-sm text-forest"
                    />
                  </div>
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">Numero de tarjeta</span>
                  <div className="field px-4 py-3">
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      className="w-full bg-transparent text-sm tracking-[0.24em] text-forest"
                    />
                  </div>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">Vencimiento</span>
                  <div className="field px-4 py-3">
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      inputMode="numeric"
                      className="w-full bg-transparent text-sm text-forest"
                    />
                  </div>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">CVV</span>
                  <div className="field px-4 py-3">
                    <input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      inputMode="numeric"
                      className="w-full bg-transparent text-sm text-forest"
                    />
                  </div>
                </label>

                <div className="rounded-2xl bg-amber-pale p-4 md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber">Nota</p>
                  <p className="mt-2 text-sm text-forest">
                    Los datos de tarjeta se usan aqui solo para dejar listo el flujo visual mientras activamos la pasarela de pago real.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="animate-up d2 border-forest/5 bg-white p-5 shadow-editorial">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Envio</p>
                  <h2 className="font-headline text-2xl font-bold text-forest">Tipo y ubicacion de entrega</h2>
                </div>
                <span className="material-symbols-outlined rounded-full bg-sage-light/40 p-3 text-forest">local_shipping</span>
              </div>

              <div className="grid gap-3">
                {SHIPPING_OPTIONS.map((option) => {
                  const active = option.id === shippingType;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setShippingType(option.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-forest bg-forest text-white shadow-editorial"
                          : "border-stone/10 bg-cream hover:border-forest/30 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`font-semibold ${active ? "text-white" : "text-forest"}`}>{option.label}</p>
                          <p className={`mt-1 text-sm ${active ? "text-green-100/80" : "text-stone"}`}>{option.description}</p>
                        </div>
                        <p className={`text-sm font-bold ${active ? "text-amber-light" : "text-amber"}`}>{formatPrice(option.fee)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">Departamento</span>
                  <div className="field px-4 py-3">
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Ej. Antioquia"
                      className="w-full bg-transparent text-sm text-forest"
                    />
                  </div>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">Ciudad o municipio</span>
                  <div className="field px-4 py-3">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Medellin"
                      className="w-full bg-transparent text-sm text-forest"
                    />
                  </div>
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">Direccion de envio</span>
                  <div className="field px-4 py-3">
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Vereda, finca, barrio o direccion exacta"
                      className="w-full bg-transparent text-sm text-forest"
                    />
                  </div>
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">Referencia adicional</span>
                  <div className="field px-4 py-3">
                    <textarea
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Punto de referencia, instrucciones para el conductor o datos del predio"
                      rows={3}
                      className="w-full resize-none bg-transparent text-sm text-forest"
                    />
                  </div>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone">Telefono de contacto</span>
                  <div className="field px-4 py-3">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. 3001234567"
                      className="w-full bg-transparent text-sm text-forest"
                    />
                  </div>
                </label>
              </div>
            </Card>

            <Card className="animate-up d3 border-forest/5 bg-white p-5 shadow-editorial">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Confirmacion</p>
                  <h2 className="font-headline text-2xl font-bold text-forest">Aceptacion de compra</h2>
                </div>
                <span className="material-symbols-outlined rounded-full bg-amber-pale p-3 text-amber">verified_user</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 rounded-2xl border border-stone/10 bg-cream p-4">
                  <input
                    type="checkbox"
                    checked={acceptPolicy}
                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-forest">
                    Confirmo que la informacion de contacto, envio y monto estimado de esta compra es correcta y acepto continuar con una solicitud pendiente de pago.
                  </span>
                </label>

                <p className="text-xs text-stone">
                  Esta confirmacion permite probar el flujo completo de checkout sin depender todavia de una pasarela externa.
                </p>
              </div>
            </Card>

            <div className="animate-up d3 lg:hidden">
              <Button type="submit" variant="amber" loading={loading} className="h-14 w-full text-base">
                Confirmar solicitud
              </Button>
            </div>
          </form>

          <aside className="animate-up d3 w-full flex-shrink-0 lg:sticky lg:top-5 lg:max-w-md">
            <Card className="overflow-hidden border-forest/5 bg-white shadow-editorial">
              <div className="border-b border-stone/10 bg-cream px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Resumen</p>
                <h2 className="font-headline text-2xl font-bold text-forest">Pedido actual</h2>
              </div>

              <div className="max-h-[320px] space-y-3 overflow-y-auto px-5 py-4">
                {items.length ? (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-2xl border border-stone/10 bg-[#fcfaf6] p-3">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-cream-dark">
                        <img
                          src={item.cover_image_url || "https://images.unsplash.com/photo-1595856454070-5bfa9b8cc5cc?w=200&q=80"}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-forest">{item.title}</p>
                        <p className="mt-1 text-xs text-stone">Cantidad: {item.quantity}</p>
                        <p className="mt-2 text-sm font-bold text-forest">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-stone/20 bg-cream px-4 py-6 text-center text-sm text-stone">
                    Tu carrito no tiene productos. Vuelve a catalogo para agregar articulos antes de pagar.
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-stone/10 px-5 py-5">
                <div className="flex items-center justify-between text-sm text-stone">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-stone">
                  <span>Envio</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-stone">
                  <span>Comision</span>
                  <span>{formatPrice(commission)}</span>
                </div>
                <div className="rounded-2xl bg-forest px-4 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.2em] text-green-200/70">Total</span>
                    <span className="font-headline text-3xl font-bold">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <Button form="checkout-form" type="submit" variant="amber" loading={loading} className="hidden h-14 w-full text-base lg:flex">
                  Confirmar solicitud
                </Button>
                <button
                  type="button"
                  onClick={() => router.push("/ganado")}
                  className="w-full text-sm font-semibold text-forest underline decoration-stone/40 underline-offset-4"
                >
                  Seguir comprando
                </button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
