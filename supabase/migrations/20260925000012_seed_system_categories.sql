-- ============================================================================
-- Migration: 20260925000012_seed_system_categories.sql
-- Purpose:   Idempotent insertion of default system categories
-- Phase:     2C — Database Foundation
-- Notes:     These categories have is_system=TRUE and user_id=NULL.
--            They are readable by all authenticated users but immutable via RLS.
--            Uses ON CONFLICT DO NOTHING for idempotency.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Expense Categories (Top-Level)
-- ---------------------------------------------------------------------------

-- Food & Dining
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a1000000-0000-0000-0000-000000000001', NULL, NULL, 'Food & Dining', 'expense', '🍔', '#EF4444', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a1000000-0000-0000-0000-000000000002', NULL, 'a1000000-0000-0000-0000-000000000001', 'Groceries', 'expense', '🛒', '#EF4444', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a1000000-0000-0000-0000-000000000003', NULL, 'a1000000-0000-0000-0000-000000000001', 'Restaurants', 'expense', '🍽️', '#EF4444', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a1000000-0000-0000-0000-000000000004', NULL, 'a1000000-0000-0000-0000-000000000001', 'Coffee', 'expense', '☕', '#EF4444', TRUE)
ON CONFLICT DO NOTHING;

-- Housing & Utilities
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a2000000-0000-0000-0000-000000000001', NULL, NULL, 'Housing & Utilities', 'expense', '🏠', '#3B82F6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a2000000-0000-0000-0000-000000000002', NULL, 'a2000000-0000-0000-0000-000000000001', 'Rent/Mortgage', 'expense', '🏘️', '#3B82F6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a2000000-0000-0000-0000-000000000003', NULL, 'a2000000-0000-0000-0000-000000000001', 'Electricity', 'expense', '⚡', '#3B82F6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a2000000-0000-0000-0000-000000000004', NULL, 'a2000000-0000-0000-0000-000000000001', 'Internet', 'expense', '🌐', '#3B82F6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a2000000-0000-0000-0000-000000000005', NULL, 'a2000000-0000-0000-0000-000000000001', 'Water', 'expense', '💧', '#3B82F6', TRUE)
ON CONFLICT DO NOTHING;

-- Transportation
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a3000000-0000-0000-0000-000000000001', NULL, NULL, 'Transportation', 'expense', '🚗', '#10B981', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a3000000-0000-0000-0000-000000000002', NULL, 'a3000000-0000-0000-0000-000000000001', 'Fuel', 'expense', '⛽', '#10B981', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a3000000-0000-0000-0000-000000000003', NULL, 'a3000000-0000-0000-0000-000000000001', 'Public Transit', 'expense', '🚌', '#10B981', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a3000000-0000-0000-0000-000000000004', NULL, 'a3000000-0000-0000-0000-000000000001', 'Maintenance', 'expense', '🔧', '#10B981', TRUE)
ON CONFLICT DO NOTHING;

-- Health & Medical
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a4000000-0000-0000-0000-000000000001', NULL, NULL, 'Health & Medical', 'expense', '🏥', '#F59E0B', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a4000000-0000-0000-0000-000000000002', NULL, 'a4000000-0000-0000-0000-000000000001', 'Doctor', 'expense', '👨‍⚕️', '#F59E0B', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a4000000-0000-0000-0000-000000000003', NULL, 'a4000000-0000-0000-0000-000000000001', 'Pharmacy', 'expense', '💊', '#F59E0B', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a4000000-0000-0000-0000-000000000004', NULL, 'a4000000-0000-0000-0000-000000000001', 'Health Insurance', 'expense', '🛡️', '#F59E0B', TRUE)
ON CONFLICT DO NOTHING;

-- Entertainment & Leisure
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a5000000-0000-0000-0000-000000000001', NULL, NULL, 'Entertainment & Leisure', 'expense', '🎮', '#8B5CF6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a5000000-0000-0000-0000-000000000002', NULL, 'a5000000-0000-0000-0000-000000000001', 'Streaming', 'expense', '📺', '#8B5CF6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a5000000-0000-0000-0000-000000000003', NULL, 'a5000000-0000-0000-0000-000000000001', 'Movies', 'expense', '🎬', '#8B5CF6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a5000000-0000-0000-0000-000000000004', NULL, 'a5000000-0000-0000-0000-000000000001', 'Gaming', 'expense', '🕹️', '#8B5CF6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a5000000-0000-0000-0000-000000000005', NULL, 'a5000000-0000-0000-0000-000000000001', 'Hobbies', 'expense', '🎨', '#8B5CF6', TRUE)
ON CONFLICT DO NOTHING;

-- Shopping
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a6000000-0000-0000-0000-000000000001', NULL, NULL, 'Shopping', 'expense', '🛍️', '#EC4899', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a6000000-0000-0000-0000-000000000002', NULL, 'a6000000-0000-0000-0000-000000000001', 'Clothing', 'expense', '👕', '#EC4899', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a6000000-0000-0000-0000-000000000003', NULL, 'a6000000-0000-0000-0000-000000000001', 'Electronics', 'expense', '📱', '#EC4899', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a6000000-0000-0000-0000-000000000004', NULL, 'a6000000-0000-0000-0000-000000000001', 'Home', 'expense', '🏡', '#EC4899', TRUE)
ON CONFLICT DO NOTHING;

-- Financial & Debt
INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a7000000-0000-0000-0000-000000000001', NULL, NULL, 'Financial & Debt', 'expense', '💳', '#6B7280', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a7000000-0000-0000-0000-000000000002', NULL, 'a7000000-0000-0000-0000-000000000001', 'Loan Repayment', 'expense', '🏦', '#6B7280', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a7000000-0000-0000-0000-000000000003', NULL, 'a7000000-0000-0000-0000-000000000001', 'Credit Card Interest', 'expense', '💸', '#6B7280', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('a7000000-0000-0000-0000-000000000004', NULL, 'a7000000-0000-0000-0000-000000000001', 'Insurance', 'expense', '📋', '#6B7280', TRUE)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Income Categories (Top-Level, no subcategories)
-- ---------------------------------------------------------------------------

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('b1000000-0000-0000-0000-000000000001', NULL, NULL, 'Salary / Wages', 'income', '💼', '#10B981', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('b2000000-0000-0000-0000-000000000001', NULL, NULL, 'Freelance / Consulting', 'income', '💻', '#3B82F6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('b3000000-0000-0000-0000-000000000001', NULL, NULL, 'Investments & Dividends', 'income', '📈', '#8B5CF6', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('b4000000-0000-0000-0000-000000000001', NULL, NULL, 'Gifts & Refunds', 'income', '🎁', '#F59E0B', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (id, user_id, parent_id, name, type, icon, color, is_system)
VALUES ('b5000000-0000-0000-0000-000000000001', NULL, NULL, 'Other Income', 'income', '💰', '#6B7280', TRUE)
ON CONFLICT DO NOTHING;
