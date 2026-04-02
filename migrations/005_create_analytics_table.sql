-- FirstDraft 分析配置表结构
-- 创建时间: 2026-04-01
-- 版本: v1.0

-- ==========================================
-- 分析配置表
-- ==========================================
CREATE TABLE IF NOT EXISTS analytics_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    google_analytics_id TEXT,
    baidu_analytics_id TEXT,
    custom_scripts TEXT,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 性能索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_analytics_configs_page_id ON analytics_configs(page_id);
CREATE INDEX IF NOT EXISTS idx_analytics_configs_enabled ON analytics_configs(enabled);
CREATE INDEX IF NOT EXISTS idx_analytics_configs_created_at ON analytics_configs(created_at DESC);

-- ==========================================
-- Supabase RLS 策略
-- ==========================================
-- 启用 RLS
ALTER TABLE analytics_configs ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Page owner read access" ON analytics_configs;
DROP POLICY IF EXISTS "Page owner insert access" ON analytics_configs;
DROP POLICY IF EXISTS "Page owner update access" ON analytics_configs;
DROP POLICY IF EXISTS "Page owner delete access" ON analytics_configs;

-- 公开读取策略（所有人可访问）
CREATE POLICY "Public read access" ON analytics_configs
    FOR SELECT USING (true);

-- 页面所有者插入策略
CREATE POLICY "Page owner insert access" ON analytics_configs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = analytics_configs.page_id
        )
    );

-- 页面所有者更新策略
CREATE POLICY "Page owner update access" ON analytics_configs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = analytics_configs.page_id
        )
    );

-- 页面所有者删除策略
CREATE POLICY "Page owner delete access" ON analytics_configs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = analytics_configs.page_id
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

DROP TRIGGER IF EXISTS update_analytics_configs_updated_at ON analytics_configs;
CREATE TRIGGER update_analytics_configs_updated_at 
    BEFORE UPDATE ON analytics_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 验证脚本
-- ==========================================
-- 检查表是否创建成功
SELECT 'analytics_configs table created successfully' as status,
       COUNT(*) as row_count
FROM analytics_configs;

-- 检查索引是否创建成功
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'analytics_configs' 
  AND indexname LIKE 'idx_%';

-- 检查 RLS 策略是否生效
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'analytics_configs';
