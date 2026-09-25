-- ============================================================================
-- Migration: 20260925000004_create_categories.sql
-- Purpose:   Hierarchical category tree, system/custom categories, RLS, triggers
-- Phase:     2C — Database Foundation
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Categories table
-- ---------------------------------------------------------------------------
CREATE TABLE public.categories (
    id          UUID                NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID                NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id   UUID                NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name        TEXT                NOT NULL CHECK (char_length(trim(name)) > 0),
    type        public.category_type NOT NULL,
    icon        TEXT                NULL,
    color       VARCHAR(7)          NULL CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
    is_system   BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ         NOT NULL DEFAULT now(),

    -- System categories must have user_id IS NULL; user categories must have user_id IS NOT NULL
    CONSTRAINT chk_categories_system_ownership
        CHECK ((is_system = TRUE AND user_id IS NULL) OR (is_system = FALSE AND user_id IS NOT NULL))
);

-- Unique category name per user (or system) and type
-- Uses COALESCE to treat NULL user_id (system) as a fixed UUID for uniqueness
CREATE UNIQUE INDEX uq_categories_user_name_type
    ON public.categories (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(trim(name)), type);

COMMENT ON TABLE public.categories IS 'Hierarchical category tree. System defaults (user_id IS NULL, is_system=TRUE) are read-only for users. Custom user categories reference user profiles. Maximum nesting depth is one child level (V2 product constraint).';

-- ---------------------------------------------------------------------------
-- 2. Parent-child validation trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_validate_category_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_parent_is_system BOOLEAN;
    v_parent_user_id UUID;
    v_parent_type public.category_type;
    v_parent_has_parent BOOLEAN;
BEGIN
    -- No parent = top-level category, always valid
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Self-reference check
    IF NEW.id IS NOT NULL AND NEW.id = NEW.parent_id THEN
        RAISE EXCEPTION 'Category cannot be its own parent'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Fetch parent details
    SELECT is_system, user_id, type, (parent_id IS NOT NULL)
    INTO v_parent_is_system, v_parent_user_id, v_parent_type, v_parent_has_parent
    FROM public.categories
    WHERE id = NEW.parent_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Parent category % does not exist', NEW.parent_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Prevent deep nesting: parent must be a top-level category (no grandchildren)
    -- This is an intentional V2 product constraint: maximum category depth is one child level.
    -- System parent → system child, system parent → user custom child, user parent → same-user custom child.
    -- Deeper hierarchies are not supported in V2.
    IF v_parent_has_parent THEN
        RAISE EXCEPTION 'Categories can only be nested one level deep (no grandchildren)'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Classification type must match parent
    IF NEW.type <> v_parent_type THEN
        RAISE EXCEPTION 'Category type (%) must match parent category type (%)', NEW.type, v_parent_type
            USING ERRCODE = 'check_violation';
    END IF;

    -- System child must have system parent
    IF NEW.is_system AND NOT v_parent_is_system THEN
        RAISE EXCEPTION 'System category cannot have a user-defined parent'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Custom child must belong to same user if parent is not system
    IF NOT NEW.is_system AND NOT v_parent_is_system AND v_parent_user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Cannot use another user''s custom category as parent'
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_categories_validate_parent
    BEFORE INSERT OR UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validate_category_parent();

-- ---------------------------------------------------------------------------
-- 3. Updated_at trigger
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- SELECT: system categories visible to all authenticated users + own custom categories
CREATE POLICY "categories_select" ON public.categories
    FOR SELECT TO authenticated
    USING (is_system = TRUE OR user_id = (select auth.uid()));

-- INSERT: only own custom categories (never system)
CREATE POLICY "categories_insert" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()) AND is_system = FALSE);

-- UPDATE: only own custom categories (never system)
CREATE POLICY "categories_update" ON public.categories
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()) AND is_system = FALSE)
    WITH CHECK (user_id = (select auth.uid()) AND is_system = FALSE);

-- DELETE: only own custom categories (never system)
CREATE POLICY "categories_delete" ON public.categories
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()) AND is_system = FALSE);

-- ---------------------------------------------------------------------------
-- 5. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_categories_user_type ON public.categories (user_id, type);
CREATE INDEX idx_categories_parent ON public.categories (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_categories_system ON public.categories (is_system) WHERE is_system = TRUE;
