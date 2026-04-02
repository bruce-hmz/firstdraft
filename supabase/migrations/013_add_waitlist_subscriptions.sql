-- FirstDraft 等待名单订阅表
-- 创建时间: 2026-04-02
-- 版本: v1.0

-- ==========================================
-- 等待名单订阅表
-- ==========================================
CREATE TABLE IF NOT EXISTS waitlist_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_waitlist_subscriptions_page_id ON waitlist_subscriptions(page_id);
CREATE INDEX idx_waitlist_subscriptions_email ON waitlist_subscriptions(email);
CREATE UNIQUE INDEX idx_waitlist_subscriptions_page_email ON waitlist_subscriptions(page_id, email);

-- RLS 策略
ALTER TABLE waitlist_subscriptions ENABLE ROW LEVEL SECURITY;

-- 任何人都可以创建订阅
CREATE POLICY "Allow public insert" ON waitlist_subscriptions
    FOR INSERT WITH CHECK (true);

-- 仅允许 service role 查看和管理
CREATE POLICY "Service role can manage subscriptions" ON waitlist_subscriptions
    FOR ALL USING (false);

-- ==========================================
-- 验证脚本
-- ==========================================
SELECT 'waitlist_subscriptions table created' as status,
       COUNT(*) as row_count
FROM waitlist_subscriptions;

SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'waitlist_subscriptions';
