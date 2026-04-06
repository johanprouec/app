"use client";
import { useRouter, usePathname } from "next/navigation";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide BottomNav on these specific routes based on the original template
  const hiddenPaths = ['/chat', '/panel', '/notif'];
  const isHidden = hiddenPaths.some(p => pathname?.startsWith(p)) || (pathname?.startsWith('/vets/') && pathname !== '/vets');
  if (isHidden) return null;

  const links = [
    { name: "Inicio", path: "/home", icon: "home", fill: true },
    { name: "Ganado", path: "/ganado", icon: "hive", fill: true },
    { name: "Tierras", path: "/tierras", icon: "landscape", fill: true },
    { name: "Vets", path: "/vets", icon: "medical_services", fill: true },
    { name: "Perfil", path: "/profile", icon: "person", fill: true },
  ];

  return (
    <nav className="botnav flex-shrink-0 flex items-end justify-around px-2 pt-1 pb-safe z-20 relative">
      {links.map(link => {
        const isActive = pathname?.startsWith(link.path);
        
        return (
          <button 
            key={link.path} 
            className={`nav-btn ${isActive ? 'active' : ''} flex flex-col items-center gap-[2px] flex-1 py-1.5 px-1 cursor-pointer border-none bg-transparent`} 
            onClick={() => router.push(link.path)}
          >
            <div className={`npill w-10 h-7 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-forest' : ''}`}>
              <span className={`material-symbols-outlined ni text-[22px] transition-colors duration-200 ${isActive && link.fill ? 'fill-icon text-white' : 'text-stone'}`}>
                {link.icon}
              </span>
            </div>
            <span className={`nl text-[9px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap transition-colors duration-200 ${isActive ? 'text-forest' : 'text-stone'}`}>
              {link.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
