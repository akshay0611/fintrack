-- ============================================================================
-- Migration: 20260925000011_create_rpc_investment_purchase.sql
-- Purpose:   Atomic investment purchase RPC function
-- Phase:     2C — Database Foundation
-- Notes:     Creates investment_buy transaction + investment_holding in a single
--            atomic operation. Both succeed or neither is created.
--            Uses SECURITY DEFINER to bypass RLS within the function body
--            while validating auth.uid() explicitly.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Atomic investment purchase function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_create_investment_purchase(
    p_account_id        UUID,
    p_name              TEXT,
    p_category          public.investment_category,
    p_units             NUMERIC(16, 6),
    p_unit_price        NUMERIC(16, 6),
    p_purchase_date     DATE DEFAULT CURRENT_DATE,
    p_description       TEXT DEFAULT NULL,
    p_notes             TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_acct_type public.account_type;
    v_acct_archived BOOLEAN;
    v_acct_user_id UUID;
    v_total_amount NUMERIC(14, 2);
    v_txn_id UUID;
    v_holding_id UUID;
    v_txn_description TEXT;
BEGIN
    -- Get authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- Validate inputs
    IF p_units IS NULL OR p_units <= 0 THEN
        RAISE EXCEPTION 'Units must be positive'
            USING ERRCODE = 'check_violation';
    END IF;

    IF p_unit_price IS NULL OR p_unit_price <= 0 THEN
        RAISE EXCEPTION 'Unit price must be positive'
            USING ERRCODE = 'check_violation';
    END IF;

    IF p_name IS NULL OR char_length(trim(p_name)) = 0 THEN
        RAISE EXCEPTION 'Investment name is required'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Compute total
    v_total_amount := ROUND(p_units * p_unit_price, 2);

    IF v_total_amount <= 0 THEN
        RAISE EXCEPTION 'Total amount must be positive'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Validate account ownership, type, and archived status
    SELECT type, is_archived, user_id
    INTO v_acct_type, v_acct_archived, v_acct_user_id
    FROM public.accounts
    WHERE id = p_account_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Account % does not exist', p_account_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    IF v_acct_user_id <> v_user_id THEN
        RAISE EXCEPTION 'Account does not belong to the authenticated user'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF v_acct_type <> 'investment' THEN
        RAISE EXCEPTION 'Investment purchases require an account of type investment, got %', v_acct_type
            USING ERRCODE = 'check_violation';
    END IF;

    IF v_acct_archived THEN
        RAISE EXCEPTION 'Cannot create investment purchase on archived account'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Build transaction description
    v_txn_description := COALESCE(p_description, 'Buy ' || trim(p_name) || ' (' || p_units || ' units @ ' || p_unit_price || ')');

    -- Create the investment_buy transaction
    INSERT INTO public.transactions (
        user_id, account_id, type, amount, transaction_date, description, notes
    ) VALUES (
        v_user_id, p_account_id, 'investment_buy', v_total_amount, p_purchase_date, v_txn_description, p_notes
    )
    RETURNING id INTO v_txn_id;

    -- Create the corresponding investment holding (acquisition lot)
    INSERT INTO public.investment_holdings (
        user_id, account_id, transaction_id, name, category, units, unit_price, purchase_date, notes
    ) VALUES (
        v_user_id, p_account_id, v_txn_id, trim(p_name), p_category, p_units, p_unit_price, p_purchase_date, p_notes
    )
    RETURNING id INTO v_holding_id;

    -- Return both IDs for application use
    RETURN jsonb_build_object(
        'transaction_id', v_txn_id,
        'holding_id', v_holding_id,
        'total_amount', v_total_amount
    );
END;
$$;

-- Harden SECURITY DEFINER: restrict access to authenticated users only
REVOKE EXECUTE ON FUNCTION public.fn_create_investment_purchase(UUID, TEXT, public.investment_category, NUMERIC, NUMERIC, DATE, TEXT, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_create_investment_purchase(UUID, TEXT, public.investment_category, NUMERIC, NUMERIC, DATE, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.fn_create_investment_purchase IS 'Atomic investment purchase: creates investment_buy transaction + acquisition lot holding in a single database transaction. Both succeed or neither is created.';
