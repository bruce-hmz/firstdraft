# 验证码系统快速开始

## 🚀 快速部署步骤

### 1. 运行数据库迁移

```bash
# 方式 1: 使用 Supabase CLI
supabase db push

# 方式 2: 手动执行
# 在 Supabase Dashboard -> SQL Editor 中运行
# supabase/migrations/012_verification_codes.sql
```

### 2. 配置环境变量（可选）

开发环境可以跳过这一步，验证码会打印到控制台。

```bash
# .env.local
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="FirstDraft <noreply@yourdomain.com>"
```

### 3. 重启开发服务器

```bash
npm run dev
```

### 4. 测试注册流程

1. 访问 http://localhost:3000/signup
2. 输入邮箱
3. 输入图形验证码（点击图片刷新）
4. 点击"发送验证码"
5. 查看控制台输出的验证码（开发环境）
6. 输入验证码和密码
7. 完成注册

## ✅ 验证安装

### 检查数据库表

```sql
-- 应该返回 0 行（表为空）
SELECT COUNT(*) FROM verification_codes;
```

### 检查图形验证码 API

```bash
# 访问此 URL 应该显示验证码图片
http://localhost:3000/api/captcha/image
```

### 检查注册页面

访问 http://localhost:3000/signup，应该看到：
- 邮箱输入框
- 图形验证码（带刷新按钮）
- 邮箱验证码（带发送按钮）
- 密码输入框

## 🐛 常见问题

### Q: 图形验证码不显示？

A: 检查数据库迁移是否执行：
```sql
SELECT * FROM verification_codes LIMIT 1;
```

### Q: 邮箱验证码发送失败？

A:
- 开发环境：验证码会打印到控制台
- 生产环境：检查 `RESEND_API_KEY` 是否配置

### Q: 注册时提示验证码错误？

A:
- 确认验证码未过期
- 图形验证码不区分大小写
- 邮箱验证码为 6 位数字

## 📚 详细文档

查看 [VERIFICATION_SYSTEM.md](./VERIFICATION_SYSTEM.md) 了解：
- 完整配置说明
- API 接口文档
- 安全建议
- 故障排查

## 🎯 生产环境检查清单

- [ ] 数据库迁移已执行
- [ ] 配置了 `RESEND_API_KEY`
- [ ] 配置了 `EMAIL_FROM`
- [ ] 在 Resend 中验证了发件域名
- [ ] 测试了完整的注册流程
- [ ] 设置了监控和日志

## 💡 提示

1. **开发环境**：邮件会打印到控制台，无需配置邮件服务
2. **验证码有效期**：图形验证码 5 分钟，邮箱验证码 10 分钟
3. **发送频率**：邮箱验证码 60 秒内只能发送一次
4. **安全性**：验证码一次性使用，验证后立即失效

## 🔗 相关链接

- [Resend 官网](https://resend.com)
- [Supabase 文档](https://supabase.com/docs)
- [项目文档](./VERIFICATION_SYSTEM.md)
