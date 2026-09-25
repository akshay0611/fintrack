-- ============================================================================
-- Migration: 20260925000010_create_views.sql
-- Purpose:   Account balances and budget progress views with security_invoker
-- Phase:     2C — Database Foundation
-- Notes:     Both views use WITH (security_invoker = true) so PostgreSQL
--            evaluates RLS policies on underlying tables using the caller's
--            security context. No cross-tenant data leakage is possible.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Account Balances View
-- ---------------------------------------------------------------------------
-- Computes current balance from initial_balance + transaction ledger deltas.
-- Debits: expense, transfer (outgoing), investment_buy
-- Credits: income, investment_sell, transfer (incoming to destination)
CREATE OR REPLACE VIEW public.v_account_balances
WITH (security_invoker = true) AS
WITH transaction_deltas AS (
    -- Outgoing debits (cash leaves the source account)
    SELECT
        account_id,
        -amount AS delta
    FROM public.transactions
    WHERE type IN ('expense', 'transfer', 'investment_buy')

    UNION ALL

    -- Incoming credits (cash enters the source account)
    SELECT
        account_id,
        amount AS delta
    FROM public.transactions
    WHERE type IN ('income', 'investment_sell')

    UNION ALL

    -- Transfer incoming credits (cash enters the destination account)
    SELECT
        destination_account_id AS account_id,
        amount AS delta
    FROM public.transactions
    WHERE type = 'transfer' AND destination_account_id IS NOT NULL
)
SELECT
    a.id AS account_id,
    a.user_id,
    a.name,
    a.type,
    a.currency,
    a.initial_balance,
    a.is_archived,
    COALESCE(a.initial_balance + SUM(td.delta), a.initial_balance) AS current_balance,
    a.created_at,
    a.updated_at
FROM public.accounts a
LEFT JOIN transaction_deltas td ON a.id = td.account_id
GROUP BY a.id, a.user_id, a.name, a.type, a.currency, a.initial_balance, a.is_archived, a.created_at, a.updated_at;

COMMENT ON VIEW public.v_account_balances IS 'Computed account balances from initial_balance + transaction ledger. Uses security_invoker=true for RLS enforcement.';

-- ---------------------------------------------------------------------------
-- 2. Budget Progress View
-- ---------------------------------------------------------------------------
-- Evaluates actual spending strictly within the budget calendar month window.
CREATE OR REPLACE VIEW public.v_budget_progress
WITH (security_invoker = true) AS
SELECT
    b.id AS budget_id,
    b.user_id,
    b.category_id,
    c.name AS category_name,
    c.icon AS category_icon,
    c.color AS category_color,
    b.amount AS budget_limit,
    b.start_date,
    b.end_date,
    COALESCE(SUM(t.amount), 0.00) AS actual_spending,
    (b.amount - COALESCE(SUM(t.amount), 0.00)) AS remaining_amount,
    CASE
        WHEN b.amount > 0 THEN ROUND((COALESCE(SUM(t.amount), 0.00) / b.amount) * 100, 2)
        ELSE 0.00
    END AS percentage_used
FROM public.budgets b
JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.transactions t ON
    t.user_id = b.user_id
    AND t.category_id = b.category_id
    AND t.type = 'expense'
    AND t.transaction_date >= b.start_date
    AND t.transaction_date <= b.end_date
GROUP BY b.id, b.user_id, b.category_id, c.name, c.icon, c.color, b.amount, b.start_date, b.end_date;

COMMENT ON VIEW public.v_budget_progress IS 'Budget progress with actual spending for each calendar month. Uses security_invoker=true for RLS enforcement.';
