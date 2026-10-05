-- ==============================================================================
-- Supabase Schema for Bhadrannavar Dental Clinic (Project: ovvjunvcbqlcvrdbcyjp)
-- Run this script in your Supabase Project Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create the appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_id TEXT,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow public / anonymous users to insert new appointment bookings
DROP POLICY IF EXISTS "Allow public booking creation" ON public.appointments;
CREATE POLICY "Allow public booking creation"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Policy: Allow public / anonymous users to read appointments (for checking availability and confirmation)
DROP POLICY IF EXISTS "Allow read appointments" ON public.appointments;
CREATE POLICY "Allow read appointments"
ON public.appointments
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Policy: Allow updating appointments (for clinic admin actions)
DROP POLICY IF EXISTS "Allow update appointments" ON public.appointments;
CREATE POLICY "Allow update appointments"
ON public.appointments
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Policy: Allow deleting appointments (for clinic admin management)
DROP POLICY IF EXISTS "Allow delete appointments" ON public.appointments;
CREATE POLICY "Allow delete appointments"
ON public.appointments
FOR DELETE
TO anon, authenticated
USING (true);

-- 7. Index for fast querying by date and reference
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON public.appointments(booking_reference);

-- ==============================================================================
-- Optional: Services table if you want service menu synced to Supabase as well
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_note TEXT,
  short_desc TEXT,
  full_desc TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read services" ON public.services;
CREATE POLICY "Allow read services"
ON public.services
FOR SELECT
TO anon, authenticated
USING (true);
