-- FirstDraft Pro Stripe 计费系统迁移
-- 创建时间: 2026-02-10
-- 版本: v1.0

-- ==========================================
-- 订阅表
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    
    -- 订阅状态: active, cancelled, past_due, unpaid, inactive
    status TEXT NOT NULL DEFAULT 'inactive',
    
    -- 订阅周期
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- 取消相关
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- 元数据
    metadata JSONB DEFAULT '{}',
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE UNIQUE INDEX idx_subscriptions_user_active 
    ON subscriptions(user_id) 
    WHERE status = 'active';

-- RLS 策略
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的订阅
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 仅允许 service role 管理（通过 webhook）
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
    FOR ALL USING (false);

-- ==========================================
-- 用户统计表
-- ==========================================
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    last_generation_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_stats_generation ON user_stats(generation_count);

-- RLS 策略
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert stats" ON user_stats
    FOR INSERT WITH CHECK (true);

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

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at 
    BEFORE UPDATE ON user_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 计数递增函数
-- ==========================================
CREATE OR REPLACE FUNCTION increment_generation_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_stats (user_id, generation_count, last_generation_at)
  VALUES (user_id, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    generation_count = user_stats.generation_count + 1,
    last_generation_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_save_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_stats (user_id, save_count)
  VALUES (user_id, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET
    save_count = user_stats.save_count + 1;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 验证脚本
-- ==========================================
SELECT 'subscriptions table created' as status,
       COUNT(*) as row_count
FROM subscriptions;

SELECT 'user_stats table created' as status,
       COUNT(*) as row_count
FROM user_stats;

SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('subscriptions', 'user_stats');
