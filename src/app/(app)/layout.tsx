import { BottomNav } from "@/components/navigation/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full bg-cream">
      <div className="flex-1 flex flex-col min-h-0 relative">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
