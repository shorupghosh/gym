-- === TITAN GYM - SUPABASE DATABASE INITIALIZATION ===
-- Run this in your Supabase SQL Editor.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE,
    gender TEXT,
    status TEXT DEFAULT 'ACTIVE',
    notes TEXT,
    plan TEXT DEFAULT 'Basic',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. plans Table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    duration_type TEXT DEFAULT 'Monthly',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. membership_history Table
CREATE TABLE IF NOT EXISTS membership_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_paid DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    method TEXT DEFAULT 'QR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. automation_settings Table
CREATE TABLE IF NOT EXISTS automation_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Seed Default Plans (Optional)
INSERT INTO plans (name, price, duration_days, duration_type, description) VALUES
('Basic', 1500, 30, 'Monthly', 'Access to gym floor and cardio.'),
('Pro', 2500, 30, 'Monthly', 'Gym floor, locker, and 1 group class.'),
('Elite', 4500, 30, 'Monthly', 'All-access including steam room and personal training intro.');

-- 9. Row Level Security (RLS) - Simplest setup for public access
-- NOTE: In production, configure exact policies based on authenticated users.
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read" ON members FOR SELECT USING (true);
CREATE POLICY "Allow all write" ON members FOR ALL USING (true);
CREATE POLICY "Allow all read" ON plans FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON attendance FOR SELECT USING (true);
CREATE POLICY "Allow all write" ON attendance FOR ALL USING (true);
-- (Add other policies for full functionality)
