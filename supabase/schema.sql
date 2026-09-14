-- ====================================================================
-- KisanQueue - Production Supabase Schema & Seed Script
-- Supports: Farmers, Multi-User Auth, Real-Time Queues, Bookings, Centres
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. Clean Existing Schema (Safe for fresh setup & re-runs)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS queue_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS bottlenecks CASCADE;
DROP TABLE IF EXISTS forecasts CASCADE;
DROP TABLE IF EXISTS procurement_centres CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------------------
-- 3. USERS / FARMERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    farmer_id TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'staff', 'admin')),
    village TEXT,
    district TEXT DEFAULT 'Kottayam',
    state TEXT DEFAULT 'Kerala',
    primary_crop TEXT,
    crops TEXT[] DEFAULT '{}',
    bank_account TEXT,
    ifsc TEXT,
    language TEXT DEFAULT 'en',
    large_text BOOLEAN DEFAULT FALSE,
    high_contrast BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_farmer_id ON users(farmer_id);

-- --------------------------------------------------------------------
-- 4. PROCUREMENT CENTRES TABLE
-- --------------------------------------------------------------------
CREATE TABLE procurement_centres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    location TEXT NOT NULL,
    distance_km NUMERIC DEFAULT 0,
    working_hours TEXT DEFAULT '08:30 AM – 04:30 PM',
    daily_capacity_kg NUMERIC DEFAULT 25000,
    today_bookings_count INTEGER DEFAULT 0,
    current_queue_length INTEGER DEFAULT 0,
    avg_processing_minutes INTEGER DEFAULT 6,
    active_delay_minutes INTEGER DEFAULT 0,
    delay_reason TEXT,
    status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'busy', 'delayed')),
    slots JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. CROPS & MINIMUM SUPPORT PRICES (MSP) TABLE
-- --------------------------------------------------------------------
CREATE TABLE crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    local_name JSONB NOT NULL,
    msp_per_kg NUMERIC NOT NULL,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. HARVEST BOOKINGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    farmer_id TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_mobile TEXT NOT NULL,
    centre_id TEXT REFERENCES procurement_centres(id) ON DELETE SET NULL,
    centre_name TEXT NOT NULL,
    crop TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL,
    msp_per_kg NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    queue_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'arrived', 'verified', 'procured', 'completed', 'cancelled')),
    current_step_index INTEGER DEFAULT 1,
    transaction_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed')),
    booking_source TEXT DEFAULT 'web',
    alternate_phone TEXT,
    quality_grade TEXT,
    language_used TEXT DEFAULT 'ml',
    booked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_centre_id ON bookings(centre_id);
CREATE INDEX idx_bookings_farmer_mobile ON bookings(farmer_mobile);

-- --------------------------------------------------------------------
-- 7. LIVE QUEUE ADVANCEMENT TABLE
-- --------------------------------------------------------------------
CREATE TABLE queue_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id TEXT REFERENCES procurement_centres(id) ON DELETE CASCADE,
    booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
    queue_number INTEGER NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    crop TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'serving', 'verified', 'completed', 'skipped')),
    booking_source TEXT DEFAULT 'web',
    called_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queue_centre_number ON queue_items(centre_id, queue_number);

-- --------------------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('booking', 'queue', 'delay', 'procurement', 'payment', 'sms', 'info', 'success')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- --------------------------------------------------------------------
-- 9. ENABLE ROW LEVEL SECURITY (RLS) WITH OPEN POLICIES
-- --------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to procurement_centres" ON procurement_centres FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to crops" ON crops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to queue_items" ON queue_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime publication for tables
ALTER PUBLICATION supabase_realtime ADD TABLE procurement_centres;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE queue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- --------------------------------------------------------------------
-- 11. SEED DATA
-- --------------------------------------------------------------------

-- Seed Users
INSERT INTO users (id, mobile, name, farmer_id, role, village, district, state, primary_crop, crops, bank_account, ifsc)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '8281251299', 'Arun Kumar', 'KL-KTM-26047', 'farmer', 'Kumarakom', 'Kottayam', 'Kerala', 'Paddy & Coconut', ARRAY['paddy', 'coconut'], 'SBI A/C **** 4891', 'SBIN0070114'),
  ('b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', '9447123456', 'Mathew Joseph', 'KL-KTM-19034', 'farmer', 'Aymanam', 'Kottayam', 'Kerala', 'Paddy', ARRAY['paddy'], 'Federal Bank **** 1290', 'FDRL0001234'),
  ('c3d4e5f6-a7b8-4c7d-0e1f-2a3b4c5d6e7f', '9847012345', 'Staff Kottayam Gate 1', 'ST-KTM-01', 'staff', 'Nagampadam', 'Kottayam', 'Kerala', NULL, '{}', NULL, NULL),
  ('d4e5f6a7-b8c9-4d8e-1f2a-3b4c5d6e7f8a', '9400112233', 'Director Agricultural Directorate', 'ADM-KL-001', 'admin', 'Vikas Bhavan', 'Thiruvananthapuram', 'Kerala', NULL, '{}', NULL, NULL)
ON CONFLICT (mobile) DO NOTHING;

-- Seed Crops
INSERT INTO crops (id, name, local_name, msp_per_kg, icon, description)
VALUES
  ('paddy', 'Paddy', '{"ml": "നെല്ല് (Paddy)", "hi": "धान (Paddy)"}', 32, '🌾', 'Kerala state procurement with incentive bonus'),
  ('coconut', 'Raw Coconut', '{"ml": "പച്ചത്തേങ്ങ (Raw Coconut)", "hi": "कच्चा नारियल (Coconut)"}', 38, '🥥', 'KERAFED direct procurement rate'),
  ('rubber', 'Rubber Sheet (RSS4)', '{"ml": "റബ്ബർ ഷീറ്റ് (Rubber RSS4)", "hi": "रबर शीट (Rubber)"}', 180, '🪵', 'Rubber board incentive price support scheme'),
  ('pepper', 'Black Pepper', '{"ml": "കുരുമുളക് (Black Pepper)", "hi": "काली मिर्च (Black Pepper)"}', 520, '🌿', 'Spices Board certified grade procurement'),
  ('cardamom', 'Green Cardamom', '{"ml": "ഏലം (Cardamom)", "hi": "इलायची (Cardamom)"}', 1850, '🌱', 'Spices Board Grade 8mm+ procurement'),
  ('arecanut', 'Areca Nut', '{"ml": "അടയ്ക്ക (Areca Nut)", "hi": "सुपारी (Areca Nut)"}', 360, '🌰', 'CAMPCO & cooperative procurement support price'),
  ('nutmeg', 'Nutmeg & Mace', '{"ml": "ജാതിക്ക (Nutmeg)", "hi": "जायफल (Nutmeg)"}', 280, '🍂', 'Sun-dried bold nutmeg with premium mace subsidy'),
  ('coffee', 'Robusta Coffee', '{"ml": "കാപ്പിക്കുരു (Coffee)", "hi": "कॉफ़ी (Coffee)"}', 210, '☕', 'Wayanad GI Robusta Cherry A procurement'),
  ('banana', 'Nendran Banana', '{"ml": "നേന്ത്രക്കായ (Nendran)", "hi": "केला (Banana)"}', 42, '🍌', 'VFPCK floor price procurement scheme')
ON CONFLICT (id) DO NOTHING;

-- Seed Procurement Centres
INSERT INTO procurement_centres (id, name, district, location, distance_km, working_hours, daily_capacity_kg, today_bookings_count, current_queue_length, avg_processing_minutes, active_delay_minutes, delay_reason, status, slots)
VALUES
  (
    'centre-ktm',
    'Kottayam Procurement Centre',
    'Kottayam',
    'Near Nagampadam Bus Station, Kottayam',
    2.4,
    '08:30 AM – 04:30 PM',
    25000,
    142,
    12,
    6,
    0,
    NULL,
    'normal',
    '[
      {"id": "s1", "time": "09:00 – 10:00 AM", "available": 2, "capacity": 20, "status": "almost_full"},
      {"id": "s2", "time": "10:00 – 11:00 AM", "available": 0, "capacity": 20, "status": "full"},
      {"id": "s3", "time": "11:00 – 12:00 PM", "available": 6, "capacity": 20, "status": "available"},
      {"id": "s4", "time": "12:00 – 01:00 PM", "available": 11, "capacity": 20, "status": "available"},
      {"id": "s5", "time": "02:00 – 03:00 PM", "available": 15, "capacity": 20, "status": "available"}
    ]'::jsonb
  ),
  (
    'centre-pala',
    'Pala Procurement Centre',
    'Kottayam',
    'Main Road, Pala',
    14.2,
    '08:00 AM – 04:00 PM',
    18000,
    98,
    26,
    9,
    25,
    'Moisture meter calibration & high paddy volume',
    'delayed',
    '[
      {"id": "s1", "time": "09:00 – 10:00 AM", "available": 0, "capacity": 15, "status": "full"},
      {"id": "s2", "time": "10:00 – 11:00 AM", "available": 1, "capacity": 15, "status": "almost_full"},
      {"id": "s3", "time": "11:00 – 12:00 PM", "available": 3, "capacity": 15, "status": "almost_full"},
      {"id": "s4", "time": "01:00 – 02:00 PM", "available": 7, "capacity": 15, "status": "available"}
    ]'::jsonb
  ),
  (
    'centre-cgry',
    'Changanassery Procurement Centre',
    'Kottayam',
    'Market Road, Changanassery',
    5.8,
    '09:00 AM – 05:00 PM',
    22000,
    165,
    34,
    7,
    0,
    NULL,
    'busy',
    '[
      {"id": "s1", "time": "09:00 – 10:00 AM", "available": 0, "capacity": 20, "status": "full"},
      {"id": "s2", "time": "10:00 – 11:00 AM", "available": 2, "capacity": 20, "status": "almost_full"},
      {"id": "s3", "time": "12:00 – 01:00 PM", "available": 4, "capacity": 20, "status": "almost_full"},
      {"id": "s4", "time": "02:00 – 03:00 PM", "available": 8, "capacity": 20, "status": "available"}
    ]'::jsonb
  ),
  (
    'centre-alpy',
    'Alappuzha Lake Border Centre',
    'Alappuzha',
    'Kuttanad Canal Road, Alappuzha',
    18.5,
    '08:00 AM – 04:30 PM',
    30000,
    110,
    8,
    5,
    0,
    NULL,
    'normal',
    '[
      {"id": "s1", "time": "09:00 – 10:00 AM", "available": 12, "capacity": 25, "status": "available"},
      {"id": "s2", "time": "10:00 – 11:00 AM", "available": 15, "capacity": 25, "status": "available"},
      {"id": "s3", "time": "11:00 – 12:00 PM", "available": 18, "capacity": 25, "status": "available"}
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Bookings
INSERT INTO bookings (id, user_id, farmer_id, farmer_name, farmer_mobile, centre_id, centre_name, crop, quantity_kg, msp_per_kg, total_amount, date, slot_time, queue_number, status, current_step_index, transaction_id, payment_status)
VALUES
  ('BK-26047-01', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'KL-KTM-26047', 'Arun Kumar', '+91 82812 51299', 'centre-ktm', 'Kottayam Procurement Centre', 'Paddy', 420, 32, 13440, '10 September 2026', '10:30 AM', 47, 'confirmed', 1, 'TXN80472291', 'processing'),
  ('BK-26047-02', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'KL-KTM-26047', 'Arun Kumar', '+91 82812 51299', 'centre-ktm', 'Kottayam Procurement Centre', 'Paddy', 280, 32, 8960, '22 August 2026', '11:00 AM', 28, 'completed', 5, 'TXN79311204', 'completed'),
  ('BK-26047-03', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'KL-KTM-26047', 'Arun Kumar', '+91 82812 51299', 'centre-cgry', 'Changanassery Procurement Centre', 'Raw Coconut', 190, 38, 7220, '03 August 2026', '02:00 PM', 15, 'completed', 5, 'TXN77109845', 'completed')
ON CONFLICT (id) DO NOTHING;

-- Seed Live Queue Items
INSERT INTO queue_items (centre_id, booking_id, queue_number, farmer_name, farmer_id, crop, quantity_kg, status)
VALUES
  ('centre-ktm', NULL, 38, 'K. R. Varghese', 'KL-KTM-21045', 'Paddy', 650, 'completed'),
  ('centre-ktm', NULL, 39, 'Suresh Pillai', 'KL-KTM-24012', 'Paddy', 420, 'completed'),
  ('centre-ktm', NULL, 40, 'Mathew Joseph', 'KL-KTM-19034', 'Paddy', 800, 'serving'),
  ('centre-ktm', NULL, 41, 'P. N. Shaji', 'KL-KTM-27891', 'Coconut', 300, 'waiting'),
  ('centre-ktm', NULL, 42, 'Thomas Kurian', 'KL-KTM-23456', 'Rubber', 150, 'waiting'),
  ('centre-ktm', NULL, 43, 'Radhakrishnan M.', 'KL-KTM-18970', 'Paddy', 500, 'waiting'),
  ('centre-ktm', NULL, 44, 'Sebastian Luke', 'KL-KTM-29001', 'Paddy', 720, 'waiting'),
  ('centre-ktm', NULL, 45, 'V. A. Jacob', 'KL-KTM-15672', 'Coconut', 250, 'waiting'),
  ('centre-ktm', NULL, 46, 'Anil Kumar B.', 'KL-KTM-22319', 'Pepper', 90, 'waiting'),
  ('centre-ktm', 'BK-26047-01', 47, 'Arun Kumar', 'KL-KTM-26047', 'Rice · 420 kg', 420, 'waiting'),
  ('centre-ktm', NULL, 48, 'Devasia V.', 'KL-KTM-29401', 'Paddy', 380, 'waiting'),
  ('centre-ktm', NULL, 49, 'Manoj Chacko', 'KL-KTM-31002', 'Rubber', 200, 'waiting');

-- Seed Notifications
INSERT INTO notifications (user_id, title, message, type, read)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Booking Confirmed #47', 'Your slot at Kottayam Procurement Centre is locked for 10 Sep, 10:30 AM.', 'booking', false),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Queue Moving Smoothly', 'Now serving token #40. 7 farmers ahead of you. Estimated turn: 24 mins.', 'queue', false);
