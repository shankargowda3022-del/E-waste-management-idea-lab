import { createClient, Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import {
  PickupRequest,
  User,
  UserRole,
  EcoPointTransaction,
  ImpactMetrics,
  CollectionCentre,
  MarketplaceItem,
  TrackingUpdate
} from '../types';

export const SUPABASE_PROJECT_ID = 'fttrvueobakkskoccvvm';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rBLUw3GHuQ5iZk9TdrctLw_q2E3ir-O';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Full 7-Table SQL Schema Reference
export const SUPABASE_FULL_SQL = `-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql

-- 1. Profiles & Users Table
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

-- 2. Recycle Requests / Devices Table
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

-- 3. 7-Stage Chain of Custody Tracking Events
CREATE TABLE IF NOT EXISTS public.tracking_events (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES public.recycle_requests(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    updated_by TEXT,
    notes TEXT,
    proof_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Eco-Points Transactions Ledger
CREATE TABLE IF NOT EXISTS public.eco_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Dynamic Collection Centres
CREATE TABLE IF NOT EXISTS public.collection_centres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'campus_depot',
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Campus Central',
    distance_km NUMERIC DEFAULT 1.2,
    phone TEXT,
    email TEXT,
    rating NUMERIC DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 34,
    accepted_categories JSONB DEFAULT '["Laptops", "Smartphones & Tablets"]'::jsonb,
    services JSONB DEFAULT '["Free Doorstep Pickup", "Instant Eco-Points"]'::jsonb,
    open_hours TEXT DEFAULT 'Mon - Sat: 09:00 AM - 06:00 PM',
    certified_r2 BOOLEAN DEFAULT true,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Marketplace Listings
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    eco_points_cost INTEGER DEFAULT 0,
    condition TEXT NOT NULL DEFAULT 'refurbished_grade_a',
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

-- 7. Real Aggregated Impact Metrics
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

-- Enable RLS and public policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Upsert Profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Requests" ON public.recycle_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Requests" ON public.recycle_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Requests" ON public.recycle_requests FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Tracking" ON public.tracking_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Tracking" ON public.tracking_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Eco Transactions" ON public.eco_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Eco Transactions" ON public.eco_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Centres" ON public.collection_centres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Centres" ON public.collection_centres FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Marketplace" ON public.marketplace_listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Marketplace" ON public.marketplace_listings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Impact" ON public.impact_metrics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Impact" ON public.impact_metrics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`;

export interface TableStatusReport {
  tableName: string;
  exists: boolean;
  count: number;
  error?: string;
}

/**
 * Checks all 7 required Supabase tables and reports their readiness
 */
export const checkAllSupabaseTables = async (): Promise<{
  connected: boolean;
  allReady: boolean;
  tables: Record<string, TableStatusReport>;
  error?: string;
}> => {
  const tableNames = [
    'profiles',
    'recycle_requests',
    'tracking_events',
    'eco_transactions',
    'collection_centres',
    'marketplace_listings',
    'impact_metrics'
  ];

  const results: Record<string, TableStatusReport> = {};
  let anyConnected = false;
  let allReady = true;

  for (const name of tableNames) {
    try {
      const { data, error } = await supabase
        .from(name)
        .select('*')
        .limit(1);

      if (!error) {
        anyConnected = true;
        const countRes = await supabase.from(name).select('*', { count: 'exact', head: true });
        results[name] = {
          tableName: name,
          exists: true,
          count: countRes.count ?? (data ? data.length : 0)
        };
      } else {
        allReady = false;
        const notFound = error.code === 'PGRST205' || error.message?.includes('schema cache');
        results[name] = {
          tableName: name,
          exists: false,
          count: 0,
          error: notFound ? 'Table not created in database yet' : error.message
        };
      }
    } catch (e: any) {
      allReady = false;
      results[name] = {
        tableName: name,
        exists: false,
        count: 0,
        error: e?.message || 'Network error'
      };
    }
  }

  return {
    connected: anyConnected,
    allReady,
    tables: results
  };
};

/* ============================================================================
   AUTHENTICATION & USER PROFILE SERVICE (Priority 2)
   ============================================================================ */

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session | null;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Sign Up with Email and Password through Supabase Auth
 */
export const signUpWithEmail = async (
  email: string,
  pass: string,
  profileData: {
    name: string;
    role?: UserRole;
    phone?: string;
    address?: string;
    organization?: string;
  }
): Promise<AuthResponse> => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = profileData.name.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass.trim(),
      options: {
        data: {
          name: cleanName,
          role: profileData.role || 'citizen',
          phone: profileData.phone || '',
          address: profileData.address || '',
          organization: profileData.organization || 'Campus Community'
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const authId = data.user?.id || `usr_cit_${Date.now()}`;
    const newUser: User = {
      id: authId,
      name: cleanName,
      email: cleanEmail,
      role: profileData.role || 'citizen',
      phone: profileData.phone || '+1 (555) 000-0000',
      address: profileData.address || 'Campus Central',
      organization: profileData.organization || 'Campus Community',
      ecoPoints: 120, // Welcome points
      carbonSavedKg: 0,
      devicesRecycled: 0,
      isAuthenticatedCitizen: true
    };

    // Save profile to Supabase public.profiles table
    await saveUserProfileToSupabase(newUser);

    // Record welcome bonus transaction
    await recordEcoTransactionInSupabase({
      id: `tx-welcome-${Date.now()}`,
      userId: newUser.id,
      type: 'credit',
      amount: 120,
      reason: 'Welcome Eco-Pioneer Bonus Points',
      referenceId: 'WELCOME-BONUS',
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      user: newUser,
      session: data.session,
      isNewUser: true
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to sign up with Supabase Auth'
    };
  }
};

/**
 * Sign In with Email and Password through Supabase Auth
 */
export const signInWithEmail = async (
  email: string,
  pass: string
): Promise<AuthResponse> => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass.trim()
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'User record not found.' };
    }

    // Fetch user profile from Supabase profiles table
    let profile = await fetchUserProfileFromSupabase(data.user.id);

    if (!profile) {
      // Reconstruct user from auth metadata
      const meta = data.user.user_metadata || {};
      profile = {
        id: data.user.id,
        name: meta.name || data.user.email?.split('@')[0] || 'Verified Citizen',
        email: data.user.email || cleanEmail,
        role: (meta.role as UserRole) || 'citizen',
        phone: meta.phone || '+1 (555) 000-0000',
        address: meta.address || 'Campus Central',
        organization: meta.organization || 'Campus Community',
        ecoPoints: 120,
        carbonSavedKg: 0,
        devicesRecycled: 0,
        isAuthenticatedCitizen: true
      };
      // Upsert profile for next time
      await saveUserProfileToSupabase(profile);
    }

    return {
      success: true,
      user: profile,
      session: data.session
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to sign in with Supabase Auth'
    };
  }
};

/**
 * Initiates Google OAuth Sign-In via Supabase
 */
export const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Google OAuth failed' };
  }
};

/**
 * Sign Out through Supabase Auth
 */
export const signOutSupabase = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Supabase sign out error:', e);
  }
};

/**
 * Fetches user profile from Supabase profiles or users table
 */
export const fetchUserProfileFromSupabase = async (userId: string): Promise<User | null> => {
  try {
    // Try 'profiles' table first
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        phone: data.phone || '',
        address: data.address || '',
        organization: data.organization || '',
        ecoPoints: data.eco_points ?? 120,
        carbonSavedKg: Number(data.carbon_saved_kg || 0),
        devicesRecycled: data.devices_recycled ?? 0,
        avatar: data.avatar_url,
        isAuthenticatedCitizen: true
      };
    }

    // Try 'users' fallback table
    const fallback = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!fallback.error && fallback.data) {
      const u = fallback.data;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as UserRole,
        phone: u.phone || '',
        address: u.address || '',
        organization: u.organization || '',
        ecoPoints: u.eco_points ?? 120,
        carbonSavedKg: Number(u.carbon_saved_kg || 0),
        devicesRecycled: u.devices_recycled ?? 0,
        avatar: u.avatar_url,
        isAuthenticatedCitizen: true
      };
    }

    return null;
  } catch (e) {
    console.warn('Could not fetch user profile from Supabase:', e);
    return null;
  }
};

/**
 * Saves or updates user profile in Supabase profiles and users table
 */
export const saveUserProfileToSupabase = async (user: User): Promise<boolean> => {
  try {
    const row = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      organization: user.organization || null,
      eco_points: user.ecoPoints,
      carbon_saved_kg: user.carbonSavedKg,
      devices_recycled: user.devicesRecycled,
      avatar_url: user.avatar || null,
      updated_at: new Date().toISOString()
    };

    const res = await supabase.from('profiles').upsert([row], { onConflict: 'id' });
    if (res.error) {
      // Also try users table
      await supabase.from('users').upsert([row], { onConflict: 'id' });
    }
    return true;
  } catch (e) {
    console.error('Error saving user profile to Supabase:', e);
    return false;
  }
};

/* ============================================================================
   ECO-POINTS TRANSACTIONS (Priority 1 & 2)
   ============================================================================ */

export const recordEcoTransactionInSupabase = async (
  tx: EcoPointTransaction
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('eco_transactions').insert([
      {
        id: tx.id,
        user_id: tx.userId,
        type: tx.type,
        amount: tx.amount,
        reason: tx.reason,
        reference_id: tx.referenceId || null,
        created_at: tx.createdAt || new Date().toISOString()
      }
    ]);
    return !error;
  } catch (e) {
    console.warn('Could not record eco transaction in Supabase:', e);
    return false;
  }
};

export const fetchUserEcoTransactions = async (
  userId: string
): Promise<EcoPointTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('eco_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        type: d.type as 'credit' | 'debit',
        amount: d.amount,
        reason: d.reason,
        referenceId: d.reference_id,
        createdAt: d.created_at
      }));
    }
    return [];
  } catch {
    return [];
  }
};

/* ============================================================================
   7-STAGE CHAIN OF CUSTODY TRACKING (Priority 1 & 4)
   ============================================================================ */

export const recordTrackingEventInSupabase = async (
  requestId: string,
  event: TrackingUpdate
): Promise<boolean> => {
  try {
    const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { error } = await supabase.from('tracking_events').insert([
      {
        id: eventId,
        request_id: requestId,
        stage: event.stage,
        title: event.title,
        description: event.description,
        location: event.location || null,
        updated_by: event.updatedBy || null,
        created_at: new Date().toISOString()
      }
    ]);
    return !error;
  } catch (e) {
    console.warn('Could not save tracking event in Supabase:', e);
    return false;
  }
};

/* ============================================================================
   RECYCLE REQUESTS / E-WASTE SUBMISSIONS (Priority 1)
   ============================================================================ */

const safeIsoTimestamp = (value?: string): string => {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
};

export const mapRequestToSupabaseRow = (req: PickupRequest) => {
  const aiDiagnosisPayload =
    req.aiDiagnosis || req.deviceImage || req.deviceImageName
      ? {
          ...(req.aiDiagnosis || {}),
          ...(req.deviceImage ? { uploadedImage: req.deviceImage } : {}),
          ...(req.deviceImageName ? { uploadedImageName: req.deviceImageName } : {})
        }
      : null;

  return {
    id: req.id,
    user_id: req.userId || 'usr_citizen_01',
    user_name: req.userName,
    user_email: req.userEmail,
    user_phone: req.userPhone || null,
    device_category: req.deviceCategory,
    brand: req.brand,
    model: req.model,
    quantity: req.quantity || 1,
    condition: req.condition || 'working',
    pickup_type: req.pickupType || 'home_pickup',
    address: req.address || null,
    centre_id: req.centreId || null,
    centre_name: req.centreName || null,
    preferred_date: req.preferredDate || null,
    time_slot: req.timeSlot || null,
    disposal_preference: req.disposalPreference || 'recycle',
    notes: req.notes || null,
    serial_number: req.serialNumber || null,
    status: req.status || 'submitted',
    eco_points_awarded: req.ecoPointsAwarded || 100,
    estimated_weight_kg: req.estimatedWeightKg || 1.5,
    verified_weight_kg: req.verifiedWeightKg || null,
    tracking_updates: req.trackingUpdates || [],
    ai_diagnosis: aiDiagnosisPayload,
    data_privacy_acknowledged: Boolean(req.dataPrivacyAcknowledged ?? true),
    battery_safe_handling_acknowledged: Boolean(req.batterySafeHandlingAcknowledged ?? true),
    qr_code_token: req.qrCodeToken || `ECY-QR-${req.id}`,
    created_at: safeIsoTimestamp(req.submittedAt || req.createdAt),
    updated_at: new Date().toISOString()
  };
};

export const mapSupabaseRowToRequest = (row: any): PickupRequest => {
  const rawTimestamp = row.created_at || row.submittedAt || row.createdAt || new Date().toISOString();
  const deviceImage =
    row.device_image ||
    row.deviceImage ||
    row.ai_diagnosis?.uploadedImage ||
    row.ai_diagnosis?.imageUrl;
  const deviceImageName =
    row.device_image_name ||
    row.deviceImageName ||
    row.ai_diagnosis?.uploadedImageName;

  return {
    id: row.id,
    userId: row.user_id || row.userId || 'usr_citizen_01',
    userName: row.user_name || row.userName || 'Anonymous',
    userEmail: row.user_email || row.userEmail || '',
    userPhone: row.user_phone || row.userPhone || '',
    deviceCategory: row.device_category || row.deviceCategory || 'Laptops',
    brand: row.brand || '',
    model: row.model || '',
    quantity: row.quantity || 1,
    condition: row.condition || 'working',
    pickupType: row.pickup_type || row.pickupType || 'home_pickup',
    address: row.address || '',
    centreId: row.centre_id || row.centreId,
    centreName: row.centre_name || row.centreName,
    preferredDate: row.preferred_date || row.preferredDate || '',
    timeSlot: row.time_slot || row.timeSlot || '',
    disposalPreference: row.disposal_preference || row.disposalPreference || 'recycle',
    notes: row.notes,
    serialNumber: row.serial_number || row.serialNumber,
    status: row.status || 'submitted',
    trackingUpdates: Array.isArray(row.tracking_updates)
      ? row.tracking_updates
      : Array.isArray(row.trackingUpdates)
      ? row.trackingUpdates
      : [],
    ecoPointsAwarded: row.eco_points_awarded || row.ecoPointsAwarded || 100,
    estimatedWeightKg: Number(row.estimated_weight_kg || row.estimatedWeightKg || 1.5),
    verifiedWeightKg: row.verified_weight_kg ? Number(row.verified_weight_kg) : undefined,
    recoveredGoldGrams: Number(row.recovered_gold_grams || 0),
    recoveredCopperKg: Number(row.recovered_copper_kg || 0),
    assignedPartnerId: row.assigned_partner_id || row.assignedPartnerId,
    assignedPartnerName: row.assigned_partner_name || row.assignedPartnerName,
    aiDiagnosis: row.ai_diagnosis,
    createdAt: rawTimestamp,
    submittedAt: rawTimestamp,
    deviceImage,
    deviceImageName,
    dataPrivacyAcknowledged: Boolean(row.data_privacy_acknowledged ?? true),
    batterySafeHandlingAcknowledged: Boolean(row.battery_safe_handling_acknowledged ?? true),
    qrCodeToken: row.qr_code_token || row.qrCodeToken || `ECY-QR-${row.id}`
  };
};

export interface SupabaseSyncResult {
  success: boolean;
  synced: boolean;
  needsTable?: boolean;
  error?: string;
  data?: any;
}

export const saveRecycleRequestToSupabase = async (req: PickupRequest): Promise<SupabaseSyncResult> => {
  try {
    const row = mapRequestToSupabaseRow(req);
    const { data, error } = await supabase.from('recycle_requests').upsert([row], { onConflict: 'id' }).select();
    if (!error) {
      console.log('✅ Successfully saved request to Supabase:', req.id);
      return { success: true, synced: true, data };
    }

    if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.code === '42P01') {
      return {
        success: true,
        synced: false,
        needsTable: true,
        error: 'Table recycle_requests needs to be created in Supabase SQL editor.'
      };
    }

    return { success: false, synced: false, error: error.message };
  } catch (err: any) {
    console.error('Error saving request to Supabase:', err);
    return { success: false, synced: false, error: err?.message || 'Network error' };
  }
};

export const fetchRequestsFromSupabase = async (userId?: string): Promise<PickupRequest[]> => {
  try {
    let query = supabase.from('recycle_requests').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map(mapSupabaseRowToRequest);
    }
    return [];
  } catch {
    return [];
  }
};

export const updateRequestInSupabase = async (
  requestId: string,
  updates: Partial<PickupRequest>
): Promise<boolean> => {
  try {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.verifiedWeightKg !== undefined) dbUpdates.verified_weight_kg = updates.verifiedWeightKg;
    if (updates.trackingUpdates) dbUpdates.tracking_updates = updates.trackingUpdates;
    if (updates.assignedPartnerId) dbUpdates.assigned_partner_id = updates.assignedPartnerId;
    if (updates.assignedPartnerName) dbUpdates.assigned_partner_name = updates.assignedPartnerName;
    if (updates.aiDiagnosis) dbUpdates.ai_diagnosis = updates.aiDiagnosis;

    const { error } = await supabase.from('recycle_requests').update(dbUpdates).eq('id', requestId);
    return !error;
  } catch {
    return false;
  }
};

/* ============================================================================
   DYNAMIC COLLECTION CENTRES (Priority 1 & 5)
   ============================================================================ */

export const fetchCollectionCentresFromSupabase = async (): Promise<CollectionCentre[]> => {
  try {
    const { data, error } = await supabase.from('collection_centres').select('*');
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        address: d.address,
        city: d.city || 'Campus Central',
        distanceKm: Number(d.distance_km || 1.0),
        phone: d.phone || '',
        email: d.email || '',
        rating: Number(d.rating || 4.8),
        reviewsCount: d.reviews_count || 20,
        acceptedCategories: Array.isArray(d.accepted_categories) ? d.accepted_categories : [],
        services: Array.isArray(d.services) ? d.services : [],
        openHours: d.open_hours || 'Mon - Sat: 09:00 AM - 06:00 PM',
        certifiedR2: Boolean(d.certified_r2 ?? true)
      }));
    }
    return [];
  } catch {
    return [];
  }
};

export const saveCollectionCentreToSupabase = async (centre: CollectionCentre): Promise<boolean> => {
  try {
    const { error } = await supabase.from('collection_centres').upsert([
      {
        id: centre.id,
        name: centre.name,
        type: centre.type,
        address: centre.address,
        city: centre.city,
        distance_km: centre.distanceKm,
        phone: centre.phone,
        email: centre.email,
        rating: centre.rating,
        reviews_count: centre.reviewsCount,
        accepted_categories: centre.acceptedCategories,
        services: centre.services,
        open_hours: centre.openHours,
        certified_r2: centre.certifiedR2
      }
    ]);
    return !error;
  } catch {
    return false;
  }
};

/* ============================================================================
   MARKETPLACE LISTINGS (Priority 1 & 7)
   ============================================================================ */

export const fetchMarketplaceListingsFromSupabase = async (): Promise<MarketplaceItem[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        price: Number(d.price),
        condition: d.condition,
        sellerId: d.seller_id,
        sellerName: d.seller_name,
        sellerRole: d.seller_role,
        location: d.location,
        description: d.description || '',
        specs: Array.isArray(d.specs) ? d.specs : [],
        warrantyDays: d.warranty_days || 90,
        isReserved: Boolean(d.is_reserved),
        createdAt: d.created_at
      }));
    }
    return [];
  } catch {
    return [];
  }
};

export const saveMarketplaceListingToSupabase = async (item: MarketplaceItem): Promise<boolean> => {
  try {
    const { error } = await supabase.from('marketplace_listings').upsert([
      {
        id: item.id,
        title: item.title,
        category: item.category,
        price: item.price,
        condition: item.condition,
        seller_id: item.sellerId,
        seller_name: item.sellerName,
        seller_role: item.sellerRole,
        location: item.location,
        description: item.description,
        specs: item.specs,
        warranty_days: item.warrantyDays,
        is_reserved: item.isReserved || false,
        created_at: item.createdAt || new Date().toISOString()
      }
    ]);
    return !error;
  } catch {
    return false;
  }
};

/* ============================================================================
   AGGREGATED IMPACT METRICS (Priority 1 & 8)
   ============================================================================ */

export const fetchImpactMetricsFromSupabase = async (): Promise<ImpactMetrics | null> => {
  try {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .eq('id', 'global_stats')
      .maybeSingle();

    if (!error && data) {
      return {
        devicesCollected: data.devices_collected,
        kgProcessed: Number(data.kg_processed),
        ghgAvoidedKg: Number(data.ghg_avoided_kg),
        activePartners: data.active_partners,
        goldRecoveredGrams: Number(data.gold_recovered_grams || 0),
        copperRecoveredKg: Number(data.copper_recovered_kg || 0),
        updatedAt: data.updated_at
      };
    }
    return null;
  } catch {
    return null;
  }
};
