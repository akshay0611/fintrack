-- ============================================================================
-- Migration: 20260925000002_create_profiles.sql
-- Purpose:   User profile table, RLS, auth trigger, updated_at trigger
-- Phase:     2C — Database Foundation
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Reusable updated_at trigger function (used by all tables)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Profiles table
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id              UUID        NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT        NULL CHECK (display_name IS NULL OR char_length(trim(display_name)) > 0 AND char_length(display_name) <= 100),
    base_currency   VARCHAR(3)  NOT NULL DEFAULT 'USD' CHECK (base_currency ~ '^[A-Z]{3}$'),
    date_format     VARCHAR(12) NOT NULL DEFAULT 'YYYY-MM-DD' CHECK (date_format IN ('YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile and preferences. One row per auth.users entry.';

-- ---------------------------------------------------------------------------
-- 3. Updated_at trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read their own profile
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = (select auth.uid()));

-- INSERT: denied to authenticated users (managed by auth trigger)
-- No INSERT policy means RLS blocks direct inserts by authenticated users.

-- UPDATE: users can update their own profile
CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = (select auth.uid()))
    WITH CHECK (id = (select auth.uid()));

-- DELETE: denied (cascades from auth.users only)
-- No DELETE policy means RLS blocks direct deletes by authenticated users.

-- ---------------------------------------------------------------------------
-- 5. Auth trigger: auto-create profile on user sign-up
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', NULL)
    );
    RETURN NEW;
END;
$$;

-- Harden SECURITY DEFINER function: revoke public access, grant only to postgres/service_role
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- Attach to auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_profiles_currency ON public.profiles (base_currency);
