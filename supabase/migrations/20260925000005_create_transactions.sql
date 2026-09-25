-- ============================================================================
-- Migration: 20260925000005_create_transactions.sql
-- Purpose:   Unified financial ledger, invariant triggers, RLS, indexes
-- Phase:     2C — Database Foundation
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Transactions table
-- ---------------------------------------------------------------------------
CREATE TABLE public.transactions (
    id                      UUID                    NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                 UUID                    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id              UUID                    NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    destination_account_id  UUID                    NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    category_id             UUID                    NULL REFERENCES public.categories(id) ON DELETE SET NULL,
    type                    public.transaction_type NOT NULL,
    amount                  NUMERIC(14, 2)          NOT NULL CHECK (amount > 0),
    transaction_date        DATE                    NOT NULL DEFAULT CURRENT_DATE,
    description             TEXT                    NOT NULL CHECK (char_length(trim(description)) > 0),
    notes                   TEXT                    NULL,
    created_at              TIMESTAMPTZ             NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ             NOT NULL DEFAULT now(),

    -- Transfer: destination required, must differ from source
    -- Non-transfer: destination must be NULL
    CONSTRAINT chk_transactions_transfer_semantics CHECK (
        (type = 'transfer' AND destination_account_id IS NOT NULL AND account_id <> destination_account_id) OR
        (type <> 'transfer' AND destination_account_id IS NULL)
    ),

    -- Income/expense require a category; transfer/investment_buy/investment_sell do not
    CONSTRAINT chk_transactions_category_semantics CHECK (
        (type IN ('income', 'expense') AND category_id IS NOT NULL) OR
        (type NOT IN ('income', 'expense'))
    ),

    -- Composite FK to enforce user owns the source account
    CONSTRAINT fk_transactions_user_account
        FOREIGN KEY (user_id, account_id)
        REFERENCES public.accounts(user_id, id)
        ON DELETE RESTRICT,

    -- Composite FK to enforce user owns the destination account
    CONSTRAINT fk_transactions_user_destination_account
        FOREIGN KEY (user_id, destination_account_id)
        REFERENCES public.accounts(user_id, id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE public.transactions IS 'Single authoritative financial ledger unifying income, expenses, transfers, and investment cash settlements.';

-- ---------------------------------------------------------------------------
-- 2. Transaction invariant enforcement trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enforce_transaction_invariants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_src_currency VARCHAR(3);
    v_src_archived BOOLEAN;
    v_src_type public.account_type;
    v_dst_currency VARCHAR(3);
    v_dst_archived BOOLEAN;
    v_dst_user_id UUID;
BEGIN
    -- Fetch source account details
    SELECT currency, is_archived, type
    INTO v_src_currency, v_src_archived, v_src_type
    FROM public.accounts
    WHERE id = NEW.account_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source account % does not exist', NEW.account_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Block transactions on archived source account
    IF v_src_archived THEN
        RAISE EXCEPTION 'Cannot create or update transactions on archived account %', NEW.account_id
            USING ERRCODE = 'check_violation';
    END IF;

    -- Investment_buy must use an investment-type account
    IF NEW.type = 'investment_buy' THEN
        IF v_src_type <> 'investment' THEN
            RAISE EXCEPTION 'Transactions of type investment_buy must use an account of type investment'
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    -- investment_sell is rejected in V2 — this trigger blocks it at the database layer
    IF NEW.type = 'investment_sell' THEN
        RAISE EXCEPTION 'investment_sell is not supported in FinTrack V2; use fn_create_investment_purchase for V2 buy-side tracking'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Transfer validations
    IF NEW.type = 'transfer' AND NEW.destination_account_id IS NOT NULL THEN
        SELECT currency, is_archived, user_id
        INTO v_dst_currency, v_dst_archived, v_dst_user_id
        FROM public.accounts
        WHERE id = NEW.destination_account_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Destination account % does not exist', NEW.destination_account_id
                USING ERRCODE = 'foreign_key_violation';
        END IF;

        -- Block transfers to archived destination
        IF v_dst_archived THEN
            RAISE EXCEPTION 'Cannot transfer to archived account %', NEW.destination_account_id
                USING ERRCODE = 'check_violation';
        END IF;

        -- Destination must belong to same user
        IF v_dst_user_id <> NEW.user_id THEN
            RAISE EXCEPTION 'Destination account does not belong to the user'
                USING ERRCODE = 'foreign_key_violation';
        END IF;

        -- Same-currency enforcement (no FX in V2)
        IF v_src_currency <> v_dst_currency THEN
            RAISE EXCEPTION 'Cross-currency transfers are not supported. Source (%) and destination (%) currencies must match.',
                v_src_currency, v_dst_currency
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transactions_enforce_invariants
    BEFORE INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_transaction_invariants();

-- ---------------------------------------------------------------------------
-- 3. Category ownership and type validation trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_validate_category_ownership()
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
    -- NULL category is valid for non-income/expense types (transfers, investment_buy, investment_sell)
    IF NEW.category_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT is_system, user_id, type
    INTO v_cat_is_system, v_cat_user_id, v_cat_type
    FROM public.categories
    WHERE id = NEW.category_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Category % does not exist', NEW.category_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- System categories can be used by any user
    IF v_cat_is_system THEN
        -- System categories must still match transaction type for income/expense
        IF NEW.type IN ('income', 'expense') AND v_cat_type <> NEW.type THEN
            RAISE EXCEPTION 'Category type (%) does not match transaction type (%)', v_cat_type, NEW.type
                USING ERRCODE = 'check_violation';
        END IF;
        RETURN NEW;
    END IF;

    -- Custom categories must belong to the same user
    IF v_cat_user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Category does not belong to the user'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Custom category type must match transaction type for income/expense
    IF NEW.type IN ('income', 'expense') AND v_cat_type <> NEW.type THEN
        RAISE EXCEPTION 'Category type (%) does not match transaction type (%)', v_cat_type, NEW.type
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transactions_validate_category
    BEFORE INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validate_category_ownership();

-- ---------------------------------------------------------------------------
-- 4. Investment buy immutability trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enforce_investment_buy_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_holding_count INT;
BEGIN
    -- Only check investment_buy transactions
    IF OLD.type <> 'investment_buy' OR NEW.type <> 'investment_buy' THEN
        RETURN NEW;
    END IF;

    -- Check if a linked investment_holding exists
    SELECT COUNT(*) INTO v_holding_count
    FROM public.investment_holdings
    WHERE transaction_id = OLD.id;

    -- If a holding exists, prevent mutation of ownership-critical fields
    IF v_holding_count > 0 THEN
        IF OLD.user_id IS DISTINCT FROM NEW.user_id
            OR OLD.account_id IS DISTINCT FROM NEW.account_id
            OR OLD.type IS DISTINCT FROM NEW.type
            OR OLD.amount IS DISTINCT FROM NEW.amount THEN
            RAISE EXCEPTION 'Cannot modify user_id, account_id, type, or amount of an investment_buy transaction that has a linked investment_holding'
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transactions_enforce_investment_buy_immutability
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_investment_buy_immutability();

-- ---------------------------------------------------------------------------
-- 5. Updated_at trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- SELECT: own transactions
CREATE POLICY "transactions_select" ON public.transactions
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

-- INSERT: own transactions
CREATE POLICY "transactions_insert" ON public.transactions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

-- UPDATE: own transactions
CREATE POLICY "transactions_update" ON public.transactions
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- DELETE: own transactions
CREATE POLICY "transactions_delete" ON public.transactions
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 7. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_transactions_user_date ON public.transactions (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account ON public.transactions (account_id);
CREATE INDEX idx_transactions_dest_account ON public.transactions (destination_account_id) WHERE destination_account_id IS NOT NULL;
CREATE INDEX idx_transactions_category ON public.transactions (category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_transactions_user_type_date ON public.transactions (user_id, type, transaction_date DESC);
