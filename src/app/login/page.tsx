"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  
  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    setLoading(true);
    showToast('Iniciando sesión...', 'info');
    
    try {
      const { error } = await signIn(email, password);

      if (error) {
        showToast(error.message, "error");
      } else {
        // Asegurar que la sesión se sincronice antes de redirigir
        const supabase = getSupabase();
        await supabase.auth.getSession();
        
        showToast("¡Bienvenido!", "success");
        
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next') || '/home';
        router.push(next);
      }
    } catch (error: any) {
      showToast(error.message || 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream h-full flex flex-col">
      <div className="scroll-area">
        <div className="max-w-md mx-auto px-6 pt-16 pb-10">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-stone mb-8 text-sm font-medium active:opacity-60 cursor-pointer border-none bg-transparent">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Volver
          </button>
          <div className="mb-8 animate-up">
            <h2 className="font-headline text-4xl font-bold text-forest leading-tight">Bienvenido<br/>de vuelta.</h2>
            <p className="text-stone mt-2 text-sm">Accede a tu ecosistema agropecuario.</p>
          </div>
          <form className="space-y-4" onSubmit={doLogin}>
            <div className="animate-up d1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone mb-1.5 block">Correo</label>
              <div className="field flex items-center gap-3 px-4 h-[52px]">
                <span className="material-symbols-outlined text-stone text-xl">mail</span>
                <input 
                  type="email" 
                  placeholder="tu@correo.com" 
                  className="flex-1 bg-transparent text-forest text-sm py-3.5 w-full outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="animate-up d2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone mb-1.5 block">Contraseña</label>
              <div className="field flex items-center gap-3 px-4 h-[52px]">
                <span className="material-symbols-outlined text-stone text-xl">lock</span>
                <input 
                  type={showPwd ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="flex-1 bg-transparent text-forest text-sm py-3.5 w-full outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-stone cursor-pointer border-none bg-transparent">
                  <span className="material-symbols-outlined text-xl">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="text-right animate-up d2">
              <button type="button" className="text-amber text-sm font-semibold cursor-pointer border-none bg-transparent">¿Olvidaste tu contraseña?</button>
            </div>
            <button type="submit" disabled={loading} className="bg-forest text-white rounded-xl py-2.5 px-5 font-bold text-sm hover:bg-forest-mid w-full flex justify-center items-center gap-2 h-[52px] animate-up d3 cursor-pointer disabled:opacity-60">
              {loading ? 'Cargando...' : 'Iniciar sesión'} <span className="material-symbols-outlined">login</span>
            </button>
          </form>
          <div className="text-center mt-6 text-sm animate-up d4">
            <span className="text-stone">¿No tienes cuenta? </span>
            <button onClick={() => router.push('/register')} className="text-forest font-semibold cursor-pointer border-none bg-transparent">Regístrate</button>
          </div>
          <div className="flex items-center gap-4 my-6 animate-up d4">
            <div className="flex-1 h-px bg-stone/20"></div><span className="text-stone text-xs">o continúa con</span><div className="flex-1 h-px bg-stone/20"></div>
          </div>
          <div className="flex gap-3 animate-up d5">
            <button type="button" onClick={() => showToast('Login con Google aún no está configurado', 'info')} className="flex-1 h-11 bg-white rounded-[16px] border border-[rgba(0,45,28,0.07)] flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_12px_32px_rgba(0,45,28,0.1)] transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" onClick={() => showToast('Login con Apple aún no está configurado', 'info')} className="flex-1 h-11 bg-white rounded-[16px] border border-[rgba(0,45,28,0.07)] flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_12px_32px_rgba(0,45,28,0.1)] transition-all">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-3.55 2.317-5.43 4.6-5.43 1.248 0 2.304.82 3.29.82.943 0 2.41-.87 3.85-.87.609 0 2.76.06 4.188 2.1l-.716.43z"/></svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
