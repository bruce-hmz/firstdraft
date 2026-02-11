DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER);

CREATE FUNCTION deduct_credits(arg_user_id UUID, arg_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
    user_uuid UUID;
    credits_to_deduct INTEGER;
BEGIN
    user_uuid := arg_user_id;
    credits_to_deduct := arg_amount;
    
    SELECT COALESCE(us.remaining_credits, 3) INTO current_credits
    FROM user_stats us
    WHERE us.user_id = user_uuid;
    
    IF current_credits IS NULL THEN
        current_credits := 3;
    END IF;
    
    IF current_credits < credits_to_deduct THEN
        RETURN false;
    END IF;
    
    INSERT INTO user_stats AS us (user_id, remaining_credits, generation_count)
    VALUES (user_uuid, current_credits - credits_to_deduct, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = us.remaining_credits - credits_to_deduct,
        generation_count = us.generation_count + 1,
        last_generation_at = NOW(),
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

SELECT 'deduct_credits fixed' as status;
