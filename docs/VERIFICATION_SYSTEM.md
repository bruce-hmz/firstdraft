# 注册验证码系统配置指南

本文档说明如何配置和使用注册验证码系统。

## 功能特性

### 1. 图形验证码
- **作用**：防止自动化攻击、暴力破解、机器人注册
- **类型**：SVG 格式，4位字母+数字组合
- **有效期**：5分钟
- **特点**：
  - 随机干扰线和噪点
  - 字符随机旋转
  - 点击刷新

### 2. 邮箱验证码
- **作用**：确保邮箱真实有效
- **类型**：6位数字
- **有效期**：10分钟
- **发送频率限制**：60秒内只能发送一次

## 数据库配置

### 1. 运行迁移文件

```bash
# 如果使用 Supabase CLI
supabase db push

# 或者手动执行
# 在 Supabase Dashboard 的 SQL Editor 中运行：
# supabase/migrations/012_verification_codes.sql
```

### 2. 验证表创建

```sql
-- 检查表是否创建成功
SELECT * FROM verification_codes LIMIT 1;

-- 检查函数是否创建成功
SELECT verify_code('TEST', 'email', 'test@example.com');
```

## 环境变量配置

### 开发环境

在 `.env.local` 中添加：

```bash
# 邮件服务配置（可选，开发环境不配置会打印到控制台）
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="FirstDraft <noreply@yourdomain.com>"
```

### 生产环境

#### 使用 Resend（推荐）

1. **注册 Resend 账号**
   - 访问 [resend.com](https://resend.com)
   - 创建账号并获取 API Key

2. **配置环境变量**
   ```bash
   RESEND_API_KEY="re_xxxxxxxxxxxx"
   EMAIL_FROM="FirstDraft <noreply@yourdomain.com>"
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```

3. **验证域名**
   - 在 Resend 控制台添加并验证你的域名
   - 配置 DNS 记录

#### 使用其他邮件服务

如需使用 SendGrid、Mailgun 等其他服务，可以修改 `src/lib/email.ts` 文件。

## API 接口

### 1. 获取图形验证码

```http
GET /api/captcha/image
```

**响应**：
- Content-Type: `image/svg+xml`
- Header: `X-Captcha-Id` - 验证码 ID（需保存）

**示例**：
```javascript
const response = await fetch('/api/captcha/image')
const captchaId = response.headers.get('X-Captcha-Id')
const svgBlob = await response.blob()
```

### 2. 发送邮箱验证码

```http
POST /api/auth/send-email-code
```

**请求体**：
```json
{
  "email": "user@example.com",
  "captchaId": "uuid",
  "captchaCode": "ABCD"
}
```

**响应**：
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

**错误码**：
- `400` - 参数错误或图形验证码错误
- `429` - 发送频率过快（60秒内重复发送）
- `500` - 服务器错误

### 3. 注册

```http
POST /api/auth/signup-direct
```

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "password123",
  "emailCode": "123456"
}
```

## 前端集成

### 使用注册表单组件

```tsx
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return <SignupForm redirectTo="/dashboard" />
}
```

### 自定义验证码组件

如果需要单独使用验证码组件，可以参考 `src/components/auth/signup-form.tsx` 中的实现。

## 开发环境测试

### 1. 图形验证码测试

```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:3000/api/captcha/image
```

### 2. 邮箱验证码测试

在开发环境中，如果不配置 `RESEND_API_KEY`，验证码会打印到控制台：

```
========================================
📧 Email (Development Mode)
========================================
To: user@example.com
Subject: 您的验证码 - FirstDraft
Content: 您的验证码是：123456
========================================
```

### 3. 注册流程测试

1. 访问 `http://localhost:3000/signup`
2. 输入邮箱
3. 输入图形验证码
4. 点击"发送验证码"
5. 在控制台查看验证码
6. 输入验证码和密码
7. 完成注册

## 安全建议

### 1. 频率限制

系统已实现以下限制：
- ✅ 图形验证码 5 分钟过期
- ✅ 邮箱验证码 10 分钟过期
- ✅ 邮箱验证码 60 秒发送间隔
- ✅ 验证码一次性使用

### 2. 生产环境建议

- **启用 IP 限流**：建议使用 Vercel 或 Cloudflare 的限流功能
- **监控异常**：监控验证码请求频率，识别异常行为
- **日志记录**：记录验证码发送和验证日志，便于排查问题

### 3. 验证码强度

当前图形验证码：
- 4 位字符
- 排除易混淆字符（I, O, 0, 1, L）
- 包含干扰线和噪点

如需增强安全性，可以修改 `src/app/api/captcha/image/route.ts`：
- 增加验证码长度
- 添加更多干扰元素
- 缩短过期时间

## 故障排查

### 问题 1：图形验证码无法显示

**检查**：
1. 访问 `/api/captcha/image` 是否返回 SVG
2. 检查浏览器控制台是否有错误
3. 确认数据库迁移已执行

### 问题 2：邮件发送失败

**检查**：
1. 确认 `RESEND_API_KEY` 是否正确配置
2. 检查 Resend 控制台是否有发送记录
3. 验证发件人域名是否已验证

### 问题 3：验证码验证失败

**检查**：
1. 确认验证码未过期
2. 检查大小写是否正确（图形验证码不区分大小写）
3. 查看数据库中验证码状态

## 维护

### 清理过期验证码

系统提供了清理函数，可以定期执行：

```sql
-- 手动清理
SELECT clean_expired_verification_codes();

-- 或配置定时任务（需要 pg_cron 扩展）
SELECT cron.schedule('clean_verification_codes', '*/5 * * * *',
  'SELECT clean_expired_verification_codes()');
```

### 监控验证码使用情况

```sql
-- 查看最近的验证码
SELECT * FROM verification_codes
ORDER BY created_at DESC
LIMIT 20;

-- 统计验证码使用率
SELECT
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN is_used THEN 1 END) as used,
  COUNT(CASE WHEN NOT is_used AND expires_at > NOW() THEN 1 END) as valid
FROM verification_codes
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type;
```

## 相关文件

- 数据库迁移：`supabase/migrations/012_verification_codes.sql`
- 图形验证码 API：`src/app/api/captcha/image/route.ts`
- 邮箱验证码 API：`src/app/api/auth/send-email-code/route.ts`
- 注册 API：`src/app/api/auth/signup-direct/route.ts`
- 邮件工具：`src/lib/email.ts`
- 注册表单：`src/components/auth/signup-form.tsx`
- 注册页面：`src/app/signup/page.tsx`

## 更新日志

- 2024-01-XX: 初始版本发布
  - 图形验证码生成和验证
  - 邮箱验证码发送和验证
  - Resend 邮件服务集成
  - 开发环境邮件日志
