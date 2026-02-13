# FirstDraft 部署指南

本文档提供了将 FirstDraft 应用部署到生产环境的完整步骤。

---

## 目录

1. [部署前准备](#部署前准备)
2. [Vercel 部署](#vercel-部署)
3. [环境变量配置](#环境变量配置)
4. [数据库迁移](#数据库迁移)
5. [支付配置](#支付配置)
6. [自定义域名](#自定义域名)
7. [部署验证](#部署验证)
8. [常见问题](#常见问题)

---

## 部署前准备

### 必要账户

- [ ] **Vercel 账户** - [vercel.com](https://vercel.com) (免费计划即可)
- [ ] **Supabase 项目** - [supabase.com](https://supabase.com) (需要已创建项目)
- [ ] **Stripe 账户** - [stripe.com](https://stripe.com) (用于 Stripe 支付)
- [ ] **GitHub 账户** - 用于连接代码仓库

### 本地准备

1. **确保代码已提交到 Git**
   ```bash
   git status
   git add .
   git commit -m "Pre-deployment preparation"
   git push
   ```

2. **本地构建测试**
   ```bash
   npm run build
   ```

3. **备份环境变量**
   ```bash
   cat .env.local
   # 复制所有环境变量用于后续配置
   ```

---

## Vercel 部署

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "Add New" → "Project"
   - 选择你的 GitHub 仓库
   - 项目名称：`firstdraft`（或自定义）

3. **配置项目**
   - 框架会自动识别为 **Next.js**
   - 根目录：`./`
   - 构建命令：`npm run build`
   - 输出目录：`.next`

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（约 2-3 分钟）
   - 部署成功后会获得一个 URL，如 `https://firstdraft.vercel.app`

### 方法二：通过 CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **首次部署（预览环境）**
   ```bash
   vercel
   ```

4. **生产部署**
   ```bash
   vercel --prod
   ```

---

## 环境变量配置

### 配置位置

Vercel Dashboard → Settings → Environment Variables

### 必需环境变量

| 变量名 | 说明 | 环境范围 | 示例值 |
|--------|------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | All | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | All | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | All | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_URL` | 应用公网 URL | All | `https://firstdraft.app` |
| `STRIPE_SECRET_KEY` | Stripe 密钥 | Production | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe 公钥 | All | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook 密钥 | Production | `whsec_...` |

### 可选环境变量（支付宝）

| 变量名 | 说明 | 环境范围 |
|--------|------|----------|
| `ALIPAY_APP_ID` | 支付宝应用 ID | Production |
| `ALIPAY_PRIVATE_KEY` | 支付宝私钥 | Production |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥 | Production |
| `ALIPAY_GATEWAY` | 支付宝网关 | Production |

### 如何获取环境变量值

#### Supabase

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings → API
4. 复制以下值：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

#### Stripe

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 进入 Developers → API keys
3. 复制以下值：
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `STRIPE_PUBLISHABLE_KEY`
4. **Webhook Secret** 需要在首次部署后配置（见 [支付配置](#支付配置)）

---

## 数据库迁移

### 执行方式

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 SQL Editor
4. 新建查询并执行以下脚本

### 1. 完整初始化

执行 `supabase/migrations/007_complete_setup.sql`：

```sql
-- 完整数据库初始化脚本
-- 执行此脚本创建所有必要的表和函数

-- 此脚本包含：
-- 1. user_stats 表
-- 2. 索引和 RLS 策略
-- 3. 扣减次数函数 deduct_credits
-- 4. 增加次数函数 add_credits
-- 5. 管理员充值函数 admin_add_credits
-- 6. 设置管理员函数 set_user_admin_by_email
-- 7. 设置 123387447@qq.com 为管理员
```

### 2. 套餐更新

执行 `supabase/migrations/011_update_pricing_plans.sql`：

```sql
-- 更新套餐定价 - 激活灵活方案
-- 按1美元 = 7人民币计算美元价格
INSERT INTO pricing_plans (name, description, credits, price_cny, price_usd, sort_order) VALUES
('体验包', '适合初次尝鲜', 20, 290, 42, 1),
('轻量包', '普通用户首选', 80, 990, 142, 2),
('标准包', '性价比之选', 200, 1990, 285, 3),
('专业包', '重度用户推荐', 350, 2990, 428, 4);
```

### 验证迁移

```sql
-- 检查 user_stats 表
SELECT * FROM user_stats LIMIT 5;

-- 检查套餐数据
SELECT name, credits, price_cny, price_usd, sort_order
FROM pricing_plans
ORDER BY sort_order;

-- 检查函数
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('deduct_credits', 'add_credits', 'admin_add_credits', 'set_user_admin_by_email');
```

---

## 支付配置

### Stripe Webhook 配置

1. **获取应用 URL**
   - 部署后从 Vercel 获取你的应用 URL
   - 例如：`https://firstdraft.vercel.app`

2. **创建 Webhook 端点**
   - 登录 [Stripe Dashboard](https://dashboard.stripe.com)
   - 进入 Developers → Webhooks
   - 点击 "Add endpoint"
   - 端点 URL：`https://your-domain.com/api/billing/webhook`
   - 事件类型：选择 `checkout.session.completed`

3. **获取 Webhook Secret**
   - 创建成功后，你会看到一个 Signing Secret
   - 格式：`whsec_...`
   - 复制这个值到 Vercel 环境变量 `STRIPE_WEBHOOK_SECRET`

4. **重新部署**
   - 更新环境变量后，Vercel 会自动重新部署

### 支付宝回调配置

1. **在支付宝开放平台配置异步通知地址**
   - 登录支付宝开放平台
   - 进入你的应用详情
   - 配置异步通知地址：`https://your-domain.com/api/billing/alipay/notify`

2. **确保 HTTPS**
   - Vercel 自动提供 HTTPS 证书
   - 使用自定义域名时也会自动配置 HTTPS

### 测试支付

#### Stripe 测试模式

1. 在 Stripe Dashboard 切换到 Test mode
2. 使用测试卡号进行测试：
   - 卡号：`4242 4242 4242 4242`
   - CVC：任意 3 位数字
   - 过期日期：任意未来日期
3. 检查 Vercel 日志确认 webhook 被正确接收

#### 支付宝沙箱环境

1. 使用沙箱配置：
   ```
   ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do
   ```
2. 参考 `docs/ALIPAY_SANDBOX.md` 进行详细配置

---

## 自定义域名

### 1. 购买域名

推荐的域名选项（按优先级）：
- `firstdraft.app` - 首选，品牌简洁
- `firstdraft.ai` - AI 产品专属
- `firstdraft.io` - 科技感强
- `myfirstdraft.app` - 亲和力强

注册商推荐：
- [Namecheap](https://www.namecheap.com)
- [Google Domains](https://domains.google)
- [Cloudflare Registrar](https://dash.cloudflare.com/registrar)

### 2. 在 Vercel 添加域名

1. Vercel Dashboard → Settings → Domains
2. 点击 "Add"
3. 输入你的域名（如 `firstdraft.app`）
4. Vercel 会显示需要的 DNS 记录

### 3. 配置 DNS

根据域名注册商的不同，配置以下记录：

```
类型    名称             值
A       @               76.76.21.21
A       www             76.76.21.21
CNAME   *               cname.vercel-dns.com
```

### 4. 更新环境变量

添加自定义域名后，更新以下环境变量：

```bash
NEXT_PUBLIC_APP_URL=https://firstdraft.app
```

同时更新 Stripe Webhook 端点和支付宝回调地址。

### 5. 验证域名

- 访问你的域名，确保 HTTPS 正常
- 浏览器地址栏应显示安全锁图标
- 检查 SSL 证书状态

---

## 部署验证

### 功能测试清单

- [ ] 首页正常加载
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 语言切换（中文/英文）
- [ ] 生成页面功能
- [ ] 保存草稿功能
- [ ] 分享页面功能
- [ ] Stripe 支付流程
- [ ] 支付宝支付流程（如启用）
- [ ] 管理后台功能
- [ ] Webhook 接收正常
- [ ] 额度扣除正确
- [ ] 额度增加正确

### 性能检查

- [ ] Lighthouse 性能评分 > 90
- [ ] 首页加载时间 < 2s
- [ ] 图片优化正常
- [ ] 缓存策略有效

### 安全检查

- [ ] HTTPS 正常工作
- [ ] 环境变量未泄露
- [ ] RLS 策略生效
- [ ] API 路由有适当的保护

---

## 常见问题

### 构建失败

**问题：`npm run build` 失败**

解决方法：
1. 检查 Node.js 版本（推荐 v18 或 v20）
2. 清理缓存：`rm -rf node_modules .next && npm install`
3. 检查是否有 TypeScript 错误

### 环境变量问题

**问题：应用无法连接 Supabase**

解决方法：
1. 确认 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 正确
2. 确认 Supabase 项目未被暂停
3. 检查 Supabase RLS 策略

**问题：Stripe 支付失败**

解决方法：
1. 确认 `STRIPE_SECRET_KEY` 是生产密钥（`sk_live_...`）
2. 检查 Webhook Secret 是否正确
3. 验证 Webhook 端点 URL 正确

### 域名问题

**问题：域名无法解析**

解决方法：
1. 检查 DNS 配置是否正确
2. 使用 `nslookup` 或 `dig` 命令验证 DNS
3. 等待 DNS 传播（最长 48 小时）

**问题：HTTPS 证书未生效**

解决方法：
1. Vercel 会自动申请证书，等待 5-10 分钟
2. 检查域名 DNS 配置是否正确
3. 联系 Vercel 支持

### 支付问题

**问题：Webhook 未被触发**

解决方法：
1. 检查 Vercel 函数日志
2. 验证 Webhook 端点 URL 可访问
3. 检查 Stripe 事件日志

### 数据库问题

**问题：函数执行失败**

解决方法：
1. 确认所有迁移脚本已执行
2. 检查函数是否存在：
   ```sql
   SELECT routine_name
   FROM information_schema.routines
   WHERE routine_schema = 'public';
   ```
3. 检查函数参数是否匹配

---

## 监控与维护

### Vercel 监控

- 访问 Vercel Dashboard 查看部署状态
- 检查函数日志：Analytics → Logs
- 监控错误：Analytics → Error Tracking

### Supabase 监控

- 查看数据库使用情况：Settings → Database
- 监控 API 调用：Settings → API
- 查看实时日志：Database → Logs

### Stripe 监控

- 查看支付事件：Dashboard → Events
- 监控收入：Dashboard → Payments
- 检查 Webhook 状态：Developers → Webhooks

---

## 回滚

如需回滚到之前的版本：

1. **Vercel Dashboard**
   - 进入 Deployments 标签
   - 找到需要回滚的部署
   - 点击 "..." 菜单
   - 选择 "Promote to Production"

2. **或使用 CLI**
   ```bash
   vercel rollback <deployment-id>
   ```

---

## 联系支持

如遇到部署问题：

- **Vercel 支持**：[vercel.com/support](https://vercel.com/support)
- **Supabase 支持**：[supabase.com/support](https://supabase.com/support)
- **Stripe 支持**：[stripe.com/contact](https://stripe.com/contact)

---

## 更新日志

- 2026-02-13：创建部署文档
- 2026-02-13：添加 Vercel 配置文件
