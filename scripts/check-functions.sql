-- 检查 deduct_credits 函数定义
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'deduct_credits';

-- 检查函数参数
SELECT 
    routine_name,
    parameter_name,
    parameter_mode,
    data_type
FROM information_schema.parameters
WHERE routine_schema = 'public'
AND routine_name = 'deduct_credits';

-- 测试函数调用（用你的用户ID替换）
-- SELECT deduct_credits('你的用户ID', 1);

-- 查看 user_stats 表结构
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_stats';
