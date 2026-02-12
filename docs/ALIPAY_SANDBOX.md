# 支付宝沙箱环境配置指南

## 1. 获取沙箱账号

访问 [支付宝沙箱平台](https://open.alipay.com/develop/sandbox/app)

### 登录后获取以下信息：

#### 1.1 APPID
- 在沙箱应用页面复制 **APPID**
- 示例：`2024XXXXXXXXXXXX`

#### 1.2 密钥（推荐使用密钥工具生成）
1. 下载 [支付宝密钥工具](https://opendocs.alipay.com/common/02kipl)
2. 选择 **RSA2** 算法
3. 点击生成密钥对
4. 保存好 **应用私钥** 和 **应用公钥**

#### 1.3 配置公钥
1. 在沙箱应用页面的 "开发信息" 部分
2. 点击 "设置/查看" 公钥
3. 粘贴刚才生成的 **应用公钥**
4. 保存后，平台会显示 **支付宝公钥**（这是 AlipayPublicKey）

#### 1.4 沙箱账号
- 在沙箱平台左侧菜单找到 "沙箱账号"
- 复制 **买家账号** 和 **登录密码**（用于测试支付）

## 2. 配置环境变量

在 `.env.local` 文件中添加：

```env
# 沙箱环境配置
ALIPAY_APP_ID="你的沙箱APPID"
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
你的应用私钥内容（包含BEGIN和END行）
-----END RSA PRIVATE KEY-----"
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
支付宝公钥（不是应用公钥！）
-----END PUBLIC KEY-----"
ALIPAY_GATEWAY="https://openapi.alipaydev.com/gateway.do"
```

⚠️ **注意**：
- 私钥需要保留 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----` 行
- 支付宝公钥需要从沙箱平台复制，不是你生成的应用公钥
- 沙箱网关固定为 `https://openapi.alipaydev.com/gateway.do`

## 3. 测试支付流程

### 3.1 创建测试订单
1. 启动应用：`npm run dev`
2. 登录账号
3. 在生成页面耗尽免费额度或点击充值
4. 选择支付宝支付
5. 会跳转到支付宝沙箱支付页面

### 3.2 沙箱支付
1. 在沙箱支付页面使用 **沙箱买家账号** 登录
2. 账号格式通常是：`xxx@alitest.com`
3. 密码在沙箱平台查看
4. 支付密码默认为：`111111`
5. 完成支付

### 3.3 验证回调
- 支付成功后，支付宝会发送回调到 `/api/billing/alipay/notify`
- 检查控制台日志确认回调收到
- 检查数据库 `payment_orders` 表状态是否变为 `paid`
- 检查用户额度是否增加

## 4. 常见问题

### Q: 回调收不到？
A: 确保：
- 应用可以被公网访问（使用 ngrok 或部署到服务器）
- `NEXT_PUBLIC_APP_URL` 配置正确
- 沙箱环境的回调地址可以访问

### Q: 签名验证失败？
A: 检查：
- 使用的是 **支付宝公钥** 不是应用公钥
- 私钥格式正确（包含 BEGIN/END 行）
- 密钥是 RSA2 格式

### Q: 如何区分沙箱和生产？
A: 通过 `ALIPAY_GATEWAY`：
- 沙箱：`https://openapi.alipaydev.com/gateway.do`
- 生产：`https://openapi.alipay.com/gateway.do`

## 5. 切换到生产环境

1. 在支付宝开放平台创建正式应用
2. 完成应用审核
3. 替换 `.env.local` 中的配置：
   - APPID → 正式应用 APPID
   - 私钥 → 正式应用私钥
   - 公钥 → 支付宝正式公钥
   - 网关 → `https://openapi.alipay.com/gateway.do`
4. 重启应用

## 6. 沙箱测试账号示例

```
买家账号：uuxaqw8380@alitest.com
登录密码：111111
支付密码：111111
```

（请使用你自己沙箱平台的实际账号）
