-- 自动为新用户初始化 user_stats 记录
-- 确保新注册用户自动获得 3 次免费额度

-- ==========================================
-- 创建处理新用户的函数
-- ==========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 为新用户插入 user_stats 记录
  -- remaining_credits 会使用默认值 3
  INSERT INTO user_stats (user_id, remaining_credits, generation_count, save_count)
  VALUES (
    NEW.id,
    3,  -- 新用户赠送 3 次
    0,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 创建触发器 - 在用户创建后自动执行
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- 为现有用户初始化（如果还没有 user_stats 记录）
-- ==========================================
INSERT INTO user_stats (user_id, remaining_credits, generation_count, save_count)
SELECT
  u.id,
  3,  -- 赠送 3 次
  0,
  0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_stats WHERE user_id = u.id
);

-- ==========================================
-- 验证
-- ==========================================
SELECT
  'New user trigger created' as status,
  COUNT(*) as existing_users_without_stats
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_stats WHERE user_id = u.id
);
