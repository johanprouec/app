-- ============================================
-- AgroLink - Seed Data
-- ============================================
-- NOTE: This seed assumes there are already auth.users created.
-- The UUIDs below are placeholders. In production, users will be
-- created through Supabase Auth and profiles will be auto-generated.
-- 
-- To use this seed:
-- 1. Create test users via Supabase Auth (dashboard or API)
-- 2. Replace the UUIDs below with the actual user IDs
-- 3. Run this SQL in the Supabase SQL Editor

-- ============================================
-- PLACEHOLDER USER IDS (replace with real ones)
-- ============================================
-- User 1: Carlos López (main user)
-- User 2: José Rincón (seller)
-- User 3: María Reyes (land owner)
-- User 4: Dr. Carlos Mendoza (vet)
-- User 5: Dra. Laura Restrepo (vet)
-- User 6: Dr. Andrés Vargas (vet)

-- After creating users via Auth, run the following with real UUIDs:

/*
-- Update profiles with full data
UPDATE public.profiles SET
    first_name = 'Carlos',
    last_name = 'López',
    producer_type = 'ganadero_independiente',
    location_city = 'Bogotá',
    location_department = 'Cundinamarca',
    is_verified = true,
    total_sales = 12,
    rating = 4.7
WHERE id = '<USER_1_UUID>';

UPDATE public.profiles SET
    first_name = 'José',
    last_name = 'Rincón',
    producer_type = 'ganadero_independiente',
    location_city = 'Montería',
    location_department = 'Córdoba',
    is_verified = true,
    total_sales = 47,
    rating = 4.9
WHERE id = '<USER_2_UUID>';

UPDATE public.profiles SET
    first_name = 'María',
    last_name = 'Reyes',
    producer_type = 'empresa_agropecuaria',
    location_city = 'Ibagué',
    location_department = 'Tolima',
    is_verified = true,
    total_sales = 12,
    rating = 4.8
WHERE id = '<USER_3_UUID>';

-- ============================================
-- LIVESTOCK LISTINGS
-- ============================================
INSERT INTO public.livestock_listings (seller_id, title, description, animal_type, breed, units, avg_weight_kg, avg_age_years, price, price_unit, is_certified, location_city, location_department, cover_image_url, status)
VALUES
    ('<USER_2_UUID>', 'Lote Angus Premium', 'Lote de bovinos Angus seleccionados, con registros sanitarios al día. Excelente conformación carnicera, adaptados al clima de la Costa Atlántica. Incluye certificados de brucelosis y tuberculosis.', 'bovino', 'Angus', 18, 480.00, 3.2, 8400000, 'total', true, 'Montería', 'Córdoba', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&q=80', 'active'),
    ('<USER_2_UUID>', 'Brahman Rojo Selecto', 'Lote selecto de Brahman rojo, excelente genética tropical.', 'bovino', 'Brahman', 24, 520.00, 2.8, 12800000, 'total', false, 'Villavicencio', 'Meta', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80', 'active'),
    ('<USER_2_UUID>', 'Pie de Cría Landrace', 'Cerdas Landrace de excelente línea genética para reproducción.', 'porcino', 'Landrace', 45, 120.00, 1.5, 5200000, 'total', true, 'Rionegro', 'Antioquia', 'https://images.unsplash.com/photo-1584467735871-8e4b1d0d3f3a?w=600&q=80', 'active'),
    ('<USER_3_UUID>', 'Criollos Colombianos', 'Caballos criollos colombianos de paso fino.', 'equino', 'Criollo', 6, 400.00, 5.0, 18000000, 'total', false, 'Tunja', 'Boyacá', 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&q=80', 'active'),
    ('<USER_2_UUID>', 'Holstein Lechero', 'Vacas Holstein de alta producción lechera, 28L/día promedio.', 'bovino', 'Holstein', 12, 550.00, 4.0, 9600000, 'total', true, 'Zipaquirá', 'Cundinamarca', 'https://images.unsplash.com/photo-1548445929-4f60a497f851?w=600&q=80', 'active');

-- ============================================
-- LAND LISTINGS
-- ============================================
INSERT INTO public.land_listings (owner_id, title, description, land_type, listing_type, area_hectares, price_per_hectare, total_price, soil_type, water_source, altitude_meters, location_city, location_department, has_clear_deed, cover_image_url, status)
VALUES
    ('<USER_3_UUID>', 'Finca La Esperanza', 'Finca con excelente ubicación, acceso a río y vía principal. Ideal para agricultura tecnificada.', 'agricola', 'venta', 42.00, 4200000, 176400000, 'Franco-Arcilloso', 'Río + Pozo', 850, 'Ibagué', 'Tolima', true, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80', 'active'),
    ('<USER_3_UUID>', 'Hacienda San Rafael', 'Hacienda ganadera con 8 potreros rotacionales, corral de manejo y agua permanente.', 'ganadero', 'alquiler', 215.00, 3800000, NULL, NULL, 'Jagüey', 180, 'Yopal', 'Casanare', true, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', 'active');

-- ============================================
-- VETERINARIAN PROFILES
-- ============================================
INSERT INTO public.veterinarian_profiles (user_id, professional_title, years_experience, consultation_price, total_consultations, rating, is_verified, bio, profile_image_url, location_city, location_department, animal_specialization)
VALUES
    ('<USER_4_UUID>', 'Veterinario', 8, 120000, 124, 4.9, true, 'Especialista en bovinos con 8 años de experiencia en ganadería tropical.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80', 'Ibagué', 'Tolima', ARRAY['bovinos']),
    ('<USER_5_UUID>', 'Veterinaria', 5, 95000, 89, 4.8, true, 'Experta en nutrición y diagnóstico porcino.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80', 'Medellín', 'Antioquia', ARRAY['porcinos']),
    ('<USER_6_UUID>', 'Veterinario', 12, 180000, 56, 4.7, true, 'Especialista en ortopedia y podología equina.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80', 'Tunja', 'Boyacá', ARRAY['equinos']);

-- Vet specialties
INSERT INTO public.vet_specialties (vet_id, specialty)
SELECT vp.id, s.specialty
FROM public.veterinarian_profiles vp,
    (VALUES ('Vacunación'), ('Cirugía'), ('Reproducción')) AS s(specialty)
WHERE vp.user_id = '<USER_4_UUID>';

INSERT INTO public.vet_specialties (vet_id, specialty)
SELECT vp.id, s.specialty
FROM public.veterinarian_profiles vp,
    (VALUES ('Nutrición'), ('Diagnóstico')) AS s(specialty)
WHERE vp.user_id = '<USER_5_UUID>';

INSERT INTO public.vet_specialties (vet_id, specialty)
SELECT vp.id, s.specialty
FROM public.veterinarian_profiles vp,
    (VALUES ('Ortopedia'), ('Podología')) AS s(specialty)
WHERE vp.user_id = '<USER_6_UUID>';

-- ============================================
-- NOTIFICATIONS (for Carlos López)
-- ============================================
INSERT INTO public.notifications (user_id, title, body, notification_type, severity, icon, created_at)
VALUES
    ('<USER_1_UUID>', '⚠️ Alerta fitosanitaria', 'Posible presencia de áfidos en Frijol Cargamanto (Lote C).', 'alert_phytosanitary', 'error', 'bug_report', NOW() - INTERVAL '2 hours'),
    ('<USER_1_UUID>', '📈 Aguacate Hass +12.4%', 'Buena oportunidad de venta en Corabastos.', 'price_change', 'warning', 'trending_up', NOW() - INTERVAL '4 hours'),
    ('<USER_1_UUID>', '💧 Riego completado', 'Lote A (Maíz). Próximo ciclo en 3 días.', 'irrigation', 'success', 'water_drop', NOW() - INTERVAL '1 day'),
    ('<USER_1_UUID>', '💬 Nuevo mensaje', 'José Rincón te escribió sobre el lote Angus.', 'chat_message', 'info', 'chat', NOW() - INTERVAL '1 day');

-- ============================================
-- DASHBOARD METRICS (for Carlos López)
-- ============================================
INSERT INTO public.dashboard_metrics (user_id, metric_type, value, unit, trend_pct, period_start, period_end)
VALUES
    ('<USER_1_UUID>', 'livestock_count', 105, 'cabezas', 4.2, DATE_TRUNC('month', NOW())::date, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::date),
    ('<USER_1_UUID>', 'monthly_sales', 45800000, 'COP', NULL, DATE_TRUNC('month', NOW())::date, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::date),
    ('<USER_1_UUID>', 'herd_vitality', 94, '%', NULL, DATE_TRUNC('month', NOW())::date, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::date),
    ('<USER_1_UUID>', 'weight_gain', 1.2, 'kg/día', NULL, DATE_TRUNC('month', NOW())::date, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::date),
    ('<USER_1_UUID>', 'cultivated_area', 4.2, 'ha', NULL, DATE_TRUNC('month', NOW())::date, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::date);

-- ============================================
-- SOIL ANALYSIS (sample data)
-- ============================================
-- Get the first land listing id for Finca La Esperanza
INSERT INTO public.soil_analyses (land_id, requested_by, lot_name, ph_level, organic_matter_pct, nitrogen_ppm, phosphorus_ppm, potassium_ppm, ai_recommendation, estimated_yield_ton_ha, recommended_crops, status)
SELECT
    ll.id,
    '<USER_1_UUID>',
    'Lote A',
    6.4,
    3.8,
    22.0,
    45.0,
    180.0,
    'Aplicar 80 kg/ha de urea antes de la siembra. Rendimiento estimado: 4.6 ton/ha de maíz. Cultivos recomendados: maíz, soya, sorgo.',
    4.6,
    ARRAY['maíz', 'soya', 'sorgo'],
    'completed'
FROM public.land_listings ll
WHERE ll.title = 'Finca La Esperanza'
LIMIT 1;
*/
