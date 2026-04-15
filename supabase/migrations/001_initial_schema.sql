-- ============================================
-- AgroLink - Initial Database Schema
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    producer_type TEXT CHECK (producer_type IN (
        'ganadero_independiente',
        'agricultor_independiente',
        'empresa_agropecuaria',
        'cooperativa'
    )),
    location_city TEXT,
    location_department TEXT,
    location_country TEXT DEFAULT 'CO',
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    total_sales INTEGER DEFAULT 0,
    rating NUMERIC(2,1) DEFAULT 0.0,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. LIVESTOCK LISTINGS (Ganado)
-- ============================================
CREATE TABLE public.livestock_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    animal_type TEXT NOT NULL CHECK (animal_type IN (
        'bovino', 'porcino', 'equino', 'ovino', 'caprino', 'avicola'
    )),
    breed TEXT,
    units INTEGER NOT NULL DEFAULT 1,
    avg_weight_kg NUMERIC(8,2),
    avg_age_years NUMERIC(4,1),
    price NUMERIC(15,2) NOT NULL,
    price_unit TEXT DEFAULT 'total' CHECK (price_unit IN ('total', 'per_unit', 'per_kg')),
    is_certified BOOLEAN DEFAULT FALSE,
    health_certificates JSONB DEFAULT '[]'::jsonb,
    location_city TEXT,
    location_department TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'paused', 'draft')),
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_livestock_status ON public.livestock_listings(status);
CREATE INDEX idx_livestock_seller ON public.livestock_listings(seller_id);
CREATE INDEX idx_livestock_type ON public.livestock_listings(animal_type);

-- ============================================
-- 3. LIVESTOCK IMAGES
-- ============================================
CREATE TABLE public.livestock_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.livestock_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_livestock_images_listing ON public.livestock_images(listing_id);

-- ============================================
-- 4. LAND LISTINGS (Tierras)
-- ============================================
CREATE TABLE public.land_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    land_type TEXT NOT NULL CHECK (land_type IN ('agricola', 'ganadero', 'mixto', 'forestal')),
    listing_type TEXT DEFAULT 'venta' CHECK (listing_type IN ('venta', 'alquiler', 'ambos')),
    area_hectares NUMERIC(10,2) NOT NULL,
    price_per_hectare NUMERIC(15,2),
    total_price NUMERIC(18,2),
    soil_type TEXT,
    water_source TEXT,
    altitude_meters INTEGER,
    pasture_type TEXT,
    num_paddocks INTEGER,
    has_clear_deed BOOLEAN DEFAULT FALSE,
    location_city TEXT,
    location_department TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    cover_image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented', 'paused', 'draft')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_land_status ON public.land_listings(status);
CREATE INDEX idx_land_owner ON public.land_listings(owner_id);
CREATE INDEX idx_land_type ON public.land_listings(land_type);

-- ============================================
-- 5. LAND IMAGES
-- ============================================
CREATE TABLE public.land_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.land_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_land_images_listing ON public.land_images(listing_id);

-- ============================================
-- 6. SOIL ANALYSES (Análisis de Suelo IA)
-- ============================================
CREATE TABLE public.soil_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID NOT NULL REFERENCES public.land_listings(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.profiles(id),
    lot_name TEXT,
    ph_level NUMERIC(3,1),
    organic_matter_pct NUMERIC(4,1),
    nitrogen_ppm NUMERIC(6,1),
    phosphorus_ppm NUMERIC(6,1),
    potassium_ppm NUMERIC(6,1),
    ai_recommendation TEXT,
    estimated_yield_ton_ha NUMERIC(5,1),
    recommended_crops TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_soil_analyses_land ON public.soil_analyses(land_id);

-- ============================================
-- 7. TERRAIN MODELS (Modelos 3D)
-- ============================================
CREATE TABLE public.terrain_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES public.land_listings(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    polygon_geojson JSONB,
    area_hectares NUMERIC(10,2),
    thumbnail_url TEXT,
    model_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_terrain_models_land ON public.terrain_models(land_id);
CREATE INDEX idx_terrain_models_user ON public.terrain_models(created_by);

-- ============================================
-- 8. VETERINARIAN PROFILES
-- ============================================
CREATE TABLE public.veterinarian_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_title TEXT NOT NULL,
    years_experience INTEGER,
    consultation_price NUMERIC(12,2),
    total_consultations INTEGER DEFAULT 0,
    rating NUMERIC(2,1) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    profile_image_url TEXT,
    location_city TEXT,
    location_department TEXT,
    animal_specialization TEXT[],
    available_for_emergency BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vet_user ON public.veterinarian_profiles(user_id);
CREATE INDEX idx_vet_status ON public.veterinarian_profiles(status);

-- ============================================
-- 9. VET SPECIALTIES
-- ============================================
CREATE TABLE public.vet_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id) ON DELETE CASCADE,
    specialty TEXT NOT NULL,
    UNIQUE(vet_id, specialty)
);

CREATE INDEX idx_vet_specialties_vet ON public.vet_specialties(vet_id);

-- ============================================
-- 10. APPOINTMENTS (Citas)
-- ============================================
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id),
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    reason TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
    )),
    price NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_vet ON public.appointments(vet_id);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- ============================================
-- 11. VET REVIEWS
-- ============================================
CREATE TABLE public.vet_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vet_reviews_vet ON public.vet_reviews(vet_id);

-- ============================================
-- 12. CONVERSATIONS
-- ============================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    related_listing_type TEXT CHECK (related_listing_type IN ('livestock', 'land')),
    related_listing_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. CONVERSATION PARTICIPANTS
-- ============================================
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    unread_count INTEGER DEFAULT 0,
    last_read_at TIMESTAMPTZ,
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conv_participants_conv ON public.conversation_participants(conversation_id);

-- ============================================
-- 14. MESSAGES
-- ============================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- ============================================
-- 15. NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'alert_phytosanitary', 'price_change', 'vaccination',
        'irrigation', 'chat_message', 'appointment', 'system'
    )),
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    icon TEXT,
    related_entity_type TEXT,
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================
-- 16. FAVORITES
-- ============================================
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('livestock', 'land', 'vet')),
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- ============================================
-- 17. DASHBOARD METRICS
-- ============================================
CREATE TABLE public.dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    value NUMERIC(18,2) NOT NULL,
    unit TEXT,
    trend_pct NUMERIC(5,2),
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboard_metrics_user ON public.dashboard_metrics(user_id, metric_type);

-- ============================================
-- 18. TASKS
-- ============================================
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    related_entity_type TEXT,
    related_entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user ON public.tasks(user_id, status);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables that have the column
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.livestock_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.land_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.terrain_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.veterinarian_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dashboard_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ENABLE REALTIME for chat
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
