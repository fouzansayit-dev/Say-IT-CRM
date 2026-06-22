-- ==========================================
-- SAY IT — Schema Migration V4 (Comprehensive User Details)
-- ==========================================

-- Extend PROFILES Table with comprehensive HR, personal, and professional fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full-time',
ADD COLUMN IF NOT EXISTS work_location TEXT DEFAULT 'Office',
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS salary_amount NUMERIC;

-- Optional: Add a comment to describe the JSONB structure for social_links
COMMENT ON COLUMN public.profiles.social_links IS 'Stores URLs for LinkedIn, GitHub, Twitter, etc.';
