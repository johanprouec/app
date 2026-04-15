import { VetProfile } from "@/hooks/useVets";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

interface VetCardProps {
  vet: VetProfile;
  onClick?: () => void;
  onBook?: (vetId: string) => void;
}

export function VetCard({ vet, onClick, onBook }: VetCardProps) {
  const adminName = vet.user ? `${vet.user.first_name} ${vet.user.last_name}` : "Veterinario";
  const initials = vet.user ? `${vet.user.first_name.charAt(0)}${vet.user.last_name.charAt(0)}` : "V";

  return (
    <Card className="p-4 flex flex-col gap-4" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold text-lg border border-forest/20 overflow-hidden">
          {vet.profile_image_url ? (
            <img src={vet.profile_image_url} alt={adminName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg text-forest truncate">{adminName}</h3>
            {vet.is_verified && (
              <span className="material-symbols-outlined text-amber text-[18px]">verified</span>
            )}
          </div>
          <p className="text-xs text-stone font-medium uppercase tracking-wider">{vet.professional_title}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-amber text-[14px] fill-icon">star</span>
            <span className="text-sm font-bold text-forest">{vet.rating}</span>
            <span className="text-[10px] text-stone">({vet.total_consultations} visitas)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {vet.specialties?.slice(0, 3).map((s, i) => (
          <Chip key={i} className="!bg-cream !text-forest border border-forest/10 normal-case">
            {s.specialty}
          </Chip>
        ))}
      </div>

      <div className="border-t border-forest/5 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-stone uppercase font-bold">Desde</p>
            <p className="text-lg font-headline font-bold text-forest">
              ${vet.consultation_price?.toLocaleString() || "0"}
            </p>
          </div>
          {vet.available_for_emergency && (
            <div className="flex items-center gap-1 text-error">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              </span>
              <span className="text-[10px] font-bold uppercase">Emergencias</span>
            </div>
          )}
        </div>
        <Button 
          variant="amber" 
          className="w-full justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onBook?.(vet.id);
          }}
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Agendar Cita
        </Button>
      </div>
    </Card>
  );
}
