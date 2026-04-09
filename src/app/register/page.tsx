"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/ToastProvider";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [producerType, setProducerType] = useState("");
  const [loading, setLoading] = useState(false);

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !producerType) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    setLoading(true);
    showToast('Creando cuenta...', 'info');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            producer_type: producerType.toLowerCase().replace(/ /g, '_'),
          }
        }
      });

      if (error) throw error;

      showToast('¡Cuenta creada! Revisa tu correo', 'success');
      router.push('/login');
    } catch (error: any) {
      showToast(error.message || 'Error al registrarse', 'error');
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
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-stone cursor-pointer border-none bg-transparent">
                  <span className="material-symbols-outlined text-xl">{showPwd ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3 animate-up d3">
              <input type="checkbox" className="w-4 h-4 mt-0.5 accent-forest rounded"/>
              <p className="text-xs text-stone leading-relaxed">Acepto los <button type="button" className="text-forest font-semibold cursor-pointer border-none bg-transparent">Términos</button> y <button type="button" className="text-forest font-semibold cursor-pointer border-none bg-transparent">Privacidad</button></p>
            </div>
            <Button type="submit" className="w-full h-[52px] animate-up d4" disabled={loading}>
              {loading ? 'Creando...' : 'Crear cuenta'} <span className="material-symbols-outlined">check_circle</span>
            </Button>
          </form>
          <div className="text-center mt-5 text-sm animate-up d5">
            <span className="text-stone">¿Ya tienes cuenta? </span>
            <button onClick={() => router.push('/login')} className="text-forest font-semibold cursor-pointer border-none bg-transparent">Inicia sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
}
