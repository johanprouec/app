import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "amber" | "outline" | "glass" | "amber-light" | "ghost";
  children: ReactNode;
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const baseStyle = "flex items-center justify-center gap-[6px] transition-all active:scale-95 cursor-pointer";
  
  const variants = {
    primary: "bg-forest text-white rounded-xl py-2.5 px-5 font-bold text-sm hover:bg-forest-mid",
    amber: "bg-amber text-white rounded-xl py-2.5 px-5 font-bold text-sm hover:bg-[#a86e22]",
    "amber-light": "bg-amber-light text-forest rounded-2xl font-bold text-lg h-14",
    outline: "bg-transparent text-forest border-[1.5px] border-forest rounded-xl py-2 px-5 font-semibold text-sm hover:bg-forest/5",
    glass: "text-white border border-white/25 glass rounded-2xl font-semibold h-14",
    ghost: "text-white/50 hover:text-white/80 text-sm h-11",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
