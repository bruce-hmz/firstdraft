# FirstDraft 域名规划方案

本文档提供了 FirstDraft 产品的域名选择建议和实施指南。

---

## 目录

1. [域名推荐](#域名推荐)
2. [可用性查询](#可用性查询)
3. [域名选择建议](#域名选择建议)
4. [域名购买指南](#域名购买指南)
5. [DNS 配置](#dns-配置)
6. [域名安全](#域名安全)

---

## 域名推荐

### TLD（顶级域名）选择

根据确认的用户偏好，**.app** 扩展名为首选。

| TLD | 优势 | 劣势 | 推荐度 |
|-----|------|------|--------|
| **.app** | Google 官方运营，强制 HTTPS，现代感，适合应用产品 | 价格略高，中文用户认知度较低 | ⭐⭐⭐⭐⭐ |
| **.ai** | AI 产品专属，品牌溢价高 | 价格极高，已被大量注册 | ⭐⭐⭐⭐ |
| **.io** | 科技感强，开发者社区熟悉 | 价格中等，部分国家限制注册 | ⭐⭐⭐⭐ |
| **.com** | 全球认知度最高，SEO 友好 | 短域名稀缺，价格较高 | ⭐⭐⭐ |
| **.co** | 简洁现代，.com 的替代品 | 认知度略低 | ⭐⭐⭐ |

### 推荐域名列表

#### 首选目标（.app 扩展名）

| 域名 | 优势 | 预计价格 |
|------|------|----------|
| **firstdraft.app** | 完美匹配品牌名，简洁直接，专业感强 | $15-25/年 |
| **myfirstdraft.app** | 个性化，用户亲和力强 | $15-25/年 |
| **getfirstdraft.app** | 行动导向，适合营销和 CTA | $15-25/年 |

#### 备选方案

| 域名 | 说明 | TLD |
|------|------|-----|
| firstdraft.site | 备选扩展名，价格较低 | .site |
| draftfirst.app | 品牌变体 | .app |
| thefirstdraft.app | 加冠词，增加识别度 | .app |
| firstdraft.io | 科技感强 | .io |
| firstdraft.dev | 开发者友好 | .dev |
| firstdraft.xyz | 价格便宜，现代感 | .xyz |

#### 创意变体

| 域名 | 说明 |
|------|------|
| firstdraft.pro | 专业版感觉 |
| firstdraft.plus | 附加价值感 |
| firstdraft.how | 教程导向 |
| firstdraft.now | 即时生成感 |
| usefirstdraft.app | 动词开头 |

---

## 可用性查询

### 查询方法

#### 方法一：域名注册商查询

推荐以下平台查询：

| 平台 | 网址 | 特点 |
|------|------|------|
| Namecheap | [namecheap.com](https://www.namecheap.com) | 价格透明，界面友好 |
| GoDaddy | [godaddy.com](https://www.godaddy.com) | 全球最大，一站式 |
| Google Domains | [domains.google.com](https://domains.google.com) | 整合 Google 服务 |
| Cloudflare Registrar | [dash.cloudflare.com](https://dash.cloudflare.com/registrar) | 批发价，无加价 |
| Porkbun | [porkbun.com](https://porkbun.com) | 便宜，免费 WHOIS 保护 |

#### 方法二：专用查询工具

| 工具 | 网址 | 特点 |
|------|------|------|
| Instant Domain Search | [instantdomainsearch.com](https://instantdomainsearch.com) | 实时搜索，速度极快 |
| Domainr | [domainr.com](https://domainr.com) | 域名创意生成 |
| Lean Domain Search | [leandomainsearch.com](https://leandomainsearch.com) | 批量创意搜索 |
| Whois.net | [whois.net](https://www.whois.net) | 查询域名信息 |

#### 方法三：命令行工具

```bash
# 使用 whois 查询域名信息
whois firstdraft.app

# 使用 nslookup 检查域名解析
nslookup firstdraft.app

# 使用 dig 检查 DNS 记录
dig firstdraft.app ANY
```

### 查询顺序

建议按以下顺序查询：

1. **firstdraft.app** - 首选，优先级最高
2. **myfirstdraft.app** - 备选1
3. **getfirstdraft.app** - 备选2
4. **firstdraft.io** - 备选3
5. **firstdraft.dev** - 备选4
6. **其他变体** - 根据需要扩展

### 域名已被注册怎么办？

如果首选域名已被注册，有以下选择：

**选项 1：联系所有者**
- 使用 WHOIS 查询联系信息
- 评估域名价值，准备预算
- 注意：优质域名可能价格很高

**选项 2：选择变体**
- 添加前缀：`my-`、`the-`、`get-`
- 添加后缀：`-app`、`-pro`、`-online`
- 添加动词：`use`、`try`、`go`

**选项 3：选择其他 TLD**
- .app → .io、.dev、.ai
- .com → .co、.net、.org

---

## 域名选择建议

### 评估维度

选择域名时考虑以下维度：

#### 1. 品牌一致性 ⭐⭐⭐⭐⭐

- 与产品名称 "FirstDraft" 高度匹配
- 用户看到域名能联想到产品
- 避免拼写歧义

**评分标准：**
- 完全匹配：5 分
- 添加常见前缀/后缀：4 分
- 变体形式：3 分
- 不相关：1 分

#### 2. 简洁易记 ⭐⭐⭐⭐⭐

- 越短越好（< 15 字符）
- 避免连字符和数字
- 拼写直观，不需要解释

**评分标准：**
- < 10 字符：5 分
- 10-15 字符：4 分
- 15-20 字符：3 分
- > 20 字符：1 分

#### 3. SEO 友好 ⭐⭐⭐⭐

- 包含品牌关键词
- .com TLD 的 SEO 优势
- 避免被搜索引擎惩罚

#### 4. 价格合理性 ⭐⭐⭐

- 首年注册费
- 续费价格
- 转移费用

**价格参考（每年）：**
- .app: $15-25
- .io: $35-50
- .ai: $80-100+
- .com: $10-15
- .co: $10-15

#### 5. 未来扩展性 ⭐⭐⭐

- 是否支持多语言版本
- 是否适合产品线扩展
- 是否适合地区性子域名

### 推荐优先级

基于以上维度，推荐优先级如下：

| 排名 | 域名 | 品牌分 | 简洁分 | SEO分 | 价格分 | 总分 |
|------|------|--------|--------|-------|--------|------|
| 1 | firstdraft.app | 5 | 5 | 4 | 3 | 17 |
| 2 | firstdraft.io | 5 | 5 | 4 | 2 | 16 |
| 3 | firstdraft.ai | 5 | 5 | 5 | 1 | 16 |
| 4 | myfirstdraft.app | 4 | 4 | 4 | 3 | 15 |
| 5 | getfirstdraft.app | 4 | 4 | 4 | 3 | 15 |
| 6 | firstdraft.dev | 5 | 5 | 3 | 2 | 15 |
| 7 | firstdraft.co | 5 | 5 | 4 | 2 | 16 |

### 最终建议

**最佳方案：firstdraft.app**

理由：
- 品牌完美匹配
- 现代感强，适合应用产品
- 价格合理
- Google 官方运营，稳定性高

**备选方案：firstdraft.io**

理由：
- 科技感强，适合开发者工具
- 国际认可度高
- SEO 表现良好

**预算充足：firstdraft.ai**

理由：
- AI 产品专属域名
- 品牌溢价高
- 未来扩展性好

---

## 域名购买指南

### 注册商选择

推荐以下注册商：

| 注册商 | 首年价格 | 续费价格 | WHOIS保护 | 转移费 | 评分 |
|--------|----------|----------|-----------|--------|------|
| **Cloudflare Registrar** | 批发价 | 批发价 | 免费 | 免费 | ⭐⭐⭐⭐⭐ |
| **Namecheap** | $8-20 | $10-25 | 免费 | $10-15 | ⭐⭐⭐⭐⭐ |
| **Google Domains** | $12-20 | $12-20 | 免费 | 免费 | ⭐⭐⭐⭐ |
| **Porkbun** | $8-15 | $10-18 | 免费 | 免费 | ⭐⭐⭐⭐⭐ |
| **GoDaddy** | $12-30 | $18-35 | 收费 | $15-20 | ⭐⭐⭐ |

### 购买步骤

#### 使用 Cloudflare Registrar（推荐）

1. **注册账户**
   - 访问 [Cloudflare](https://dash.cloudflare.com)
   - 注册免费账户

2. **查询并购买域名**
   - 进入 Registrar 标签
   - 搜索域名
   - 添加到购物车
   - 结账支付

3. **配置 DNS**
   - 自动生成 DNS 记录
   - 可以直接配置指向 Vercel

#### 使用 Namecheap

1. **查询域名**
   - 访问 [Namecheap](https://www.namecheap.com)
   - 在首页搜索框输入域名

2. **添加到购物车**
   - 选择域名
   - 选择注册年限
   - 添加 WHOIS 保护（通常免费）

3. **结账支付**
   - 创建账户或登录
   - 填写注册信息
   - 支持信用卡、PayPal、支付宝等

### 购买注意事项

#### 1. WHOIS 保护

- 推荐启用 WHOIS 隐私保护
- 隐藏个人信息，避免垃圾邮件
- 大多数现代注册商免费提供

#### 2. 自动续费

- 建议启用自动续费
- 避免域名意外过期
- 绑定可靠的支付方式

#### 3. 域名锁定

- 启用域名锁定功能
- 防止未经授权的转移
- 大多数注册商默认开启

#### 4. 转移码（EPP Code）

- 购买后保存好转移码
- 用于未来可能域名转移
- 60 天内禁止转移新注册域名

---

## DNS 配置

### Vercel 部署配置

#### 1. 在 Vercel 添加域名

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择项目 → Settings → Domains
3. 点击 "Add Domain"
4. 输入域名（如 `firstdraft.app`）

#### 2. 配置 DNS 记录

Vercel 会显示需要的 DNS 记录：

```
类型    名称             值                          TTL
A       @               76.76.21.21                3600
A       www             76.76.21.21                3600
CNAME   *               cname.vercel-dns.com        3600
```

#### 3. 在域名注册商配置

**Cloudflare:**
1. 进入 DNS 标签
2. 添加上述记录
3. 确保代理状态（橙色云朵）开启或关闭（根据需求）

**Namecheap:**
1. 进入 Domain List → Advanced DNS
2. 添加 A 记录和 CNAME 记录
3. 保存更改

**Google Domains:**
1. 进入 DNS 标签
2. 添加自定义资源记录
3. 保存更改

#### 4. 验证 DNS 传播

```bash
# 检查 A 记录
nslookup firstdraft.app

# 检查 CNAME 记录
nslookup www.firstdraft.app

# 详细查询
dig firstdraft.app ANY
```

等待 DNS 传播，通常需要：
- 全球传播：5-30 分钟
- 完全稳定：最多 48 小时

---

## 域名安全

### 安全最佳实践

#### 1. 启用域名锁定

- 防止未经授权的转移
- 大多数注册商默认开启
- 检查注册商设置确保已启用

#### 2. 启用两步验证（2FA）

- 保护域名账户安全
- 使用 Google Authenticator 或类似应用
- 避免 SMS 验证（可能被拦截）

#### 3. 启用 DNSSEC

- 防止 DNS 劫持
- Cloudflare 和部分注册商支持
- 增加域名解析安全性

#### 4. 定期备份域名信息

- 保存登录凭证
- 记录 EPP 转移码
- 备份 DNS 配置

#### 5. 监控域名状态

- 设置域名过期提醒
- 监控 WHOIS 变化
- 定期检查 DNS 记录

### 域名防钓鱼

- 注册品牌变体域名（如 `firstdraft-official.com`）
- 设置域名转发
- 监控相似域名注册

### 续费提醒

- 设置多重提醒（30天、15天、7天、1天）
- 绑定备用支付方式
- 考虑多年注册锁定价格

---

## 域名后续规划

### 子域名策略

| 子域名 | 用途 | 示例 |
|--------|------|------|
| app | 主应用 | `app.firstdraft.app` |
| www | 重定向到主域名 | `www.firstdraft.app` |
| blog | 博客和内容 | `blog.firstdraft.app` |
| docs | 文档 | `docs.firstdraft.app` |
| api | API 文档 | `api.firstdraft.app` |
| help | 帮助中心 | `help.firstdraft.app` |
| status | 状态监控 | `status.firstdraft.app` |

### 多域名策略

可以考虑注册以下域名作为保护：

| 域名 | 用途 |
|------|------|
| firstdraft.com | 主要保护 |
| firstdraft.net | 备选保护 |
| firstdraft.org | 品牌保护 |
| firstdraft.cn | 中国市场 |
| firstdraft.io | 技术社区 |

### 域名转移

如需转移域名到其他注册商：

1. 解锁域名
2. 获取 EPP 转移码
3. 在新注册商发起转移
4. 确认转移请求
5. 等待 5-7 天完成

注意：注册后 60 天内不能转移。

---

## 常见问题

### Q1: .app 域名有什么特殊要求？

A: .app 域名必须使用 HTTPS，这是 Google 的强制要求。Vercel 自动提供 HTTPS，所以无需额外配置。

### Q2: 域名购买后多久可以生效？

A: 通常 5-30 分钟，但完全稳定可能需要 48 小时。

### Q3: 可以使用支付宝购买域名吗？

A: 大多数国际注册商不支持支付宝，可以使用信用卡或 PayPal。Namecheap 支持部分地区的支付宝支付。

### Q4: 域名可以注册多久？

A: 通常可以注册 1-10 年。建议至少注册 2-3 年以获得更好价格。

### Q5: 如何选择合适的注册年限？

A: 建议至少 2-3 年：
- 价格锁定，避免续费涨价
- SEO 权重更高
- 减少管理负担

### Q6: WHOIS 保护会泄露信息吗？

A: 不会。WHOIS 保护会替换真实信息为注册商的代理信息，保护隐私。

### Q7: 域名过期后会怎样？

A: 域名过期后的时间线：
- 过期当天：网站停止运行
- 0-30 天：可以按原价续费
- 30-60 天：可以续费但需要额外费用
- 60 天后：公开注册，任何人可购买

### Q8: 如何查询域名历史？

A: 使用以下工具：
- [Wayback Machine](https://web.archive.org) - 查看历史网站
- [Whois History](https://whois.domaintools.com) - 查询注册历史
- [SEO Site Checkup](https://seositecheckup.com) - 分析域名信誉

---

## 联系支持

如有域名相关问题，可以联系：

- **Cloudflare 支持**：[support.cloudflare.com](https://support.cloudflare.com)
- **Namecheap 支持**：[namecheap.com/support](https://www.namecheap.com/support)
- **Google Domains 支持**：[support.google.com/domains](https://support.google.com/domains)

---

## 更新日志

- 2026-02-13：创建域名规划文档
- 2026-02-13：确认 .app TLD 为首选
- 2026-02-13：添加完整的域名评估体系
