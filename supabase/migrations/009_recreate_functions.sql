-- 删除旧函数（因为参数名改变需要重建）
DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER);
DROP FUNCTION IF EXISTS add_credits(UUID, INTEGER);
DROP FUNCTION IF EXISTS admin_add_credits(UUID, INTEGER);

-- 创建修复后的 deduct_credits 函数
CREATE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_credits INTEGER;
BEGIN
    SELECT COALESCE(remaining_credits, 3) INTO v_current_credits
    FROM user_stats
    WHERE user_stats.user_id = p_user_id;
    
    IF v_current_credits IS NULL THEN
        v_current_credits := 3;
    END IF;
    
    IF v_current_credits < p_amount THEN
        RETURN false;
    END IF;
    
    INSERT INTO user_stats (user_id, remaining_credits, generation_count)
    VALUES (p_user_id, v_current_credits - p_amount, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = EXCLUDED.remaining_credits,
        generation_count = user_stats.generation_count + 1,
        last_generation_at = NOW(),
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 创建修复后的 add_credits 函数
CREATE FUNCTION add_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_stats (user_id, remaining_credits)
    VALUES (p_user_id, p_amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = user_stats.remaining_credits + p_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 创建修复后的 admin_add_credits 函数
CREATE FUNCTION admin_add_credits(p_target_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_stats (user_id, remaining_credits)
    VALUES (p_target_user_id, p_amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = user_stats.remaining_credits + p_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

SELECT 'All functions recreated with fixed parameter names' as status;
