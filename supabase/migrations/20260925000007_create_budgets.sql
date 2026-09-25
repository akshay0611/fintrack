-- ============================================================================
-- Migration: 20260925000007_create_budgets.sql
-- Purpose:   Monthly budget allocations per category, RLS, constraints
-- Phase:     2C — Database Foundation
-- Notes:     V2 budgets are strictly calendar-month allocations. No period enum.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Budgets table
-- ---------------------------------------------------------------------------
CREATE TABLE public.budgets (
    id          UUID            NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID            NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    amount      NUMERIC(14, 2)  NOT NULL CHECK (amount > 0),
    start_date  DATE            NOT NULL,
    end_date    DATE            NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),

    -- Calendar month alignment: start_date must be first of month
    CONSTRAINT chk_budgets_start_date_month_aligned
        CHECK (start_date = date_trunc('month', start_date)::date),

    -- End date must be last day of the same month as start_date
    CONSTRAINT chk_budgets_end_date_month_aligned
        CHECK (end_date = (date_trunc('month', start_date) + interval '1 month' - interval '1 day')::date),

    -- One budget per user+category+month
    CONSTRAINT uq_budgets_user_category_month
        UNIQUE (user_id, category_id, start_date)
);

COMMENT ON TABLE public.budgets IS 'Monthly budget allocations per category. Strictly calendar-month windows with uniqueness per user+category+month.';

-- ---------------------------------------------------------------------------
-- 2. Budget category ownership validation trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_validate_budget_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_cat_is_system BOOLEAN;
    v_cat_user_id UUID;
    v_cat_type public.category_type;
BEGIN
    SELECT is_system, user_id, type
    INTO v_cat_is_system, v_cat_user_id, v_cat_type
    FROM public.categories
    WHERE id = NEW.category_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Budget category % does not exist', NEW.category_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Budgets only make sense for expense categories
    IF v_cat_type <> 'expense' THEN
        RAISE EXCEPTION 'Budgets can only be created for expense categories'
            USING ERRCODE = 'check_violation';
    END IF;

    -- If custom category, must belong to same user
    IF NOT v_cat_is_system AND v_cat_user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Budget category does not belong to the user'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_budgets_validate_category
    BEFORE INSERT OR UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validate_budget_category();

-- ---------------------------------------------------------------------------
-- 3. Updated_at trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- SELECT: own budgets
CREATE POLICY "budgets_select" ON public.budgets
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

-- INSERT: own budgets
CREATE POLICY "budgets_insert" ON public.budgets
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

-- UPDATE: own budgets
CREATE POLICY "budgets_update" ON public.budgets
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- DELETE: own budgets
CREATE POLICY "budgets_delete" ON public.budgets
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 5. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_budgets_user_dates ON public.budgets (user_id, start_date, end_date);
CREATE INDEX idx_budgets_category ON public.budgets (category_id);
