-- 紧急修复：修正 deduct_credits 函数，支持无记录用户
-- 问题：原函数在用户没有 user_stats 记录时返回 false，导致扣除失败

-- ==========================================
-- 修复扣减次数函数 - 支持无记录用户
-- ==========================================
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    -- 尝试获取当前额度，如果没有记录则默认为 3
    SELECT COALESCE(remaining_credits, 3) INTO current_credits
    FROM user_stats
    WHERE user_stats.user_id = deduct_credits.user_id;
    
    -- 如果没有记录，current_credits 为 NULL，使用默认值 3
    IF current_credits IS NULL THEN
        current_credits := 3;
    END IF;
    
    -- 检查额度是否足够
    IF current_credits < amount THEN
        RETURN false;
    END IF;
    
    -- 更新或插入记录
    INSERT INTO user_stats (user_id, remaining_credits, generation_count)
    VALUES (deduct_credits.user_id, current_credits - amount, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = user_stats.remaining_credits - amount,
        generation_count = user_stats.generation_count + 1,
        last_generation_at = NOW(),
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 验证修复
-- ==========================================
SELECT 'deduct_credits function fixed' as status;

-- 显示函数定义
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'deduct_credits';
