-- 修复 deduct_credits 函数的命名冲突
-- 问题：函数参数 user_id 与表列 user_id 名称冲突

CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_credits INTEGER;
BEGIN
    -- 获取当前额度
    SELECT COALESCE(remaining_credits, 3) INTO v_current_credits
    FROM user_stats
    WHERE user_stats.user_id = p_user_id;
    
    -- 无记录时默认为 3
    IF v_current_credits IS NULL THEN
        v_current_credits := 3;
    END IF;
    
    -- 检查额度
    IF v_current_credits < p_amount THEN
        RETURN false;
    END IF;
    
    -- 插入或更新记录（使用明确的别名避免冲突）
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

-- 同时修复 add_credits 函数
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_amount INTEGER)
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

-- 修复 admin_add_credits 函数
CREATE OR REPLACE FUNCTION admin_add_credits(p_target_user_id UUID, p_amount INTEGER)
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

SELECT 'Functions fixed with unambiguous parameter names' as status;
