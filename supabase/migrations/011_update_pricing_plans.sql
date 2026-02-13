-- 更新套餐定价 - 激进灵活方案
-- 创建时间: 2026-02-13
-- 版本: v2.0

-- 清空现有套餐数据（CASCADE 会级联删除引用的订单）
TRUNCATE TABLE pricing_plans CASCADE;

-- 插入新的套餐数据
-- 按1美元 = 7人民币计算美元价格
INSERT INTO pricing_plans (name, description, credits, price_cny, price_usd, sort_order) VALUES
('体验包', '适合初次尝鲜', 20, 290, 42, 1),
('轻量包', '普通用户首选', 80, 990, 142, 2),
('标准包', '性价比之选', 200, 1990, 285, 3),
('专业包', '重度用户推荐', 350, 2990, 428, 4);

-- 验证
SELECT 'Pricing plans updated' as status, COUNT(*) as plans
FROM pricing_plans;

SELECT name, credits, price_cny, price_usd, sort_order
FROM pricing_plans
ORDER BY sort_order;
