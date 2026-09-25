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

    IF v_cat_is_system THEN
        IF NEW.type IN ('income', 'expense') AND v_cat_type::text <> NEW.type::text THEN
            RAISE EXCEPTION 'Category type (%) does not match transaction type (%)', v_cat_type, NEW.type
                USING ERRCODE = 'check_violation';
        END IF;
        RETURN NEW;
    END IF;

    IF v_cat_user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Category does not belong to the user'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    IF NEW.type IN ('income', 'expense') AND v_cat_type::text <> NEW.type::text THEN
        RAISE EXCEPTION 'Category type (%) does not match transaction type (%)', v_cat_type, NEW.type
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;
