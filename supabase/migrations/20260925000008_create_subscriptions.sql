-- ============================================================================
-- Migration: 20260925000008_create_subscriptions.sql
-- Purpose:   Recurring subscription tracking, RLS, renewal validation
-- Phase:     2C — Database Foundation
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Subscriptions table
-- ---------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
    id                  UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID                        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id          UUID                        NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    category_id         UUID                        NULL REFERENCES public.categories(id) ON DELETE SET NULL,
    name                TEXT                        NOT NULL CHECK (char_length(trim(name)) > 0),
    amount              NUMERIC(14, 2)              NOT NULL CHECK (amount > 0),
    cycle               public.billing_cycle        NOT NULL,
    start_date          DATE                        NOT NULL DEFAULT CURRENT_DATE,
    next_renewal_date   DATE                        NOT NULL,
    status              public.subscription_status  NOT NULL DEFAULT 'active',
    notes               TEXT                        NULL,
    created_at          TIMESTAMPTZ                 NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ                 NOT NULL DEFAULT now(),

    -- Next renewal must be on or after start date
    CONSTRAINT chk_subscriptions_renewal_date CHECK (next_renewal_date >= start_date),

    -- Composite FK: if account_id is set, user must own it
    -- ON DELETE RESTRICT: accounts must be archived, not deleted
    CONSTRAINT fk_subscriptions_user_account
        FOREIGN KEY (user_id, account_id)
        REFERENCES public.accounts(user_id, id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE public.subscriptions IS 'Recurring subscription tracking (V2: tracking and reminders only, no auto-transaction generation).';

-- ---------------------------------------------------------------------------
-- 2. Subscription category ownership validation trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_validate_subscription_category()
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
    IF NEW.category_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT is_system, user_id, type
    INTO v_cat_is_system, v_cat_user_id, v_cat_type
    FROM public.categories
    WHERE id = NEW.category_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription category % does not exist', NEW.category_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- System categories can be used by any user
    IF v_cat_is_system THEN
        -- System categories must be expense type for subscriptions
        IF v_cat_type <> 'expense' THEN
            RAISE EXCEPTION 'Subscriptions can only reference expense categories'
                USING ERRCODE = 'check_violation';
        END IF;
        RETURN NEW;
    END IF;

    -- Custom category must belong to same user
    IF v_cat_user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Subscription category does not belong to the user'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Subscription category must be expense type
    IF v_cat_type <> 'expense' THEN
        RAISE EXCEPTION 'Subscriptions can only reference expense categories'
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_subscriptions_validate_category
    BEFORE INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validate_subscription_category();

-- ---------------------------------------------------------------------------
-- 3. Updated_at trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: own subscriptions
CREATE POLICY "subscriptions_select" ON public.subscriptions
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

-- INSERT: own subscriptions
CREATE POLICY "subscriptions_insert" ON public.subscriptions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

-- UPDATE: own subscriptions
CREATE POLICY "subscriptions_update" ON public.subscriptions
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- DELETE: own subscriptions
CREATE POLICY "subscriptions_delete" ON public.subscriptions
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 5. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions (user_id, status);
CREATE INDEX idx_subscriptions_next_renewal ON public.subscriptions (user_id, next_renewal_date) WHERE status = 'active';
