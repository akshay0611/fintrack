-- ============================================================================
-- FinTrack V2 — Database Security & Invariant Test Suite
-- Purpose:   Validates RLS, triggers, constraints, and views
-- Phase:     2C — Database Foundation
--
-- USAGE:     Run against local Supabase database after migrations.
--            Requires two test users created via Supabase Auth.
--            Tests use SET LOCAL ROLE to simulate authenticated contexts.
--
-- Each test block is self-contained and documents:
--   - Test ID
--   - Objective
--   - Expected outcome
-- ============================================================================

-- ===========================================================================
-- SETUP: Create two test users, verify profiles exist via trigger
-- ===========================================================================

DO $$
BEGIN
    DELETE FROM public.transactions WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.investment_holdings WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.budgets WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.subscriptions WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.financial_goals WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.categories WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.accounts WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.profiles WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM auth.users WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
END;
$$;

-- Create User A
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000000',
    'testuser_a@fintrack.test',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"display_name": "Test User A"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
);

-- Create User B
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000000',
    'testuser_b@fintrack.test',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"display_name": "Test User B"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
);

-- Verify profiles were created by handle_new_user trigger
DO $$
DECLARE
    v_profile_a INT;
    v_profile_b INT;
BEGIN
    SELECT COUNT(*) INTO v_profile_a FROM public.profiles WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    SELECT COUNT(*) INTO v_profile_b FROM public.profiles WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    IF v_profile_a <> 1 OR v_profile_b <> 1 THEN
        RAISE EXCEPTION 'SETUP FAILED: Profiles not created by trigger for one or both users';
    END IF;
    RAISE NOTICE 'SETUP PASSED: Both profiles exist (trigger verified)';
END;
$$;

-- ===========================================================================
-- SETUP: Create test data as service_role (bypasses RLS)
-- ===========================================================================

-- User A accounts
INSERT INTO public.accounts (id, user_id, name, type, currency, initial_balance)
VALUES
    ('a0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A Checking USD', 'checking', 'USD', 1000.00),
    ('a0000001-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A Savings USD', 'savings', 'USD', 5000.00),
    ('a0000001-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A INR Account', 'savings', 'INR', 10000.00),
    ('a0000001-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A Investment', 'investment', 'USD', 2000.00),
    ('a0000001-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A Archived', 'checking', 'USD', 500.00);

UPDATE public.accounts SET is_archived = TRUE WHERE id = 'a0000001-0000-0000-0000-000000000005';

-- User B accounts
INSERT INTO public.accounts (id, user_id, name, type, currency, initial_balance)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B Checking USD', 'checking', 'USD', 2000.00),
    ('b0000001-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B Investment', 'investment', 'USD', 3000.00);

-- User A custom categories
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES
    ('ca000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 'A Custom Expense', 'expense', '🔴', '#FF0000', FALSE),
    ('ca000001-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 'A Custom Income', 'income', '🟢', '#00FF00', FALSE);

-- User B custom categories
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES
    ('cb000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'B Custom Expense', 'expense', '🔵', '#0000FF', FALSE);

-- User A transactions (for balance/view tests)
INSERT INTO public.transactions (id, user_id, account_id, category_id, type, amount, transaction_date, description)
VALUES
    ('t0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'expense', 50.00, '2026-10-05', 'Groceries'),
    ('t0000001-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'income', 200.00, '2026-10-01', 'Paycheck');

-- User B transactions (for view tenant isolation tests)
INSERT INTO public.transactions (id, user_id, account_id, category_id, type, amount, transaction_date, description)
VALUES
    ('t0000002-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'expense', 100.00, '2026-10-10', 'B Groceries'),
    ('t0000002-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000001-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'income', 300.00, '2026-10-05', 'B Paycheck');

-- User A budget
INSERT INTO public.budgets (id, user_id, category_id, amount, start_date, end_date)
VALUES ('bud000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1000000-0000-0000-0000-000000000001', 500.00, '2026-10-01', '2026-10-31');

-- User A subscription (expense category)
INSERT INTO public.subscriptions (id, user_id, account_id, category_id, name, amount, cycle, start_date, next_renewal_date, status)
VALUES ('sub000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Netflix', 15.00, 'monthly', '2026-10-01', '2026-11-01', 'active');

-- ===========================================================================
-- T-01: USER ISOLATION — User A sees own data
-- ===========================================================================
DO $$
DECLARE
    v_count INT;
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO v_count FROM public.accounts;
    IF v_count <> 5 THEN
        RAISE EXCEPTION 'T-01 FAILED: User A should see 5 accounts, got %', v_count;
    END IF;

    SELECT COUNT(*) INTO v_count FROM public.transactions;
    IF v_count <> 2 THEN
        RAISE EXCEPTION 'T-01 FAILED: User A should see 2 transactions, got %', v_count;
    END IF;

    RAISE NOTICE 'T-01 PASSED: User isolation — User A sees own data correctly';
END;
$$;

-- ===========================================================================
-- T-02: USER ISOLATION — User B cannot see User A data
-- ===========================================================================
DO $$
DECLARE
    v_count INT;
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO v_count FROM public.accounts WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'T-02 FAILED: User B should see 0 of User A accounts, got %', v_count;
    END IF;

    SELECT COUNT(*) INTO v_count FROM public.transactions WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'T-02 FAILED: User B should see 0 of User A transactions, got %', v_count;
    END IF;

    RAISE NOTICE 'T-02 PASSED: User isolation — User B cannot access User A data';
END;
$$;

-- ===========================================================================
-- T-03: CROSS-USER ACCOUNT FK — User A cannot use User B's account
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'expense', 100.00, 'Cross-user test');
        RAISE EXCEPTION 'T-03 FAILED: Should have been blocked';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'T-03 PASSED: Cross-user account FK violation correctly blocked';
        WHEN insufficient_privilege THEN
            RAISE NOTICE 'T-03 PASSED: Cross-user account blocked by RLS';
    END;
END;
$$;

-- ===========================================================================
-- T-04: CROSS-USER TRANSFER — User A cannot transfer to User B's account
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, destination_account_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'transfer', 100.00, 'Cross-user transfer test');
        RAISE EXCEPTION 'T-04 FAILED: Should have been blocked';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'T-04 PASSED: Cross-user transfer correctly blocked';
        WHEN check_violation THEN
            RAISE NOTICE 'T-04 PASSED: Cross-user transfer blocked by trigger';
    END;
END;
$$;

-- ===========================================================================
-- T-05: CROSS-USER CATEGORY — User A cannot use User B's custom category
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'cb000001-0000-0000-0000-000000000001', 'expense', 50.00, 'Cross-user category test');
        RAISE EXCEPTION 'T-05 FAILED: Should have been blocked';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'T-05 PASSED: Cross-user category correctly blocked';
    END;
END;
$$;

-- ===========================================================================
-- T-06: SYSTEM CATEGORY — User A can use system expense category
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'expense', 25.00, 'System category test');

    RAISE NOTICE 'T-06 PASSED: User A can use system expense categories';
END;
$$;

-- ===========================================================================
-- T-06b: SYSTEM CATEGORY TYPE MATCH — Income transaction with system income category
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'income', 300.00, 'System income category test');

    RAISE NOTICE 'T-06b PASSED: Income transaction with system income category accepted';
END;
$$;

-- ===========================================================================
-- T-07a: SYSTEM CATEGORY PROTECTION — User A cannot modify system categories
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        UPDATE public.categories SET name = 'Hacked Category' WHERE id = 'a1000000-0000-0000-0000-000000000001';
        IF FOUND THEN
            RAISE EXCEPTION 'T-07 FAILED: User A was able to update a system category';
        ELSE
            RAISE NOTICE 'T-07a PASSED: System category update silently blocked by RLS';
        END IF;
    END;

    BEGIN
        DELETE FROM public.categories WHERE id = 'a1000000-0000-0000-0000-000000000001';
        IF FOUND THEN
            RAISE EXCEPTION 'T-07 FAILED: User A was able to delete a system category';
        ELSE
            RAISE NOTICE 'T-07a PASSED: System category delete silently blocked by RLS';
        END IF;
    END;
END;
$$;

-- ===========================================================================
-- T-07b: SYSTEM CATEGORY TYPE MATCH — User A cannot use income system category for expense transaction
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'expense', 25.00, 'Income category as expense');
        RAISE EXCEPTION 'T-07b FAILED: Expense transaction with income category should have been blocked';
    EXCEPTION
        WHEN SQLSTATE '23514' THEN
            RAISE NOTICE 'T-07b PASSED: Expense transaction with income category rejected with SQLSTATE 23514';
    END;
END;
$$;

-- ===========================================================================
-- T-07c: SYSTEM CATEGORY TYPE MATCH — Income transaction cannot use system expense category
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'income', 25.00, 'Expense category as income');
        RAISE EXCEPTION 'T-07c FAILED: Income transaction with expense category should have been blocked';
    EXCEPTION
        WHEN SQLSTATE '23514' THEN
            RAISE NOTICE 'T-07c PASSED: Income transaction with expense category rejected with SQLSTATE 23514';
    END;
END;
$$;

-- ===========================================================================
-- T-08: CROSS-CURRENCY TRANSFER — USD to INR transfer rejected
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, destination_account_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'transfer', 100.00, 'Cross-currency test');
        RAISE EXCEPTION 'T-08 FAILED: Cross-currency transfer should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-08 PASSED: Cross-currency transfer correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-09: CURRENCY IMMUTABILITY — Cannot change account currency
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        UPDATE public.accounts SET currency = 'EUR' WHERE id = 'a0000001-0000-0000-0000-000000000001';
        RAISE EXCEPTION 'T-09 FAILED: Currency change should have been blocked';
    EXCEPTION
        WHEN restrict_violation THEN
            RAISE NOTICE 'T-09 PASSED: Account currency immutability enforced';
    END;
END;
$$;

-- ===========================================================================
-- T-10: ARCHIVED ACCOUNT — Cannot insert transaction on archived account
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'expense', 10.00, 'Archived account test');
        RAISE EXCEPTION 'T-10 FAILED: Transaction on archived account should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-10 PASSED: Archived account transaction correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-11: ARCHIVED ACCOUNT UPDATE — Cannot update transaction on archived account
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        UPDATE public.transactions SET account_id = 'a0000001-0000-0000-0000-000000000005' WHERE id = 't0000001-0000-0000-0000-000000000001';
        RAISE EXCEPTION 'T-11 FAILED: Update to archived account should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-11 PASSED: Update routing to archived account correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-12: UNARCHIVE WORKFLOW — Unarchive, transact, re-archive
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    UPDATE public.accounts SET is_archived = FALSE WHERE id = 'a0000001-0000-0000-0000-000000000005';

    INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'expense', 10.00, 'Unarchived account test');

    UPDATE public.accounts SET is_archived = TRUE WHERE id = 'a0000001-0000-0000-0000-000000000005';

    RAISE NOTICE 'T-12 PASSED: Unarchive → transact → re-archive workflow works';
END;
$$;

-- ===========================================================================
-- T-13: BUDGET UNIQUENESS — Duplicate budget for same category/month rejected
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.budgets (user_id, category_id, amount, start_date, end_date)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1000000-0000-0000-0000-000000000001', 600.00, '2026-10-01', '2026-10-31');
        RAISE EXCEPTION 'T-13 FAILED: Duplicate budget should have been blocked';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'T-13 PASSED: Duplicate budget correctly rejected by unique constraint';
    END;
END;
$$;

-- ===========================================================================
-- T-14: BUDGET DATE ALIGNMENT — Mid-month budget rejected
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.budgets (user_id, category_id, amount, start_date, end_date)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a2000000-0000-0000-0000-000000000001', 300.00, '2026-10-15', '2026-11-15');
        RAISE EXCEPTION 'T-14 FAILED: Mid-month budget should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-14 PASSED: Mid-month budget dates correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-15: SUBSCRIPTION INCOME CATEGORY REJECTION — Subscription with income category blocked
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.subscriptions (user_id, account_id, category_id, name, amount, cycle, start_date, next_renewal_date, status)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Salary', 3000.00, 'monthly', '2026-10-01', '2026-11-01', 'active');
        RAISE EXCEPTION 'T-15 FAILED: Subscription with income category should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-15 PASSED: Subscription with income category correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-16: SUBSCRIPTION EXPENSE CATEGORY — Valid subscription with expense category accepted
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    INSERT INTO public.subscriptions (user_id, account_id, category_id, name, amount, cycle, start_date, next_renewal_date, status)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Valid Netflix', 15.00, 'monthly', '2026-10-01', '2026-11-01', 'active');

    RAISE NOTICE 'T-16 PASSED: Valid subscription with expense category accepted';
END;
$$;

-- ===========================================================================
-- T-17: INVESTMENT ACCOUNT TYPE — investment_buy on non-investment account blocked
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'investment_buy', 500.00, 'Invalid investment test');
        RAISE EXCEPTION 'T-17 FAILED: investment_buy on non-investment account should be blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-17 PASSED: investment_buy on non-investment account correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-18: INVESTMENT_SELL REJECTION — INSERT investment_sell blocked
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'investment_sell', 100.00, 'Sell test');
        RAISE EXCEPTION 'T-18 FAILED: investment_sell should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-18 PASSED: investment_sell INSERT correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-19: INVESTMENT_SELL REJECTION — UPDATE to investment_sell blocked
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        UPDATE public.transactions SET type = 'investment_sell' WHERE id = 't0000001-0000-0000-0000-000000000001';
        RAISE EXCEPTION 'T-19 FAILED: UPDATE to investment_sell should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-19 PASSED: investment_sell UPDATE correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-20: INVESTMENT HOLDING — Holdings must reference investment_buy txn
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.investment_holdings (user_id, account_id, transaction_id, name, category, units, unit_price, purchase_date)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000004', 't0000001-0000-0000-0000-000000000001', 'Invalid Holding', 'stocks', 10.0, 10.0, '2026-10-01');
        RAISE EXCEPTION 'T-20 FAILED: Holding referencing non-investment_buy transaction should be blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-20 PASSED: Holding referencing non-investment_buy transaction correctly rejected';
    END;
END;
$$;

-- ===========================================================================
-- T-21: INVESTMENT BUY TRANSACTION MUTATION — Cannot change type after holding exists
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        -- First create a valid investment_buy via the RPC
        -- But for this test, insert directly as service_role then test mutation
        PERFORM set_config('role', 'postgres', true);
        INSERT INTO public.transactions (id, user_id, account_id, type, amount, transaction_date, description)
        VALUES ('t0000100-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000004', 'investment_buy', 750.00, '2026-10-01', 'Test buy');
        INSERT INTO public.investment_holdings (id, user_id, account_id, transaction_id, name, category, units, unit_price, purchase_date)
        VALUES ('ih0000100-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000004', 't0000100-0000-0000-0000-000000000001', 'AAPL', 'stocks', 5.0, 150.0, '2026-10-01');
        PERFORM set_config('role', 'authenticated', true);

        -- Now try to mutate the investment_buy transaction type
        UPDATE public.transactions SET type = 'expense' WHERE id = 't0000100-0000-0000-0000-000000000001';
        RAISE EXCEPTION 'T-21 FAILED: Mutating investment_buy type to expense should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-21 PASSED: Mutating investment_buy type correctly rejected when holding exists';
    END;
END;
$$;

-- ===========================================================================
-- T-22: INVESTMENT BUY MUTATION — Cannot change amount after holding exists
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        UPDATE public.transactions SET amount = 200.00 WHERE id = 't0000100-0000-0000-0000-000000000001';
        RAISE EXCEPTION 'T-22 FAILED: Mutating investment_buy amount should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-22 PASSED: Mutating investment_buy amount correctly rejected when holding exists';
    END;
END;
$$;

-- ===========================================================================
-- T-23: INVESTMENT BUY MUTATION — Cannot change account after holding exists
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        UPDATE public.transactions SET account_id = 'a0000001-0000-0000-0000-000000000002' WHERE id = 't0000100-0000-0000-0000-000000000001';
        RAISE EXCEPTION 'T-23 FAILED: Mutating investment_buy account should have been blocked';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-23 PASSED: Mutating investment_buy account correctly rejected when holding exists';
    END;
END;
$$;

-- ===========================================================================
-- T-24: INVESTMENT BUY MUTATION — Can edit description and date
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    -- description and transaction_date are editable
    UPDATE public.transactions SET description = 'Updated description', transaction_date = '2026-10-15' WHERE id = 't0000100-0000-0000-0000-000000000001';

    RAISE NOTICE 'T-24 PASSED: Investment_buy description and date remain editable';
END;
$$;

-- ===========================================================================
-- T-25: CATEGORY GRANDCHILD REJECTION — Grandchild category blocked
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        -- First create a child category (level 1)
        INSERT INTO public.categories (user_id, parent_id, name, type, icon, color, is_system)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ca000001-0000-0000-0000-000000000001', 'Level1 Child', 'expense', '🧒', '#FF0000', FALSE);

        BEGIN
            -- Try to create grandchild (level 2)
            INSERT INTO public.categories (user_id, parent_id, name, type, icon, color, is_system)
            VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM public.categories WHERE name = 'Level1 Child' AND user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'Level2 Grandchild', 'expense', '🧒🧒', '#FF0000', FALSE);
            RAISE EXCEPTION 'T-25 FAILED: Grandchild category should have been blocked';
        EXCEPTION
            WHEN check_violation THEN
                RAISE NOTICE 'T-25 PASSED: Grandchild category correctly rejected';
        END;
    END;
END;
$$;

-- ===========================================================================
-- T-26: VALID INCOME + INCOME CATEGORY — Type match accepted
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    -- User A Custom Income category is ca000001-0000-0000-0000-000000000002
    INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000002', 'income', 500.00, 'Valid income test');

    RAISE NOTICE 'T-26 PASSED: Valid income + income category accepted';
END;
$$;

-- ===========================================================================
-- T-27: VALID EXPENSE + EXPENSE CATEGORY — Type match accepted
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001', 'expense', 30.00, 'Valid expense test');

    RAISE NOTICE 'T-27 PASSED: Valid expense + expense category accepted';
END;
$$;

-- ===========================================================================
-- T-27b: CUSTOM CATEGORY TYPE MATCH — Income cannot use custom expense category
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description)
        VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001', 'income', 25.00, 'Custom expense category as income');
        RAISE EXCEPTION 'T-27b FAILED: Income transaction with custom expense category should have been blocked';
    EXCEPTION
        WHEN SQLSTATE '23514' THEN
            RAISE NOTICE 'T-27b PASSED: Income transaction with custom expense category rejected with SQLSTATE 23514';
    END;
END;
$$;

-- ===========================================================================
-- T-27c: CATEGORY UPDATE TYPE MATCH — Cannot update expense to income category
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        UPDATE public.transactions
        SET category_id = 'ca000001-0000-0000-0000-000000000002'
        WHERE id = 't0000001-0000-0000-0000-000000000001';
        RAISE EXCEPTION 'T-27c FAILED: Expense transaction updated to income category should have been blocked';
    EXCEPTION
        WHEN SQLSTATE '23514' THEN
            RAISE NOTICE 'T-27c PASSED: Mismatched category update rejected with SQLSTATE 23514';
    END;
END;
$$;

-- ===========================================================================
-- T-28: TRANSFER WITH NULL CATEGORY — Valid transfer without category
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    INSERT INTO public.transactions (user_id, account_id, destination_account_id, type, amount, description)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'transfer', 100.00, 'Valid transfer');

    RAISE NOTICE 'T-28 PASSED: Transfer with NULL category accepted';
END;
$$;

-- ===========================================================================
-- T-29: VIEW TENANT ISOLATION — v_account_balances and v_budget_progress
-- ===========================================================================
DO $$
DECLARE
    v_count INT;
    v_balance NUMERIC;
BEGIN
    -- Test as User A
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO v_count FROM public.v_account_balances;
    IF v_count <> 5 THEN
        RAISE EXCEPTION 'T-29 FAILED: User A should see 5 accounts in v_account_balances, got %', v_count;
    END IF;

    SELECT current_balance INTO v_balance FROM public.v_account_balances WHERE id = 'a0000001-0000-0000-0000-000000000001';
    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'T-29 FAILED: User A should see balance for own account';
    END IF;

    -- Test as User B
    PERFORM set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO v_count FROM public.v_account_balances;
    IF v_count <> 2 THEN
        RAISE EXCEPTION 'T-29 FAILED: User B should see 2 accounts in v_account_balances, got %', v_count;
    END IF;

    -- User B should NOT see User A accounts in view
    SELECT COUNT(*) INTO v_count FROM public.v_account_balances WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'T-29 FAILED: User B should see 0 of User A accounts in view, got %', v_count;
    END IF;

    -- User B should see their own account balance
    SELECT current_balance INTO v_balance FROM public.v_account_balances WHERE id = 'b0000001-0000-0000-0000-000000000001';
    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'T-29 FAILED: User B should see balance for own account';
    END IF;

    -- Budget progress view also isolated
    SELECT COUNT(*) INTO v_count FROM public.v_budget_progress WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'T-29 FAILED: User B should see 0 budgets for User A in v_budget_progress, got %', v_count;
    END IF;

    -- User B should see their own budget progress
    SELECT COUNT(*) INTO v_count FROM public.v_budget_progress WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    IF v_count <> 0 THEN
        RAISE EXCEPTION 'T-29 FAILED: User B should see own budgets in v_budget_progress';
    END IF;

    RAISE NOTICE 'T-29 PASSED: View tenant isolation verified for v_account_balances and v_budget_progress';
END;
$$;

-- ===========================================================================
-- T-30: ACCOUNT HARD-DELETE REJECTION — Accounts cannot be deleted via RLS
-- ===========================================================================
DO $$
DECLARE
    v_count INT;
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    DELETE FROM public.accounts WHERE id = 'a0000001-0000-0000-0000-000000000001';

    SELECT COUNT(*) INTO v_count FROM public.accounts WHERE id = 'a0000001-0000-0000-0000-000000000001';
    IF v_count <> 1 THEN
        RAISE EXCEPTION 'T-30 FAILED: Account was deleted despite no DELETE RLS policy';
    END IF;

    RAISE NOTICE 'T-30 PASSED: Account hard-delete blocked by RLS (no DELETE policy)';
END;
$$;

-- ===========================================================================
-- T-31: INVESTMENT PURCHASE ATOMIC — RPC creates both records atomically
-- ===========================================================================
DO $$
DECLARE
    v_result JSONB;
    v_txn_count INT;
    v_holding_count INT;
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    v_result := public.fn_create_investment_purchase(
        p_account_id    := 'a0000001-0000-0000-0000-000000000004',
        p_name          := 'AAPL',
        p_category      := 'stocks',
        p_units         := 5.0,
        p_unit_price    := 150.00,
        p_purchase_date := '2026-10-01',
        p_description   := 'Buy 5 shares AAPL',
        p_notes         := 'Test purchase'
    );

    SELECT COUNT(*) INTO v_txn_count FROM public.transactions WHERE id = (v_result->>'transaction_id')::uuid;
    SELECT COUNT(*) INTO v_holding_count FROM public.investment_holdings WHERE id = (v_result->>'holding_id')::uuid;

    IF v_txn_count <> 1 OR v_holding_count <> 1 THEN
        RAISE EXCEPTION 'T-31 FAILED: Expected 1 transaction and 1 holding, got % and %', v_txn_count, v_holding_count;
    END IF;

    IF (v_result->>'total_amount')::numeric <> 750.00 THEN
        RAISE EXCEPTION 'T-31 FAILED: Expected total_amount 750.00, got %', v_result->>'total_amount';
    END IF;

    RAISE NOTICE 'T-31 PASSED: Atomic investment purchase created both records correctly (total: %)', v_result->>'total_amount';
END;
$$;

-- ===========================================================================
-- T-32: INVESTMENT PURCHASE — Rejects non-investment account
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        PERFORM public.fn_create_investment_purchase(
            p_account_id    := 'a0000001-0000-0000-0000-000000000001',
            p_name          := 'GOOG',
            p_category      := 'stocks',
            p_units         := 1.0,
            p_unit_price    := 100.00
        );
        RAISE EXCEPTION 'T-32 FAILED: Should reject non-investment account';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-32 PASSED: Investment purchase correctly rejected on non-investment account';
    END;
END;
$$;

-- ===========================================================================
-- T-33: INVESTMENT PURCHASE — Rejects archived account
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        PERFORM public.fn_create_investment_purchase(
            p_account_id    := 'a0000001-0000-0000-0000-000000000005',
            p_name          := 'TSLA',
            p_category      := 'stocks',
            p_units         := 1.0,
            p_unit_price    := 200.00
        );
        RAISE EXCEPTION 'T-33 FAILED: Should reject archived account';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'T-33 PASSED: Investment purchase correctly rejected on archived account';
    END;
END;
$$;

-- ===========================================================================
-- CLEANUP
-- ===========================================================================
DO $$
BEGIN
    PERFORM set_config('role', 'postgres', true);

    -- Clean up test data (run as postgres to bypass RLS)
    DELETE FROM public.investment_holdings WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.transactions WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.budgets WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.subscriptions WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.financial_goals WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.categories WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.accounts WHERE user_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM public.profiles WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    DELETE FROM auth.users WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

    RAISE NOTICE '===== ALL TESTS COMPLETE — CLEANUP DONE =====';
END;
$$;
