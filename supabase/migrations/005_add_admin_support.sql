-- 管理员权限支持迁移
-- 添加管理员字段和相关函数

-- ==========================================
-- 添加 is_admin 字段到 user_stats 表
-- ==========================================
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_stats_admin ON user_stats(is_admin);

-- ==========================================
-- 管理员充值函数
-- ==========================================
CREATE OR REPLACE FUNCTION admin_add_credits(target_user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_stats (user_id, remaining_credits)
    VALUES (target_user_id, amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = user_stats.remaining_credits + amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 设置指定用户为管理员（硬编码方式）
-- 使用邮箱查找用户并设置为管理员
-- ==========================================
CREATE OR REPLACE FUNCTION set_user_admin_by_email(target_email TEXT)
RETURNS VOID AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 从 auth.users 查找用户
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', target_email;
    END IF;
    
    -- 插入或更新 user_stats
    INSERT INTO user_stats (user_id, is_admin)
    VALUES (target_user_id, true)
    ON CONFLICT (user_id)
    DO UPDATE SET
        is_admin = true,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 执行：设置 123387447@qq.com 为管理员
-- ==========================================
SELECT set_user_admin_by_email('123387447@qq.com');

-- ==========================================
-- 验证
-- ==========================================
SELECT 'is_admin column added' as status,
       column_name 
FROM information_schema.columns 
WHERE table_name = 'user_stats' 
AND column_name = 'is_admin';

SELECT 'admin functions created' as status,
       routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('admin_add_credits', 'set_user_admin_by_email');
