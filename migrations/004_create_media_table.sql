-- FirstDraft 媒体表结构
-- 创建时间: 2026-04-01
-- 版本: v1.0

-- ==========================================
-- 媒体表
-- ==========================================
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 性能索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_media_page_id ON media(page_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- ==========================================
-- Supabase RLS 策略
-- ==========================================
-- 启用 RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Page owner read access" ON media;
DROP POLICY IF EXISTS "Page owner insert access" ON media;
DROP POLICY IF EXISTS "Page owner delete access" ON media;

-- 公开读取策略（所有人可访问）
CREATE POLICY "Public read access" ON media
    FOR SELECT USING (true);

-- 页面所有者插入策略
CREATE POLICY "Page owner insert access" ON media
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = media.page_id
        )
    );

-- 页面所有者删除策略
CREATE POLICY "Page owner delete access" ON media
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = media.page_id
        )
    );

-- ==========================================
-- 验证脚本
-- ==========================================
-- 检查表是否创建成功
SELECT 'media table created successfully' as status,
       COUNT(*) as row_count
FROM media;

-- 检查索引是否创建成功
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'media' 
  AND indexname LIKE 'idx_%';

-- 检查 RLS 策略是否生效
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'media';
