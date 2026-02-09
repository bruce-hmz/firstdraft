-- FirstDraft MVP 数据库表结构
-- 创建时间: 2026-02-09
-- 版本: v1.0

-- ==========================================
-- 核心页面表
-- ==========================================
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'archived')),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 性能索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

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

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at 
    BEFORE UPDATE ON pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Supabase RLS 策略
-- ==========================================
-- 启用 RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Public read access" ON pages;
DROP POLICY IF EXISTS "Public insert access" ON pages;
DROP POLICY IF EXISTS "No public update" ON pages;
DROP POLICY IF EXISTS "No public delete" ON pages;

-- 公开读取策略（所有人可访问 active 状态的页面）
CREATE POLICY "Public read access" ON pages
    FOR SELECT USING (status = 'active');

-- 匿名插入策略（所有人可创建页面）
CREATE POLICY "Public insert access" ON pages
    FOR INSERT WITH CHECK (true);

-- 更新限制（暂时禁止公开更新）
CREATE POLICY "No public update" ON pages
    FOR UPDATE USING (false);

-- 删除限制（软删除而非物理删除）
CREATE POLICY "No public delete" ON pages
    FOR DELETE USING (false);

-- ==========================================
-- 实用函数
-- ==========================================

-- 访问计数更新函数
CREATE OR REPLACE FUNCTION increment_view_count(page_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE pages 
    SET view_count = view_count + 1 
    WHERE slug = page_slug AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- 生成唯一 slug 函数
CREATE OR REPLACE FUNCTION generate_unique_slug()
RETURNS TEXT AS $$
DECLARE
    new_slug TEXT;
    slug_exists BOOLEAN;
BEGIN
    LOOP
        new_slug := substr(encode(gen_random_bytes(32), 'hex'), 1, 8);
        SELECT EXISTS(SELECT 1 FROM pages WHERE slug = new_slug) INTO slug_exists;
        IF NOT slug_exists THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 示例数据（可选，用于测试）
-- ==========================================
INSERT INTO pages (slug, title, content, metadata)
VALUES (
    'demo123',
    '示例产品',
    '{"productName": "示例产品", "tagline": "终于有人懂我们的难处了", "description": "这不是又一个工具，而是真正理解我们处境的伙伴", "problemSection": {"headline": "你是不是也经历过这些", "description": "每次都告诉自己下次会更好，但下次还是一样。我们不是不够努力，只是用错了方法。", "painPoints": ["深夜还在整理客户信息，明天又要面对同样的混乱", "团队开会各说各的，散会后谁也不知道该干嘛", "想给宝宝留下美好回忆，结果被各种APP搞得焦头烂额"]}, "solutionSection": {"headline": "这次，真的不一样了", "description": "我们花了无数个夜晚，终于找到了那个让一切变得简单的答案。不是什么黑科技，就是真正懂你的设计。", "features": [{"title": "它记得你忘记的", "description": "客户信息、项目进度，自动整理，再也不用手忙脚乱", "icon": "🧠"}, {"title": "让对话回到正轨", "description": "不是又一个聊天工具，而是让团队真正在协作的平台", "icon": "💬"}, {"title": "温暖不麻烦", "description": "一个按钮记录成长，剩下的时间用来陪伴而不是操作", "icon": "🌱"}]}, "ctaSection": {"text": "给自己一个机会", "subtext": "先试试看，不喜欢随时离开，我们不挽留"}}',
    '{"template": "default", "version": "1.0", "ai_model": "gpt-4"}'
) ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 验证脚本
-- ==========================================
-- 检查表是否创建成功
SELECT 'pages table created successfully' as status,
       COUNT(*) as row_count
FROM pages;

-- 检查索引是否创建成功
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'pages' 
  AND indexname LIKE 'idx_%';

-- 检查 RLS 策略是否生效
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'pages';