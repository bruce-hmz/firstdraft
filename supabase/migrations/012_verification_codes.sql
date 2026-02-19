-- 验证码系统表
-- 用于存储图形验证码和邮箱验证码

-- ==========================================
-- 验证码表
-- ==========================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 验证码信息
    code TEXT NOT NULL,                    -- 验证码内容
    type TEXT NOT NULL CHECK (type IN ('captcha', 'email', 'phone')), -- 验证码类型
    target TEXT NOT NULL,                  -- 目标（邮箱/手机号/会话ID）

    -- 状态管理
    is_used BOOLEAN DEFAULT false,         -- 是否已使用
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 过期时间

    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,

    -- 元数据
    metadata JSONB                         -- 额外信息（如 IP、User-Agent 等）
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_target ON verification_codes(target);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);

-- RLS 策略
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- 只有 service_role 可以访问
CREATE POLICY "Service role can manage verification codes" ON verification_codes
    FOR ALL USING (false);

-- ==========================================
-- 清理过期验证码的函数
-- ==========================================
CREATE OR REPLACE FUNCTION clean_expired_verification_codes()
RETURNS VOID AS $$
BEGIN
    DELETE FROM verification_codes
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 验证码验证函数
-- ==========================================
CREATE OR REPLACE FUNCTION verify_code(
    p_code TEXT,
    p_type TEXT,
    p_target TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_record RECORD;
BEGIN
    -- 查找未使用且未过期的验证码
    SELECT * INTO v_record
    FROM verification_codes
    WHERE code = p_code
      AND type = p_type
      AND target = p_target
      AND is_used = false
      AND expires_at > NOW()
    LIMIT 1;

    -- 如果找到，标记为已使用
    IF FOUND THEN
        UPDATE verification_codes
        SET is_used = true,
            used_at = NOW()
        WHERE id = v_record.id;

        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 创建验证码函数
-- ==========================================
CREATE OR REPLACE FUNCTION create_verification_code(
    p_code TEXT,
    p_type TEXT,
    p_target TEXT,
    p_expires_in_seconds INTEGER DEFAULT 300,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO verification_codes (code, type, target, expires_at, metadata)
    VALUES (
        p_code,
        p_type,
        p_target,
        NOW() + (p_expires_in_seconds || ' seconds')::INTERVAL,
        p_metadata
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 定时清理过期验证码（可选，需要 pg_cron 扩展）
-- ==========================================
-- 如果需要定时清理，可以取消注释：
-- SELECT cron.schedule('clean_verification_codes', '*/5 * * * *', 'SELECT clean_expired_verification_codes()');

-- ==========================================
-- 验证
-- ==========================================
SELECT 'verification_codes table created' as status, COUNT(*) as count
FROM verification_codes;
