-- ============================================================================
-- Migration: 20260925000003_create_accounts.sql
-- Purpose:   Financial accounts table, RLS, currency immutability, updated_at
-- Phase:     2C — Database Foundation
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Accounts table
-- ---------------------------------------------------------------------------
CREATE TABLE public.accounts (
    id              UUID            NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name            TEXT            NOT NULL CHECK (char_length(trim(name)) > 0),
    type            public.account_type NOT NULL,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
    initial_balance NUMERIC(14, 2)  NOT NULL DEFAULT 0.00,
    is_archived     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    -- Unique account name per user
    CONSTRAINT uq_accounts_user_name UNIQUE (user_id, name)
);

-- Composite unique for cross-table ownership FKs: (user_id, id)
-- This enables composite foreign keys from child tables to enforce same-user ownership
CREATE UNIQUE INDEX uq_accounts_user_id ON public.accounts (user_id, id);

COMMENT ON TABLE public.accounts IS 'Financial containers (checking, savings, credit card, cash, investment). Balance is computed via the transaction ledger.';

-- ---------------------------------------------------------------------------
-- 2. Currency immutability trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enforce_account_currency_immutable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF OLD.currency IS DISTINCT FROM NEW.currency THEN
        RAISE EXCEPTION 'Account currency cannot be changed after creation'
            USING ERRCODE = 'restrict_violation';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_accounts_currency_immutable
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_account_currency_immutable();

-- ---------------------------------------------------------------------------
-- 3. Updated_at trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- SELECT: own accounts
CREATE POLICY "accounts_select" ON public.accounts
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

-- INSERT: own accounts
CREATE POLICY "accounts_insert" ON public.accounts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

-- UPDATE: own accounts
CREATE POLICY "accounts_update" ON public.accounts
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- DELETE: DENIED — accounts are archived, never hard-deleted
-- No DELETE policy means RLS blocks all deletes by authenticated users.

-- ---------------------------------------------------------------------------
-- 5. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_accounts_user_archived ON public.accounts (user_id, is_archived);
