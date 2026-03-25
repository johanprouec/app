"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function Onboarding() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-forest">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80" alt="Farm" className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(to top,rgba(0,45,28,.92) 0%,rgba(0,45,28,.35) 50%,transparent 100%)'}}></div>
      </div>
      <div className="absolute top-12 left-8 z-20 animate-up">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#b1f0ce33] border border-[#b1f0ce4d]">
            <span className="material-symbols-outlined fill-icon text-green-300 text-xl">eco</span>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-white leading-none">AgroLink</div>
            <div className="text-green-300 text-[9px] font-bold uppercase tracking-[.15em]">Ecosistema Agropecuario</div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-auto px-8 pb-16 w-full max-w-lg mx-auto">
        <div className="mb-10 animate-up d1">
          <h2 className="font-headline text-5xl font-bold text-white leading-[1.1]">
            Conecta con el campo.<br/><span className="text-amber-light">Digital.</span>
          </h2>
          <p className="text-white/70 mt-3 text-base leading-relaxed">Ganado, tierras, veterinarios y gestión agropecuaria en un solo ecosistema.</p>
        </div>
        <div className="flex flex-col gap-3 animate-up d2">
          <Button variant="amber-light" onClick={() => router.push('/register')} className="w-full text-forest">
            Comenzar gratis <span className="material-symbols-outlined">arrow_forward</span>
          </Button>
          <Button variant="glass" onClick={() => router.push('/login')} className="w-full">
            Iniciar sesión
          </Button>
          <Button variant="ghost" onClick={() => router.push('/home')} className="w-full">
            <span className="material-symbols-outlined text-base">explore</span> Explorar sin cuenta
          </Button>
        </div>
        <div className="mt-10 flex items-center justify-between animate-up d3">
          <div className="flex gap-2">
            <div className="w-8 h-1.5 rounded-full bg-amber-light"></div>
            <div className="w-2 h-1.5 rounded-full bg-white/25"></div>
            <div className="w-2 h-1.5 rounded-full bg-white/25"></div>
          </div>
          <span className="text-white/30 text-xs uppercase tracking-widest">v2.4.0</span>
        </div>
      </div>
    </div>
  );
}
