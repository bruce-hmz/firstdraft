-- 修复 pricing_plans 表 RLS 策略，允许真正的匿名访问

-- 方法1: 为匿名用户创建特定策略（推荐）
-- 先删除现有策略
DROP POLICY IF EXISTS "Public can view active plans" ON pricing_plans;
DROP POLICY IF EXISTS "Allow anonymous select" ON pricing_plans;
DROP POLICY IF EXISTS "Enable read access for all users" ON pricing_plans;

-- 创建允许所有用户（包括匿名）查询的策略
CREATE POLICY "Enable read access for all users" ON pricing_plans
    FOR SELECT 
    USING (true);  -- 允许所有人查询，不限制条件

-- 或者更严格的版本（只允许查询 active 的）
-- CREATE POLICY "Enable read access for all users" ON pricing_plans
--     FOR SELECT 
--     USING (is_active = true);

-- 验证策略是否创建成功
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'pricing_plans';

-- 测试查询
SELECT * FROM pricing_plans WHERE is_active = true;
