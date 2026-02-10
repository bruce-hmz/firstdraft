-- 添加 pages 表缺失的字段
-- 用于支持用户关联和匿名用户

-- 添加 user_id 字段（可选，关联 auth.users）
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 添加 anonymous_id 字段（用于匿名用户）
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS anonymous_id TEXT;

-- 为 user_id 添加索引
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id) WHERE user_id IS NOT NULL;

-- 更新 RLS 策略 - 允许匿名用户插入
DROP POLICY IF EXISTS "Public insert access" ON pages;
CREATE POLICY "Public insert access" ON pages
    FOR INSERT WITH CHECK (true);

-- 添加用户更新自己页面的策略（可选）
DROP POLICY IF EXISTS "Users can update own pages" ON pages;
CREATE POLICY "Users can update own pages" ON pages
    FOR UPDATE USING (user_id = auth.uid());

-- 验证字段是否添加成功
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pages'
ORDER BY ordinal_position;
