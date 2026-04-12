import { ReactNode } from "react";

export function Card({ children, className = "", onClick }: { children: ReactNode, className?: string, onClick?: () => void }) {
  const hasBg = className.includes("bg-");
  const base = `${hasBg ? "" : "bg-white"} rounded-[16px] border border-[rgba(0,45,28,0.07)] transition-all duration-200`;
  const hoverClasses = onClick ? "hover:-translate-y-[2px] hover:shadow-[0_12px_32px_rgba(0,45,28,0.1)] cursor-pointer" : "";
  
  return (
    <div onClick={onClick} className={`${base} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}
