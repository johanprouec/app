-- ============================================
-- AgroLink - Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terrain_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
-- Anyone authenticated can view basic profile info (for seller/owner/vet display)
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT TO authenticated USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Profile insert is handled by the trigger, but allow direct insert for auth flow
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================
-- LIVESTOCK LISTINGS
-- ============================================
-- Anyone authenticated can view active listings
CREATE POLICY "livestock_select_active" ON public.livestock_listings
    FOR SELECT TO authenticated USING (status = 'active' OR seller_id = auth.uid());

-- Only owner can insert
CREATE POLICY "livestock_insert_own" ON public.livestock_listings
    FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());

-- Only owner can update
CREATE POLICY "livestock_update_own" ON public.livestock_listings
    FOR UPDATE TO authenticated USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

-- Only owner can delete
CREATE POLICY "livestock_delete_own" ON public.livestock_listings
    FOR DELETE TO authenticated USING (seller_id = auth.uid());

-- ============================================
-- LIVESTOCK IMAGES
-- ============================================
CREATE POLICY "livestock_images_select" ON public.livestock_images
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.livestock_listings
            WHERE id = listing_id AND (status = 'active' OR seller_id = auth.uid())
        )
    );

CREATE POLICY "livestock_images_insert" ON public.livestock_images
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.livestock_listings
            WHERE id = listing_id AND seller_id = auth.uid()
        )
    );

CREATE POLICY "livestock_images_delete" ON public.livestock_images
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.livestock_listings
            WHERE id = listing_id AND seller_id = auth.uid()
        )
    );

-- ============================================
-- LAND LISTINGS
-- ============================================
CREATE POLICY "land_select_active" ON public.land_listings
    FOR SELECT TO authenticated USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "land_insert_own" ON public.land_listings
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "land_update_own" ON public.land_listings
    FOR UPDATE TO authenticated USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "land_delete_own" ON public.land_listings
    FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================
-- LAND IMAGES
-- ============================================
CREATE POLICY "land_images_select" ON public.land_images
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.land_listings
            WHERE id = listing_id AND (status = 'active' OR owner_id = auth.uid())
        )
    );

CREATE POLICY "land_images_insert" ON public.land_images
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.land_listings
            WHERE id = listing_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "land_images_delete" ON public.land_images
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.land_listings
            WHERE id = listing_id AND owner_id = auth.uid()
        )
    );

-- ============================================
-- SOIL ANALYSES
-- ============================================
CREATE POLICY "soil_select_own" ON public.soil_analyses
    FOR SELECT TO authenticated USING (
        requested_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.land_listings
            WHERE id = land_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "soil_insert_own" ON public.soil_analyses
    FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());

-- ============================================
-- TERRAIN MODELS
-- ============================================
CREATE POLICY "terrain_select_own" ON public.terrain_models
    FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "terrain_insert_own" ON public.terrain_models
    FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "terrain_update_own" ON public.terrain_models
    FOR UPDATE TO authenticated USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "terrain_delete_own" ON public.terrain_models
    FOR DELETE TO authenticated USING (created_by = auth.uid());

-- ============================================
-- VETERINARIAN PROFILES
-- ============================================
-- Everyone can view active vet profiles
CREATE POLICY "vet_select_active" ON public.veterinarian_profiles
    FOR SELECT TO authenticated USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "vet_insert_own" ON public.veterinarian_profiles
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "vet_update_own" ON public.veterinarian_profiles
    FOR UPDATE TO authenticated USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- VET SPECIALTIES
-- ============================================
CREATE POLICY "vet_specialties_select" ON public.vet_specialties
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "vet_specialties_manage" ON public.vet_specialties
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.veterinarian_profiles
            WHERE id = vet_id AND user_id = auth.uid()
        )
    );

-- ============================================
-- APPOINTMENTS
-- ============================================
-- Vet or patient can see the appointment
CREATE POLICY "appointments_select_own" ON public.appointments
    FOR SELECT TO authenticated USING (
        patient_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.veterinarian_profiles
            WHERE id = vet_id AND user_id = auth.uid()
        )
    );

-- Patients can create appointments
CREATE POLICY "appointments_insert" ON public.appointments
    FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());

-- Both parties can update
CREATE POLICY "appointments_update" ON public.appointments
    FOR UPDATE TO authenticated USING (
        patient_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.veterinarian_profiles
            WHERE id = vet_id AND user_id = auth.uid()
        )
    );

-- ============================================
-- VET REVIEWS
-- ============================================
CREATE POLICY "vet_reviews_select" ON public.vet_reviews
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "vet_reviews_insert" ON public.vet_reviews
    FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE POLICY "conversations_select_participant" ON public.conversations
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "conversations_insert" ON public.conversations
    FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- CONVERSATION PARTICIPANTS
-- ============================================
CREATE POLICY "conv_participants_select" ON public.conversation_participants
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "conv_participants_insert" ON public.conversation_participants
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "conv_participants_update" ON public.conversation_participants
    FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ============================================
-- MESSAGES
-- ============================================
-- Can only read messages from conversations you are part of
CREATE POLICY "messages_select_participant" ON public.messages
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- Can only send messages as yourself in conversations you are part of
CREATE POLICY "messages_insert_own" ON public.messages
    FOR INSERT TO authenticated WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE TO authenticated USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- System-level insert (typically done via service role or triggers)
CREATE POLICY "notifications_insert" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- FAVORITES
-- ============================================
CREATE POLICY "favorites_select_own" ON public.favorites
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_own" ON public.favorites
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_delete_own" ON public.favorites
    FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================
-- DASHBOARD METRICS
-- ============================================
CREATE POLICY "dashboard_select_own" ON public.dashboard_metrics
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "dashboard_manage_own" ON public.dashboard_metrics
    FOR ALL TO authenticated USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- TASKS
-- ============================================
CREATE POLICY "tasks_select_own" ON public.tasks
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "tasks_insert_own" ON public.tasks
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_update_own" ON public.tasks
    FOR UPDATE TO authenticated USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_delete_own" ON public.tasks
    FOR DELETE TO authenticated USING (user_id = auth.uid());
