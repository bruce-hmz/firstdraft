-- 删除函数（如果存在）
DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER);

-- 创建函数，参数名必须与 API 调用匹配
-- API 调用: supabase.rpc('deduct_credits', { user_id: ..., amount: 1 })
CREATE FUNCTION deduct_credits(user_id UUID, amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
    target_user_id UUID;
    deduct_amount INTEGER;
BEGIN
    target_user_id := user_id;
    deduct_amount := amount;
    
    SELECT COALESCE(remaining_credits, 3) INTO current_credits
    FROM user_stats
    WHERE user_stats.user_id = target_user_id;
    
    IF current_credits IS NULL THEN
        current_credits := 3;
    END IF;
    
    IF current_credits < deduct_amount THEN
        RETURN false;
    END IF;
    
    INSERT INTO user_stats (user_id, remaining_credits, generation_count)
    VALUES (target_user_id, current_credits - deduct_amount, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = user_stats.remaining_credits - deduct_amount,
        generation_count = user_stats.generation_count + 1,
        last_generation_at = NOW(),
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

SELECT 'deduct_credits function created with correct parameter names' as status;
