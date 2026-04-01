"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVeterinarians } from "@/hooks/useVets";
import { VetCard } from "@/components/vets/VetCard";
import { Chip } from "@/components/ui/Chip";
import { showToast } from "@/components/ui/ToastProvider";

const CATEGORIES = ["Todos", "Bovinos", "Equinos", "Porcinos", "Caprinos", "Pequeños Animales"];

export default function VetsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { vets, loading, error } = useVeterinarians(selectedCategory);

  const handleBook = (vetId: string) => {
    showToast("Agendando cita...", "info");
    // Redirect to appointment creation or open modal
    router.push(`/vets/${vetId}/book`);
  };

  return (
    <div className="bg-cream h-full flex flex-col pt-0">
      <div className="px-5 pt-8 pb-4 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-forest/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline font-bold text-3xl text-forest">Salud Animal</h1>
            <p className="text-stone text-sm">Encuentra los mejores especialistas para tu hato</p>
          </div>
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-forest">
            <span className="material-symbols-outlined text-[24px]">local_hospital</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex-1 scroll-area p-5">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-forest">progress_activity</span>
              <p className="text-stone text-xs font-medium">Buscando especialistas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-center p-8 bg-white rounded-3xl border border-error/10">
            <p className="text-error font-medium">{error}</p>
          </div>
        ) : vets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
            <p className="text-stone font-medium">No se encontraron veterinarios en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vets.map((vet) => (
              <VetCard 
                key={vet.id} 
                vet={vet} 
                onClick={() => router.push(`/vets/${vet.id}`)}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
