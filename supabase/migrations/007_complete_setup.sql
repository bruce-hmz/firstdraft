-- 完整数据库初始化脚本
-- 执行此脚本创建所有必要的表和函数

-- ==========================================
-- 1. 用户统计表（如果不存在）
-- ==========================================
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    remaining_credits INTEGER DEFAULT 3,
    is_admin BOOLEAN DEFAULT false,
    last_generation_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_stats_generation ON user_stats(generation_count);
CREATE INDEX IF NOT EXISTS idx_user_stats_credits ON user_stats(remaining_credits);
CREATE INDEX IF NOT EXISTS idx_user_stats_admin ON user_stats(is_admin);

-- RLS 策略
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Service role can insert stats" ON user_stats
    FOR INSERT WITH CHECK (true);

-- ==========================================
-- 2. 更新时间触发器
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at 
    BEFORE UPDATE ON user_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 3. 扣减次数函数（修复版）
-- ==========================================
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    SELECT COALESCE(remaining_credits, 3) INTO current_credits
    FROM user_stats
    WHERE user_stats.user_id = deduct_credits.user_id;
    
    IF current_credits IS NULL THEN
        current_credits := 3;
    END IF;
    
    IF current_credits < amount THEN
        RETURN false;
    END IF;
    
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
-- 4. 增加次数函数
-- ==========================================
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_stats (user_id, remaining_credits)
    VALUES (user_id, amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = user_stats.remaining_credits + amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 5. 管理员充值函数
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
-- 6. 设置管理员函数
-- ==========================================
CREATE OR REPLACE FUNCTION set_user_admin_by_email(target_email TEXT)
RETURNS VOID AS $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', target_email;
    END IF;
    
    INSERT INTO user_stats (user_id, is_admin)
    VALUES (target_user_id, true)
    ON CONFLICT (user_id)
    DO UPDATE SET
        is_admin = true,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 7. 设置 123387447@qq.com 为管理员
-- ==========================================
SELECT set_user_admin_by_email('123387447@qq.com');

-- ==========================================
-- 8. 验证
-- ==========================================
SELECT 'user_stats table created' as status, COUNT(*) as row_count FROM user_stats;
SELECT 'Functions created' as status, routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('deduct_credits', 'add_credits', 'admin_add_credits', 'set_user_admin_by_email');
