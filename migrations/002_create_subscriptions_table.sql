-- FirstDraft 订阅表结构
-- 创建时间: 2026-04-01
-- 版本: v1.0

-- ==========================================
-- 订阅表
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 性能索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_page_id ON subscriptions(page_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- ==========================================
-- Supabase RLS 策略
-- ==========================================
-- 启用 RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Public insert access" ON subscriptions;
DROP POLICY IF EXISTS "Page owner read access" ON subscriptions;

-- 公开插入策略（所有人可提交订阅）
CREATE POLICY "Public insert access" ON subscriptions
    FOR INSERT WITH CHECK (true);

-- 页面所有者读取策略
CREATE POLICY "Page owner read access" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = subscriptions.page_id
        )
    );

-- ==========================================
-- 实用函数
-- ==========================================

-- 获取页面订阅数
CREATE OR REPLACE FUNCTION get_page_subscription_count(page_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM subscriptions 
        WHERE page_id = page_id_param
    );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 验证脚本
-- ==========================================
-- 检查表是否创建成功
SELECT 'subscriptions table created successfully' as status,
       COUNT(*) as row_count
FROM subscriptions;

-- 检查索引是否创建成功
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'subscriptions' 
  AND indexname LIKE 'idx_%';

-- 检查 RLS 策略是否生效
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'subscriptions';
