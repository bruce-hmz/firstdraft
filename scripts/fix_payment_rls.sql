-- 修复 payment_orders 的 RLS 策略
-- 问题：Service role 策略阻止了所有插入

-- 1. 禁用然后重新启用 RLS（刷新策略）
ALTER TABLE payment_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- 2. 删除旧策略
DROP POLICY IF EXISTS "Users can view own orders" ON payment_orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON payment_orders;

-- 3. 创建新策略
-- 用户可以查看自己的订单
CREATE POLICY "Users can view own orders" ON payment_orders
    FOR SELECT USING (auth.uid() = user_id);

-- Service role 可以管理所有订单（使用 WITH CHECK true 允许插入）
CREATE POLICY "Service role can insert orders" ON payment_orders
    FOR INSERT WITH CHECK (true);

-- Service role 可以更新订单
CREATE POLICY "Service role can update orders" ON payment_orders
    FOR UPDATE USING (true) WITH CHECK (true);

-- 4. 验证策略
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'payment_orders';

SELECT 'RLS policies fixed' as status;
