-- ============================================================================
-- Migration: 20260925000009_create_financial_goals.sql
-- Purpose:   Financial goal tracking with explicit currency, RLS
-- Phase:     2C — Database Foundation
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Financial goals table
-- ---------------------------------------------------------------------------
CREATE TABLE public.financial_goals (
    id              UUID                NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID                NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name            TEXT                NOT NULL CHECK (char_length(trim(name)) > 0),
    target_amount   NUMERIC(14, 2)      NOT NULL CHECK (target_amount > 0),
    current_amount  NUMERIC(14, 2)      NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    currency        VARCHAR(3)          NOT NULL DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
    target_date     DATE                NULL,
    status          public.goal_status  NOT NULL DEFAULT 'in_progress',
    notes           TEXT                NULL,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.financial_goals IS 'User financial goals with explicit currency and manual progress tracking.';

-- ---------------------------------------------------------------------------
-- 2. Updated_at trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_goals_updated_at
    BEFORE UPDATE ON public.financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- SELECT: own goals
CREATE POLICY "goals_select" ON public.financial_goals
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

-- INSERT: own goals
CREATE POLICY "goals_insert" ON public.financial_goals
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

-- UPDATE: own goals
CREATE POLICY "goals_update" ON public.financial_goals
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- DELETE: own goals
CREATE POLICY "goals_delete" ON public.financial_goals
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_goals_user_status ON public.financial_goals (user_id, status);
