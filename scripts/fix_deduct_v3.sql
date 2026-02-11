DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER);

CREATE FUNCTION deduct_credits(input_user_id UUID, input_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    existing_credits INTEGER;
    new_credits INTEGER;
    existing_count INTEGER;
BEGIN
    SELECT remaining_credits, generation_count 
    INTO existing_credits, existing_count
    FROM user_stats u
    WHERE u.user_id = input_user_id;
    
    IF existing_credits IS NULL THEN
        existing_credits := 3;
        existing_count := 0;
    END IF;
    
    IF existing_credits < input_amount THEN
        RETURN false;
    END IF;
    
    new_credits := existing_credits - input_amount;
    
    UPDATE user_stats u
    SET remaining_credits = new_credits,
        generation_count = existing_count + 1,
        last_generation_at = NOW(),
        updated_at = NOW()
    WHERE u.user_id = input_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO user_stats (user_id, remaining_credits, generation_count, last_generation_at)
        VALUES (input_user_id, new_credits, 1, NOW());
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

SELECT 'deduct_credits fixed with separate update/insert' as status;
