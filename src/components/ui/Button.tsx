import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "amber" | "outline" | "glass" | "amber-light" | "ghost";
  children: ReactNode;
  loading?: boolean;
}

export function Button({ variant = "primary", children, className = "", loading, ...props }: ButtonProps) {
  const baseStyle = "flex items-center justify-center gap-[6px] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-forest text-white rounded-xl py-2.5 px-5 font-bold text-sm hover:bg-forest-mid shadow-sm",
    amber: "bg-amber text-white rounded-xl py-2.5 px-5 font-bold text-sm hover:bg-[#a86e22] shadow-sm",
    "amber-light": "bg-amber-light text-forest rounded-2xl font-bold text-lg h-14 shadow-sm",
    outline: "bg-transparent text-forest border-[1.5px] border-forest rounded-xl py-2 px-5 font-semibold text-sm hover:bg-forest/5",
    glass: "text-white border border-white/25 glass rounded-2xl font-semibold h-14 shadow-lg",
    ghost: "text-white/50 hover:text-white/80 text-sm h-11",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={loading || props.disabled} 
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="opacity-90">{typeof children === 'string' ? 'Espere...' : children}</span>
        </div>
      ) : children}
    </button>
  );
}
