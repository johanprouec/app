import { ReactNode } from "react";

export function Chip({ children, className = "", selected, onClick }: { children: ReactNode, className?: string, selected?: boolean, onClick?: () => void }) {
  const base = "inline-flex items-center gap-[4px] py-[3px] px-[10px] rounded-[20px] text-[11px] font-bold tracking-[0.05em] uppercase flex-shrink-0 cursor-pointer";
  
  // If selected is explicitly boolean, apply distinct classes. Otherwise use className.
  const stateClass = selected === true ? "bg-forest text-white" : selected === false ? "bg-white text-stone" : "";
  
  return (
    <span onClick={onClick} className={`${base} ${stateClass} ${className}`}>
      {children}
    </span>
  );
}
