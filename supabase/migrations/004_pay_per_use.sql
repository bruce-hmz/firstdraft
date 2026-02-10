-- 按次付费模式迁移
-- 将订阅制改为按次付费制

-- ==========================================
-- 套餐表 (Pricing Plans)
-- ==========================================
CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL, -- 可用次数
    price_cny INTEGER NOT NULL, -- 人民币价格（分）
    price_usd INTEGER, -- 美元价格（分）
    stripe_price_id TEXT, -- Stripe Price ID（美元支付用）
    alipay_product_code TEXT, -- 支付宝产品码
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认套餐
INSERT INTO pricing_plans (name, description, credits, price_cny, price_usd, sort_order) VALUES
('入门包', '适合初次体验', 100, 990, 149, 1),
('标准包', '性价比之选', 230, 1990, 299, 2),
('专业包', '大额用户推荐', 350, 2990, 449, 3);

-- ==========================================
-- 修改 user_stats 表 - 添加剩余次数
-- ==========================================
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS remaining_credits INTEGER DEFAULT 3; -- 新用户赠送3次

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_stats_credits ON user_stats(remaining_credits);

-- ==========================================
-- 支付订单表
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES pricing_plans(id),
    
    -- 订单信息
    order_no TEXT UNIQUE NOT NULL, -- 系统订单号
    credits INTEGER NOT NULL, -- 购买次数
    amount_cny INTEGER NOT NULL, -- 人民币金额（分）
    amount_usd INTEGER, -- 美元金额（分）
    
    -- 支付信息
    provider TEXT NOT NULL CHECK (provider IN ('alipay', 'stripe')), -- 支付渠道
    provider_order_no TEXT, -- 第三方订单号
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    
    -- 支付完成信息
    paid_at TIMESTAMP WITH TIME ZONE,
    provider_response JSONB, -- 第三方支付响应
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_payment_orders_user ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_order_no ON payment_orders(order_no);
CREATE INDEX idx_payment_orders_provider ON payment_orders(provider, provider_order_no);

-- RLS 策略
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON payment_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage orders" ON payment_orders
    FOR ALL USING (false);

-- RLS for pricing_plans (public read)
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active plans" ON pricing_plans
    FOR SELECT USING (is_active = true);

-- ==========================================
-- 扣减次数函数
-- ==========================================
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    SELECT remaining_credits INTO current_credits
    FROM user_stats
    WHERE user_stats.user_id = deduct_credits.user_id;
    
    IF current_credits IS NULL OR current_credits < amount THEN
        RETURN false;
    END IF;
    
    UPDATE user_stats
    SET remaining_credits = remaining_credits - amount,
        updated_at = NOW()
    WHERE user_stats.user_id = deduct_credits.user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 增加次数函数（支付成功后调用）
-- ==========================================
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_stats (user_id, remaining_credits)
    VALUES (user_id, amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        remaining_credits = user_stats.remaining_credits + amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 生成订单号函数
-- ==========================================
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS TEXT AS $$
BEGIN
    RETURN 'FD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 更新时间触发器
-- ==========================================
CREATE TRIGGER update_payment_orders_updated_at
    BEFORE UPDATE ON payment_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 验证
-- ==========================================
SELECT 'pricing_plans table created' as status, COUNT(*) as plans
FROM pricing_plans;

SELECT 'payment_orders table created' as status, COUNT(*) as orders
FROM payment_orders;

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_stats' 
AND column_name = 'remaining_credits';
