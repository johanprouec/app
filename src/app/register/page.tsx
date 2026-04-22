"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/ToastProvider";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Register() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [producerType, setProducerType] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp, signInWithOAuth } = useAuth();

  const getRegisterErrorMessage = (message?: string) => {
    if (!message) return "Error al registrarse";

    if (message.toLowerCase().includes("email rate limit exceeded")) {
      return "Ya enviamos demasiados correos de verificacion en poco tiempo. Espera unos minutos, revisa tu bandeja o intenta entrar con Google.";
    }

    return message;
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !producerType) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }
    
    if (!acceptedTerms) {
      showToast('Debes aceptar los términos para continuar', 'error');
      return;
    }

    setLoading(true);
    showToast('Creando cuenta...', 'info');

    try {
      const { error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        producer_type: producerType,
      });

      if (error) throw error;

      showToast('¡Cuenta creada! Revisa tu correo o inicia sesión', 'success');
      router.push('/login');
    } catch (error: any) {
      showToast(getRegisterErrorMessage(error?.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithOAuth("google", "/home");
      if (error) throw error;
    } catch (error: any) {
      showToast(error.message || "No pudimos continuar con Google", "error");
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
            <Chip className="mb-3 !bg-sage-light !text-forest" selected={false}><span className="material-symbols-outlined fill-icon text-[13px]">eco</span> Nuevo productor</Chip>
            <h2 className="font-headline text-4xl font-bold text-forest">Crea tu<br/>cuenta.</h2>
          </div>
          <form className="space-y-4" onSubmit={doRegister}>
            <div className="grid grid-cols-2 gap-3 animate-up d1">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone mb-1.5 block">Nombre</label>
                <div className="field flex items-center px-4 h-12">
                  <input 
                    type="text" 
                    placeholder="Carlos" 
                    className="flex-1 bg-transparent text-sm text-forest py-3 w-full outline-none"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone mb-1.5 block">Apellido</label>
                <div className="field flex items-center px-4 h-12">
                  <input 
                    type="text" 
                    placeholder="López" 
                    className="flex-1 bg-transparent text-sm text-forest py-3 w-full outline-none"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="animate-up d2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone mb-1.5 block">Correo electrónico</label>
              <div className="field flex items-center gap-3 px-4 h-12">
                <span className="material-symbols-outlined text-stone text-xl">mail</span>
                <input 
                  type="email" 
                  placeholder="tu@correo.com" 
                  className="flex-1 bg-transparent text-sm text-forest py-3 w-full outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="animate-up d2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone mb-1.5 block">Tipo de productor</label>
              <div className="field flex items-center gap-3 px-4 h-12">
                <span className="material-symbols-outlined text-stone text-xl">agriculture</span>
                <select 
                  className="flex-1 bg-transparent text-sm text-forest py-3 outline-none appearance-none w-full"
                  value={producerType}
                  onChange={(e) => setProducerType(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">Selecciona...</option>
                  <option value="ganadero_independiente">Ganadero independiente</option>
                  <option value="agricultor_independiente">Agricultor independiente</option>
                  <option value="empresa_agropecuaria">Empresa agropecuaria</option>
                  <option value="cooperativa">Cooperativa</option>
                </select>
              </div>
            </div>
            <div className="animate-up d3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone mb-1.5 block">Contraseña</label>
              <div className="field flex items-center gap-3 px-4 h-12">
                <span className="material-symbols-outlined text-stone text-xl">lock</span>
                <input 
                  type={showPwd ? "text" : "password"} 
                  placeholder="Mín. 8 caracteres" 
                  className="flex-1 bg-transparent text-sm text-forest py-3 w-full outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-stone cursor-pointer border-none bg-transparent">
                  <span className="material-symbols-outlined text-xl">{showPwd ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3 animate-up d3">
              <input type="checkbox" className="w-4 h-4 mt-0.5 accent-forest rounded" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}/>
              <p className="text-xs text-stone leading-relaxed">Acepto los <button type="button" className="text-forest font-semibold cursor-pointer border-none bg-transparent">Términos</button> y <button type="button" className="text-forest font-semibold cursor-pointer border-none bg-transparent">Privacidad</button></p>
            </div>
            <Button type="submit" className="w-full h-[52px] animate-up d4" disabled={loading}>
              {loading ? 'Creando...' : 'Crear cuenta'} <span className="material-symbols-outlined">check_circle</span>
            </Button>
          </form>
          <div className="flex items-center gap-4 my-6 animate-up d5">
            <div className="flex-1 h-px bg-stone/20"></div><span className="text-stone text-xs">o continúa con</span><div className="flex-1 h-px bg-stone/20"></div>
          </div>
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full h-11 bg-white rounded-[16px] border border-[rgba(0,45,28,0.07)] flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_12px_32px_rgba(0,45,28,0.1)] transition-all disabled:opacity-60 disabled:transform-none animate-up d5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>
          <div className="text-center mt-5 text-sm animate-up d5">
            <span className="text-stone">¿Ya tienes cuenta? </span>
            <button onClick={() => router.push('/login')} className="text-forest font-semibold cursor-pointer border-none bg-transparent">Inicia sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
}
