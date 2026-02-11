DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER);

CREATE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    v_credits INTEGER;
    v_target_user UUID;
    v_deduct_amount INTEGER;
BEGIN
    v_target_user := p_user_id;
    v_deduct_amount := p_amount;
    
    SELECT COALESCE(t.remaining_credits, 3) INTO v_credits
    FROM user_stats t
    WHERE t.user_id = v_target_user;
    
    IF v_credits IS NULL THEN
        v_credits := 3;
    END IF;
    
    IF v_credits < v_deduct_amount THEN
        RETURN false;
    END IF;
    
    INSERT INTO user_stats (user_id, remaining_credits, generation_count)
    VALUES (v_target_user, v_credits - v_deduct_amount, 1)
    ON CONFLICT ON CONSTRAINT user_stats_pkey
    DO UPDATE SET
        remaining_credits = EXCLUDED.remaining_credits,
        generation_count = user_stats.generation_count + 1,
        last_generation_at = NOW(),
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

SELECT 'deduct_credits recreated' as status;
