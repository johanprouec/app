"use client";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";

export default function Vets() {
  const router = useRouter();

  return (
    <>
      <TopNav 
        title="Servicios Especializados" 
        subtitle="Red certificada de profesionales agropecuarios"
        rightAction={
          <Button variant="amber" className="!py-2 !px-4 !text-sm" onClick={() => showToast('Agendando cita...','info')}>
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span> Agendar
          </Button>
        } 
      />
      <div className="scroll-area">
        <div className="px-5 pt-4 pb-4 space-y-4">
          <div className="field flex items-center gap-3 px-4 h-11 animate-up">
            <span className="material-symbols-outlined text-stone text-[20px]">search</span>
            <input type="text" placeholder="Buscar veterinario o especialidad..." className="flex-1 bg-transparent text-sm text-forest w-full"/>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 animate-up d1" style={{scrollbarWidth:'none'}}>
            {['Todos', 'Bovinos', 'Porcinos', 'Equinos', 'Aves', 'Nutrición'].map((f, i) => (
              <Chip key={f} selected={i === 0}>{f}</Chip>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card className="overflow-hidden animate-up d1">
              <div className="h-48 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80" className="w-full h-full object-cover"/>
                <div className="vet-badge">VETERINARIO · BOVINOS</div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-forest">Dr. Carlos Mendoza</h3>
                    <p className="text-xs text-stone flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>Ibagué, CO</p>
                    <p className="text-xs text-stone mt-1">⭐ 4.9 · 124 consultas · 8 años exp.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-lg text-amber">$120K</p>
                    <p className="text-[10px] text-stone">/consulta</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Chip selected={false} className="!text-[9px] !bg-sage-light !text-forest">Vacunación</Chip>
                  <Chip selected={false} className="!text-[9px] !bg-sage-light !text-forest">Cirugía</Chip>
                  <Chip selected={false} className="!text-[9px] !bg-sage-light !text-forest">Reproducción</Chip>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="flex-1 justify-center !text-sm !py-2" onClick={() => router.push('/chat/3')}><span className="material-symbols-outlined text-[15px]">chat</span> Consultar</Button>
                  <Button variant="amber" className="flex-1 justify-center !text-sm !py-2" onClick={() => showToast('Cita agendada ✓','success')}>Agendar</Button>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden animate-up d2">
              <div className="h-48 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80" className="w-full h-full object-cover"/>
                <div className="vet-badge">VETERINARIA · PORCINOS</div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-forest">Dra. Laura Restrepo</h3>
                    <p className="text-xs text-stone flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>Medellín, CO</p>
                    <p className="text-xs text-stone mt-1">⭐ 4.8 · 89 consultas · 5 años exp.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-lg text-amber">$95K</p>
                    <p className="text-[10px] text-stone">/consulta</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Chip selected={false} className="!text-[9px] !bg-sage-light !text-forest">Nutrición</Chip>
                  <Chip selected={false} className="!text-[9px] !bg-sage-light !text-forest">Diagnóstico</Chip>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="flex-1 justify-center !text-sm !py-2" onClick={() => router.push('/chat/4')}><span className="material-symbols-outlined text-[15px]">chat</span> Consultar</Button>
                  <Button variant="amber" className="flex-1 justify-center !text-sm !py-2" onClick={() => showToast('Cita agendada ✓','success')}>Agendar</Button>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden animate-up d3">
              <div className="h-48 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80" className="w-full h-full object-cover"/>
                <div className="vet-badge">VETERINARIO · EQUINOS</div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-forest">Dr. Andrés Vargas</h3>
                    <p className="text-xs text-stone flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined fill-icon text-[13px] text-error">location_on</span>Tunja, CO</p>
                    <p className="text-xs text-stone mt-1">⭐ 4.7 · 56 consultas · 12 años exp.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-lg text-amber">$180K</p>
                    <p className="text-[10px] text-stone">/consulta</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Chip selected={false} className="!text-[9px] !bg-sage-light !text-forest">Ortopedia</Chip>
                  <Chip selected={false} className="!text-[9px] !bg-sage-light !text-forest">Podología</Chip>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="flex-1 justify-center !text-sm !py-2" onClick={() => router.push('/chat/5')}><span className="material-symbols-outlined text-[15px]">chat</span> Consultar</Button>
                  <Button variant="amber" className="flex-1 justify-center !text-sm !py-2" onClick={() => showToast('Cita agendada ✓','success')}>Agendar</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
