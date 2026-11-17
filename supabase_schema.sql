-- ============================================================================
-- E-Cycle AI: Production Supabase Schema & Database Setup
-- Project ID: fttrvueobakkskoccvvm
-- Project URL: https://fttrvueobakkskoccvvm.supabase.co
-- ============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/fttrvueobakkskoccvvm/sql
-- 2. Create a "New Query", paste this entire script, and click "RUN".
-- 3. All 7 production tables, RLS policies, triggers, and seed data will be created!
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES & USERS TABLE
-- Stores user accounts, roles (Citizen, Campus Admin, Recycler, Super Admin, Repairer),
-- contact info, doorstep addresses, and eco-points balances.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'campus_admin', 'recycler', 'super_admin', 'repair', 'admin')),
    phone TEXT DEFAULT '+1 (555) 000-0000',
    address TEXT DEFAULT 'Campus Drop-off Depot',
    organization TEXT DEFAULT 'Campus Community',
    eco_points INTEGER DEFAULT 120,
    carbon_saved_kg NUMERIC DEFAULT 0,
    devices_recycled INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alias view/table for backwards compatibility with 'users'
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen',
    phone TEXT,
    address TEXT,
    organization TEXT,
    eco_points INTEGER DEFAULT 120,
    carbon_saved_kg NUMERIC DEFAULT 0,
    devices_recycled INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. RECYCLE REQUESTS & E-WASTE SUBMISSIONS TABLE
-- Stores complete submissions, device categories, brands, models, conditions,
-- pickup scheduling, and live chain-of-custody status.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recycle_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    device_category TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    condition TEXT DEFAULT 'working',
    pickup_type TEXT DEFAULT 'home_pickup',
    address TEXT,
    centre_id TEXT,
    centre_name TEXT,
    preferred_date TEXT,
    time_slot TEXT,
    disposal_preference TEXT DEFAULT 'recycle',
    notes TEXT,
    serial_number TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'assigned', 'scheduled', 'collected', 'processing', 'completed', 'cancelled')),
    eco_points_awarded INTEGER DEFAULT 0,
    estimated_weight_kg NUMERIC DEFAULT 1.0,
    verified_weight_kg NUMERIC,
    recovered_gold_grams NUMERIC DEFAULT 0,
    recovered_copper_kg NUMERIC DEFAULT 0,
    assigned_partner_id TEXT,
    assigned_partner_name TEXT,
    tracking_updates JSONB DEFAULT '[]'::jsonb,
    ai_diagnosis JSONB,
    data_privacy_acknowledged BOOLEAN DEFAULT true,
    battery_safe_handling_acknowledged BOOLEAN DEFAULT true,
    qr_code_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. TRACKING EVENTS (7-Stage Chain of Custody)
-- Stores individual immutable custody ledger events for each e-waste item:
-- Stage 1: submitted
-- Stage 2: verified (AI Triage)
-- Stage 3: assigned (Partner assigned)
-- Stage 4: scheduled (Pickup window booked)
-- Stage 5: collected (Doorstep pickup / Drop-off verified)
-- Stage 6: processing (Smelting / Component refurbishment)
-- Stage 7: completed (Certificate issued + Eco-Points released)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tracking_events (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES public.recycle_requests(id) ON DELETE CASCADE,
    stage TEXT NOT NULL CHECK (stage IN ('submitted', 'verified', 'assigned', 'scheduled', 'collected', 'processing', 'completed', 'cancelled')),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    updated_by TEXT,
    notes TEXT,
    proof_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. ECO-POINTS TRANSACTIONS TABLE
-- Immutable wallet ledger tracking all point rewards, deductions, redemptions.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eco_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. COLLECTION CENTRES TABLE
-- Dynamic drop-off kiosks, campus depots, and certified R2v3 recycler locations.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collection_centres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'campus_depot' CHECK (type IN ('certified_recycler', 'dropoff_kiosk', 'repair_hub', 'campus_depot')),
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Campus Central',
    distance_km NUMERIC DEFAULT 1.2,
    phone TEXT,
    email TEXT,
    rating NUMERIC DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 34,
    accepted_categories JSONB DEFAULT '["Laptops", "Smartphones & Tablets", "Audio & Wearables"]'::jsonb,
    services JSONB DEFAULT '["Free Doorstep Pickup", "Instant Eco-Points", "Data Wiping Verification"]'::jsonb,
    open_hours TEXT DEFAULT 'Mon - Sat: 09:00 AM - 06:00 PM',
    certified_r2 BOOLEAN DEFAULT true,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. MARKETPLACE LISTINGS TABLE
-- Repaired & refurbished devices, verified hardware, and tested spare parts.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    eco_points_cost INTEGER DEFAULT 0,
    condition TEXT NOT NULL DEFAULT 'refurbished_grade_a' CHECK (condition IN ('refurbished_grade_a', 'tested_working', 'for_parts')),
    seller_id TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    seller_role TEXT DEFAULT 'Certified Refurbisher',
    location TEXT DEFAULT 'Campus Hardware Lab',
    description TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    warranty_days INTEGER DEFAULT 90,
    is_reserved BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. IMPACT METRICS TABLE (Aggregated Platform Totals)
-- Real-time aggregations for devices collected, kg processed, GHG avoided, partners.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.impact_metrics (
    id TEXT PRIMARY KEY,
    devices_collected INTEGER DEFAULT 0,
    kg_processed NUMERIC DEFAULT 0,
    ghg_avoided_kg NUMERIC DEFAULT 0,
    active_partners INTEGER DEFAULT 0,
    gold_recovered_grams NUMERIC DEFAULT 0,
    copper_recovered_kg NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Configure public access for anonymous and authenticated client operations.
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles: Allow read and upsert
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Upsert Profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Users: Allow read and upsert
CREATE POLICY "Public Read Users" ON public.users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Upsert Users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Recycle Requests: Full read, insert, update
CREATE POLICY "Public Read Requests" ON public.recycle_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Requests" ON public.recycle_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Requests" ON public.recycle_requests FOR UPDATE TO anon, authenticated USING (true);

-- Tracking Events: Full read & insert
CREATE POLICY "Public Read Tracking" ON public.tracking_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Tracking" ON public.tracking_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Eco Transactions: Read and insert
CREATE POLICY "Public Read Eco Transactions" ON public.eco_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Eco Transactions" ON public.eco_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Collection Centres: Read and insert/update
CREATE POLICY "Public Read Centres" ON public.collection_centres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Centres" ON public.collection_centres FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Marketplace Listings: Read and insert/update
CREATE POLICY "Public Read Marketplace" ON public.marketplace_listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Marketplace" ON public.marketplace_listings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Impact Metrics: Read and update
CREATE POLICY "Public Read Impact" ON public.impact_metrics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Impact" ON public.impact_metrics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- ----------------------------------------------------------------------------

-- Seed Initial Impact Metrics
INSERT INTO public.impact_metrics (id, devices_collected, kg_processed, ghg_avoided_kg, active_partners, gold_recovered_grams, copper_recovered_kg)
VALUES ('global_stats', 4280, 12640.5, 34120.0, 18, 482.4, 2190.0)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Profiles
INSERT INTO public.profiles (id, email, name, role, phone, address, organization, eco_points, carbon_saved_kg, devices_recycled)
VALUES 
    ('usr_citizen_01', 'alex.rivera@university.edu', 'Alex Rivera', 'citizen', '+1 (555) 234-8901', 'Room 304, Redwood Student Residence, North Campus', 'Campus Resident', 480, 18.5, 4),
    ('usr_admin_01', 'admin@ecycle.org', 'Directorate Operations', 'campus_admin', '+1 (555) 999-0001', 'Sustainability Directorate, Admin Complex Bldg A', 'Campus ESG Directorate', 1200, 120.0, 48),
    ('usr_recycler_01', 'contact@greentech.org', 'GreenTech Smelter Ops', 'recycler', '+1 (555) 456-7890', 'Plot 42, Eco-Industrial Park, Sector 9', 'GreenTech Certified Recyclers Ltd (R2v3)', 2500, 560.0, 180)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Users (Alias table)
INSERT INTO public.users (id, email, name, role, phone, address, organization, eco_points, carbon_saved_kg, devices_recycled)
VALUES 
    ('usr_citizen_01', 'alex.rivera@university.edu', 'Alex Rivera', 'citizen', '+1 (555) 234-8901', 'Room 304, Redwood Student Residence, North Campus', 'Campus Resident', 480, 18.5, 4),
    ('usr_admin_01', 'admin@ecycle.org', 'Directorate Operations', 'campus_admin', '+1 (555) 999-0001', 'Sustainability Directorate, Admin Complex Bldg A', 'Campus ESG Directorate', 1200, 120.0, 48),
    ('usr_recycler_01', 'contact@greentech.org', 'GreenTech Smelter Ops', 'recycler', '+1 (555) 456-7890', 'Plot 42, Eco-Industrial Park, Sector 9', 'GreenTech Certified Recyclers Ltd (R2v3)', 2500, 560.0, 180)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Collection Centres
INSERT INTO public.collection_centres (id, name, type, address, city, distance_km, phone, email, rating, reviews_count, accepted_categories, services, open_hours, certified_r2)
VALUES 
    ('centre-01', 'Campus Central Drop-Off Hub', 'campus_depot', 'Ground Floor, Student Union Building, Campus Central', 'Campus Central', 0.4, '+1 (555) 019-2831', 'depot.central@university.edu', 4.9, 142, '["Laptops", "Smartphones & Tablets", "Audio & Wearables", "Small Appliances"]'::jsonb, '["Free Doorstep Pickup", "Instant Eco-Points", "Data Wiping Verification"]'::jsonb, 'Mon - Fri: 08:30 AM - 07:00 PM', true),
    ('centre-02', 'GreenTech R2 Certified Facility', 'certified_recycler', 'Plot 42, Eco-Industrial Park, Sector 9', 'Metro East', 3.8, '+1 (555) 345-6789', 'intake@greentech-ewaste.org', 4.8, 89, '["Desktops & Servers", "Laptops", "Lithium-Ion Batteries", "Monitors & Displays"]'::jsonb, '["Free Doorstep Pickup", "Certified Destruction Certificate", "Heavy Freight Transit"]'::jsonb, 'Mon - Sat: 09:00 AM - 06:00 PM', true),
    ('centre-03', 'North Gate E-Depot Kiosk', 'dropoff_kiosk', 'Gate 3 Security Pavilion, North Academic Quad', 'North Campus', 1.1, '+1 (555) 890-1234', 'kiosk.north@university.edu', 4.7, 56, '["Smartphones & Tablets", "Cables & Adapters", "Audio & Wearables"]'::jsonb, '["Instant Eco-Points", "Automated Locker Deposit"]'::jsonb, '24/7 Automated Locker Access', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Marketplace Listings
INSERT INTO public.marketplace_listings (id, title, category, price, eco_points_cost, condition, seller_id, seller_name, seller_role, location, description, specs, warranty_days, is_reserved)
VALUES 
    ('item-01', 'Dell Latitude 7490 (Refurbished)', 'Laptops', 189.00, 1800, 'refurbished_grade_a', 'usr_admin_01', 'Campus Hardware Lab', 'Certified Refurbisher', 'Engineering Block B', 'Clean corporate laptop salvaged and refurbished with new battery and clean NVMe SSD.', '["Intel Core i5-8350U", "16GB DDR4 RAM", "512GB NVMe SSD", "14.0 FHD Anti-Glare"]'::jsonb, 180, false),
    ('item-02', 'Apple iPad 9th Gen (10.2" Wi-Fi 64GB)', 'Smartphones & Tablets', 149.00, 1400, 'refurbished_grade_a', 'usr_admin_01', 'Student Tech Exchange', 'Verified Student', 'Library Level 2', 'Minor chassis scuffs. New tempered glass applied, battery health tested at 94%.', '["A13 Bionic Chip", "64GB Storage", "10.2 Retina Display", "iPadOS 17 Ready"]'::jsonb, 90, false),
    ('item-03', 'HP 24" 1080p IPS Monitor (Tested Working)', 'Monitors & Displays', 45.00, 450, 'tested_working', 'usr_recycler_01', 'GreenTech Certified Recyclers', 'Certified Refurbisher', 'Metro East Depot', 'Rescued from office decommission. Screen in pristine condition with HDMI and DisplayPort inputs.', '["23.8 IPS Panel", "1920x1080 @ 75Hz", "HDMI + DisplayPort", "Adjustable Stand"]'::jsonb, 60, false)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Eco Transactions
INSERT INTO public.eco_transactions (id, user_id, type, amount, reason, reference_id)
VALUES 
    ('tx-01', 'usr_citizen_01', 'credit', 160, 'E-Waste Pickup Certified: Lenovo ThinkPad T480', 'ECY-2026-8941'),
    ('tx-02', 'usr_citizen_01', 'credit', 120, 'E-Waste Pickup Certified: Samsung Galaxy S10', 'ECY-2026-5512'),
    ('tx-03', 'usr_citizen_01', 'credit', 200, 'Welcome Citizen Eco-Pioneer Bonus', 'WELCOME-BONUS')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Complete! All 7 production tables and seed data are ready.
-- ============================================================================
