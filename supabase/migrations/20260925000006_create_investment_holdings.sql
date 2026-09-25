-- ============================================================================
-- Migration: 20260925000006_create_investment_holdings.sql
-- Purpose:   Investment acquisition lots, holding invariants, RLS
-- Phase:     2C — Database Foundation
-- Notes:     V2 is buy-side only. Each row is an acquisition lot (not a position).
--            Multiple buys of the same asset create multiple rows.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Investment holdings table
-- ---------------------------------------------------------------------------
CREATE TABLE public.investment_holdings (
    id                UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id           UUID                        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id        UUID                        NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    transaction_id    UUID                        NOT NULL UNIQUE REFERENCES public.transactions(id) ON DELETE RESTRICT,
    name              TEXT                        NOT NULL CHECK (char_length(trim(name)) > 0),
    category          public.investment_category  NOT NULL,
    units             NUMERIC(16, 6)              NOT NULL CHECK (units > 0),
    unit_price        NUMERIC(16, 6)              NOT NULL CHECK (unit_price > 0),
    total_amount      NUMERIC(14, 2)              NOT NULL GENERATED ALWAYS AS (ROUND(units * unit_price, 2)) STORED,
    purchase_date     DATE                        NOT NULL DEFAULT CURRENT_DATE,
    notes             TEXT                        NULL,
    created_at        TIMESTAMPTZ                 NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ                 NOT NULL DEFAULT now(),

    -- Composite FK: user must own the account
    CONSTRAINT fk_holdings_user_account
        FOREIGN KEY (user_id, account_id)
        REFERENCES public.accounts(user_id, id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE public.investment_holdings IS 'Investment acquisition lots (V2: buy-side only). Each row represents a single purchase. The transaction_id UNIQUE constraint enforces 1:1 with investment_buy transactions.';

-- ---------------------------------------------------------------------------
-- 2. Holding invariant enforcement trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enforce_holding_invariants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_acct_type public.account_type;
    v_txn_type public.transaction_type;
    v_txn_user_id UUID;
    v_txn_account_id UUID;
    v_txn_amount NUMERIC(14, 2);
BEGIN
    -- Verify account is of type 'investment'
    SELECT type INTO v_acct_type
    FROM public.accounts
    WHERE id = NEW.account_id;

    IF v_acct_type <> 'investment' THEN
        RAISE EXCEPTION 'Investment holdings must be held in an account of type investment'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Verify the linked transaction
    SELECT type, user_id, account_id, amount
    INTO v_txn_type, v_txn_user_id, v_txn_account_id, v_txn_amount
    FROM public.transactions
    WHERE id = NEW.transaction_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Referenced transaction % does not exist', NEW.transaction_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Transaction must be investment_buy
    IF v_txn_type <> 'investment_buy' THEN
        RAISE EXCEPTION 'Investment holding must reference a transaction of type investment_buy, got %', v_txn_type
            USING ERRCODE = 'check_violation';
    END IF;

    -- Transaction must belong to the same user
    IF v_txn_user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Referenced transaction does not belong to the same user'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Transaction account must match holding account
    IF v_txn_account_id <> NEW.account_id THEN
        RAISE EXCEPTION 'Transaction account (%) must match holding account (%)', v_txn_account_id, NEW.account_id
            USING ERRCODE = 'check_violation';
    END IF;

    -- Transaction amount must match holding total (units * unit_price)
    IF v_txn_amount <> ROUND(NEW.units * NEW.unit_price, 2) THEN
        RAISE EXCEPTION 'Transaction amount (%) must equal units * unit_price (%)', v_txn_amount, ROUND(NEW.units * NEW.unit_price, 2)
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_holdings_enforce_invariants
    BEFORE INSERT OR UPDATE ON public.investment_holdings
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_holding_invariants();

-- ---------------------------------------------------------------------------
-- 3. Updated_at trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_holdings_updated_at
    BEFORE UPDATE ON public.investment_holdings
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.investment_holdings ENABLE ROW LEVEL SECURITY;

-- SELECT: own holdings
CREATE POLICY "holdings_select" ON public.investment_holdings
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

-- INSERT: own holdings, must own the referenced account
CREATE POLICY "holdings_insert" ON public.investment_holdings
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = (select auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.accounts a
            WHERE a.id = account_id AND a.user_id = (select auth.uid())
        )
    );

-- UPDATE: own holdings
CREATE POLICY "holdings_update" ON public.investment_holdings
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- DELETE: own holdings
CREATE POLICY "holdings_delete" ON public.investment_holdings
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 5. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_holdings_user ON public.investment_holdings (user_id);
CREATE INDEX idx_holdings_account ON public.investment_holdings (account_id);
CREATE INDEX idx_holdings_category ON public.investment_holdings (user_id, category);
CREATE INDEX idx_holdings_purchase_date ON public.investment_holdings (user_id, purchase_date DESC);
