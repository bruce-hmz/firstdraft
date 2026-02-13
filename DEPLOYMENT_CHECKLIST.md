# FirstDraft 部署检查清单

快速检查清单，确保部署成功。

---

## 部署前准备

- [ ] 代码已提交到 Git 仓库
- [ ] 本地 `npm run build` 构建成功
- [ ] 备份 `.env.local` 中所有环境变量
- [ ] Vercel 账户已创建
- [ ] Supabase 项目已创建
- [ ] Stripe 账户已创建
- [ ] GitHub 账户已连接 Vercel

---

## 域名配置

### 域名选择

- [ ] 查询域名可用性
- [ ] 确定首选域名（推荐：`firstdraft.app`）
- [ ] 购买域名
- [ ] 配置 DNS 记录指向 Vercel

### DNS 配置

- [ ] 在域名注册商添加 A 记录：
  ```
  类型：A  |  名称：@  |  值：76.76.21.21
  ```
- [ ] 在域名注册商添加 A 记录：
  ```
  类型：A  |  名称：www  |  值：76.76.21.21
  ```
- [ ] 在域名注册商添加 CNAME 记录：
  ```
  类型：CNAME  |  名称：*  |  值：cname.vercel-dns.com
  ```
- [ ] 在 Vercel 添加自定义域名
- [ ] 验证 DNS 解析成功
- [ ] 确认 HTTPS 证书生效

---

## Vercel 项目配置

### 项目创建

- [ ] 登录 Vercel Dashboard
- [ ] 点击 "Add New" → "Project"
- [ ] 选择 GitHub 仓库
- [ ] 确认框架自动识别为 Next.js
- [ ] 点击 "Deploy" 完成首次部署

### 环境变量配置

#### Supabase 变量

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - 从 Supabase Dashboard → API 复制
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 从 Supabase Dashboard → API 复制
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - 从 Supabase Dashboard → API 复制

#### 应用变量

- [ ] `NEXT_PUBLIC_APP_URL` - 设置为部署后的域名，如 `https://firstdraft.app`

#### Stripe 变量

- [ ] `STRIPE_SECRET_KEY` - 从 Stripe Dashboard → Developers → API keys 复制
- [ ] `STRIPE_PUBLISHABLE_KEY` - 从 Stripe Dashboard → Developers → API keys 复制
- [ ] `STRIPE_WEBHOOK_SECRET` - 首次部署后配置（见支付配置部分）

#### 支付宝变量（可选）

- [ ] `ALIPAY_APP_ID` - 支付宝应用 ID
- [ ] `ALIPAY_PRIVATE_KEY` - 支付宝私钥
- [ ] `ALIPAY_PUBLIC_KEY` - 支付宝公钥
- [ ] `ALIPAY_GATEWAY` - 支付宝网关地址

---

## 数据库迁移

### Supabase 执行

- [ ] 登录 Supabase Dashboard
- [ ] 进入 SQL Editor
- [ ] 执行 `supabase/migrations/007_complete_setup.sql`
- [ ] 执行 `supabase/migrations/011_update_pricing_plans.sql`

### 验证迁移

- [ ] 验证 `user_stats` 表已创建：
  ```sql
  SELECT * FROM user_stats LIMIT 5;
  ```
- [ ] 验证 `pricing_plans` 表有 4 个套餐：
  ```sql
  SELECT name, credits, price_cny, price_usd
  FROM pricing_plans
  ORDER BY sort_order;
  ```
- [ ] 验证函数已创建：
  ```sql
  SELECT routine_name
  FROM information_schema.routines
  WHERE routine_schema = 'public'
  AND routine_name IN ('deduct_credits', 'add_credits', 'admin_add_credits', 'set_user_admin_by_email');
  ```

---

## 支付配置

### Stripe Webhook

- [ ] 获取部署后的应用 URL（如 `https://firstdraft.app`）
- [ ] 登录 Stripe Dashboard
- [ ] 进入 Developers → Webhooks
- [ ] 添加端点：`https://your-domain.com/api/billing/webhook`
- [ ] 选择事件：`checkout.session.completed`
- [ ] 获取 Webhook Secret（格式：`whsec_...`）
- [ ] 在 Vercel 环境变量添加 `STRIPE_WEBHOOK_SECRET`
- [ ] 触发重新部署

### 支付宝配置（如启用）

- [ ] 在支付宝开放平台配置异步通知地址：`https://your-domain.com/api/billing/alipay/notify`
- [ ] 确认生产环境网关：`https://openapi.alipay.com/gateway.do`
- [ ] 验证应用配置正确

---

## 部署验证

### 基础功能

- [ ] 首页正常加载
- [ ] 页面样式显示正确
- [ ] 页面加载速度正常（< 3秒）

### 用户认证

- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 用户登出功能正常
- [ ] 密码重置功能正常

### 核心功能

- [ ] 生成页面功能正常
- [ ] 保存草稿功能正常
- [ ] 分享页面功能正常
- [ ] 语言切换（中文/英文）正常

### 支付功能

#### Stripe

- [ ] 检查按钮跳转到 Stripe Checkout
- [ ] 测试支付流程（使用测试卡号 `4242 4242 4242 4242`）
- [ ] 支付成功后用户额度增加
- [ ] Vercel 日志显示 webhook 被接收

#### 支付宝（如启用）

- [ ] 支付宝扫码/跳转正常
- [ ] 支付成功后额度增加
- [ ] 异步通知被正确接收

### 管理后台

- [ ] 管理员登录正常
- [ ] 查看用户列表正常
- [ ] 查看模型配置正常
- [ ] 充值用户额度功能正常

---

## 安全检查

- [ ] HTTPS 正常工作（浏览器显示安全锁图标）
- [ ] SSL 证书有效
- [ ] 环境变量未在代码中泄露
- [ ] RLS（Row Level Security）策略生效
- [ ] API 路由有适当的认证保护
- [ ] 敏感信息不在前端代码中暴露

---

## 性能检查

- [ ] Lighthouse 性能评分 > 90
- [ ] 首页加载时间 < 2s
- [ ] 图片优化正常（WebP 格式，懒加载）
- [ ] 静态资源正确缓存
- [ ] API 响应时间正常

---

## 监控配置

- [ ] 设置 Vercel 部署通知
- [ ] 配置错误监控
- [ ] 设置 Supabase 使用告警
- [ ] 配置 Stripe 支付通知
- [ ] 设置域名过期提醒

---

## 文档更新

- [ ] 更新 `NEXT_PUBLIC_APP_URL` 环境变量
- [ ] 更新 Stripe Webhook 端点 URL
- [ ] 更新支付宝回调地址
- [ ] 更新项目 README（如需要）
- [ ] 备份部署配置

---

## 域名解析验证

```bash
# 使用以下命令验证 DNS 解析

# 检查 A 记录
nslookup firstdraft.app

# 检查 CNAME 记录
nslookup www.firstdraft.app

# 检查所有 DNS 记录
dig firstdraft.app ANY
```

预期输出应指向 Vercel 的 IP 地址或 CNAME。

---

## 回滚计划（备用）

如果部署出现问题，按以下步骤回滚：

- [ ] 访问 Vercel Dashboard
- [ ] 进入 Deployments 标签
- [ ] 找到之前稳定的部署版本
- [ ] 点击 "..." 菜单
- [ ] 选择 "Promote to Production"

或使用 CLI：
```bash
vercel rollback <deployment-id>
```

---

## 完成确认

所有项目完成后，确认：

- [ ] 域名可正常访问
- [ ] 所有核心功能正常工作
- [ ] 支付流程测试通过
- [ ] 错误监控已配置
- [ ] 团队成员已通知上线

---

## 常见问题快速参考

### 构建失败

```bash
# 清理缓存并重新构建
rm -rf node_modules .next
npm install
npm run build
```

### 环境变量问题

检查 Vercel 环境变量是否正确配置，必要时重新触发部署。

### DNS 未生效

等待 5-30 分钟让 DNS 传播，最长可能需要 48 小时。

### Webhook 未触发

检查 Stripe Webhook 配置，确认端点 URL 正确且可访问。

---

## 联系信息

**Vercel 支持**：[vercel.com/support](https://vercel.com/support)

**Supabase 支持**：[supabase.com/support](https://supabase.com/support)

**Stripe 支持**：[stripe.com/contact](https://stripe.com/contact)

---

## 更新日志

- 2026-02-13：创建部署检查清单
