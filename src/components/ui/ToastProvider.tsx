"use client";
import { useEffect, useState } from "react";

export function ToastProvider() {
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info' | 'error'} | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleToast = (e: CustomEvent) => {
      setToast(e.detail);
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 2500);
      setTimeout(() => setToast(null), 2900);
    };
    window.addEventListener("showToast", handleToast as EventListener);
    return () => window.removeEventListener("showToast", handleToast as EventListener);
  }, []);

  if (!toast) return null;

  const colors = {
    success: 'bg-forest text-white',
    info: 'bg-amber text-white',
    error: 'bg-error text-white'
  };
  const icons = {
    success: 'check_circle',
    info: 'info',
    error: 'error'
  };

  return (
    <div 
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] py-2.5 px-5 rounded-[20px] text-[13px] font-semibold flex items-center gap-2 shadow-[0_8px_24px_rgba(0,45,28,0.18)] transition-opacity duration-400 pointer-events-none ${colors[toast.type]} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="material-symbols-outlined fill-icon text-[18px]">{icons[toast.type]}</span>
      {toast.msg}
    </div>
  );
}

export const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("showToast", { detail: { msg, type } }));
  }
};
