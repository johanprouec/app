-- ============================================
-- AgroLink - Veterinary Services Extension
-- ============================================

-- 1. Create Veterinary Services table
CREATE TABLE public.veterinary_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2),
    duration_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add service_id to Appointments
ALTER TABLE public.appointments ADD COLUMN service_id UUID REFERENCES public.veterinary_services(id) ON DELETE SET NULL;

-- 3. Enable RLS
ALTER TABLE public.veterinary_services ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "vet_services_select_all" ON public.veterinary_services
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "vet_services_manage_own" ON public.veterinary_services
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.veterinarian_profiles
            WHERE id = vet_id AND user_id = auth.uid()
        )
    );

-- 5. Trigger for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.veterinary_services 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 6. Add indexes
CREATE INDEX idx_vet_services_vet ON public.veterinary_services(vet_id);
CREATE INDEX idx_appointments_service ON public.appointments(service_id);
