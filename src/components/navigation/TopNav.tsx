import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";

interface TopNavProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
  isHome?: boolean;
  centered?: boolean;
}

export function TopNav({ title, subtitle, showBack, backTo, rightAction, isHome, centered }: TopNavProps) {
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const { user, profile } = useCurrentUserProfile();

  const handleBack = () => {
    if (backTo) router.push(backTo);
    else router.back();
  };

  if (isHome) {
    return (
      <div className="topnav px-5 py-3 flex items-center justify-between flex-shrink-0 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-forest">
            <span className="material-symbols-outlined fill-icon text-green-300 text-[16px]">eco</span>
          </div>
          <div>
            <div className="font-headline font-bold text-forest text-base leading-none">AgroLink</div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-stone">Ecosistemas Agro.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={user ? "/chat" : "/login?next=/chat"} className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center relative cursor-pointer hover:bg-[#e2ddd5] transition-colors">
            <span className="material-symbols-outlined text-forest text-[20px]">chat</span>
          </Link>
          <Link href={user ? "/notif" : "/login?next=/notif"} className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center relative cursor-pointer hover:bg-[#e2ddd5] transition-colors">
            <span className="material-symbols-outlined text-forest text-[20px]">notifications</span>
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-cream animate-pulse"></span>}
          </Link>
          <Link href={user ? "/profile" : "/login"} className="w-9 h-9 rounded-full bg-forest flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-forest-mid transition-colors">
            {user ? profile.initials : "IN"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="topnav px-5 py-3.5 flex items-center justify-between flex-shrink-0 z-20 relative gap-3">
      {showBack && (
         <button onClick={handleBack} className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-cream-dark transition-colors cursor-pointer flex-shrink-0">
           <span className="material-symbols-outlined text-forest">arrow_back</span>
         </button>
      )}
      
      {typeof title === 'string' ? (
        <div className={centered ? "text-center flex-1" : "flex-1"}>
          <h2 className={`font-headline font-bold text-xl text-forest ${centered ? 'text-base' : ''}`}>{title}</h2>
          {subtitle && (
             typeof subtitle === 'string' ? 
               <p className={`text-stone ${centered ? 'text-[9px] uppercase tracking-wider' : 'text-xs'}`}>{subtitle}</p> :
               subtitle
          )}
        </div>
      ) : (
        <div className={centered ? "text-center flex-1" : "flex-1"}>
          {title}
          {subtitle}
        </div>
      )}
      
      {rightAction && <div className="flex gap-2 min-w-0 flex-shrink-0">{rightAction}</div>}
    </div>
  );
}
