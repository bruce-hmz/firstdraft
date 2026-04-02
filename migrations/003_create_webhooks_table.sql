-- FirstDraft Webhook 表结构
-- 创建时间: 2026-04-01
-- 版本: v1.0

-- ==========================================
-- Webhook 配置表
-- ==========================================
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret TEXT,
    enabled BOOLEAN DEFAULT true,
    events JSONB DEFAULT '{"subscription": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 性能索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_webhooks_page_id ON webhooks(page_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON webhooks(created_at DESC);

-- ==========================================
-- Supabase RLS 策略
-- ==========================================
-- 启用 RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Page owner read access" ON webhooks;
DROP POLICY IF EXISTS "Page owner insert access" ON webhooks;
DROP POLICY IF EXISTS "Page owner update access" ON webhooks;
DROP POLICY IF EXISTS "Page owner delete access" ON webhooks;

-- 页面所有者读取策略
CREATE POLICY "Page owner read access" ON webhooks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = webhooks.page_id
        )
    );

-- 页面所有者插入策略
CREATE POLICY "Page owner insert access" ON webhooks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = webhooks.page_id
        )
    );

-- 页面所有者更新策略
CREATE POLICY "Page owner update access" ON webhooks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = webhooks.page_id
        )
    );

-- 页面所有者删除策略
CREATE POLICY "Page owner delete access" ON webhooks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = webhooks.page_id
        )
    );

-- ==========================================
-- 更新时间触发器
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_webhooks_updated_at ON webhooks;
CREATE TRIGGER update_webhooks_updated_at 
    BEFORE UPDATE ON webhooks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 验证脚本
-- ==========================================
-- 检查表是否创建成功
SELECT 'webhooks table created successfully' as status,
       COUNT(*) as row_count
FROM webhooks;

-- 检查索引是否创建成功
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'webhooks' 
  AND indexname LIKE 'idx_%';

-- 检查 RLS 策略是否生效
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'webhooks';
