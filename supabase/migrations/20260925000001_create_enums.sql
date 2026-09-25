-- ============================================================================
-- Migration: 20260925000001_create_enums.sql
-- Purpose:   Define all custom PostgreSQL ENUM types for FinTrack V2
-- Phase:     2C — Database Foundation
-- ============================================================================

-- Account classification
CREATE TYPE public.account_type AS ENUM (
    'checking',
    'savings',
    'credit_card',
    'cash',
    'investment'
);

-- Category classification (income vs expense)
CREATE TYPE public.category_type AS ENUM (
    'income',
    'expense'
);

-- Unified transaction ledger types
-- investment_buy: fully supported in V2 (cash debit + acquisition lot)
-- investment_sell: retained for V3 forward-compatibility only; NOT a V2 workflow
CREATE TYPE public.transaction_type AS ENUM (
    'income',
    'expense',
    'transfer',
    'investment_buy',
    'investment_sell'
);

-- Subscription billing frequency
CREATE TYPE public.billing_cycle AS ENUM (
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
);

-- Subscription lifecycle status
CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'paused',
    'cancelled'
);

-- Investment asset classification
CREATE TYPE public.investment_category AS ENUM (
    'stocks',
    'mutual_funds',
    'real_estate',
    'crypto',
    'bonds',
    'gold',
    'other'
);

-- Financial goal lifecycle
CREATE TYPE public.goal_status AS ENUM (
    'in_progress',
    'achieved',
    'abandoned'
);
