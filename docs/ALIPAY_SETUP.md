# 支付宝沙箱环境配置

## 快速检查

访问 `/api/debug/alipay-config` 查看当前配置状态。

## 配置步骤

### 1. 登录支付宝开放平台
访问 https://open.alipay.com/develop/sandbox/app

### 2. 获取配置信息

在沙箱应用页面复制以下信息：

```
APPID: 2024XXXXXXXXXXXX (20位数字)
```

### 3. 生成密钥对

**方式一：使用支付宝密钥工具（推荐）**
1. 下载：https://opendocs.alipay.com/common/02kipl
2. 选择 RSA2 算法
3. 生成密钥对
4. 复制应用私钥和公钥

**方式二：使用 OpenSSL 命令行**
```bash
# 生成私钥
openssl genrsa -out app_private_key.pem 2048

# 从私钥提取公钥
openssl rsa -in app_private_key.pem -pubout -out app_public_key.pem
```

### 4. 配置公钥到沙箱应用

1. 在沙箱应用页面点击 "设置/查看" 公钥
2. 粘贴应用公钥内容
3. 保存后，复制显示的 **支付宝公钥**

### 5. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# 支付宝沙箱配置
ALIPAY_APP_ID="2024XXXXXXXXXXXX"

# 应用私钥（从密钥工具或 pem 文件复制）
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAxXX...
...
-----END RSA PRIVATE KEY-----"

# 支付宝公钥（从沙箱平台复制，注意不是应用公钥！）
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxXX...
...
-----END PUBLIC KEY-----"

# 沙箱网关（固定值）
ALIPAY_GATEWAY="https://openapi.alipaydev.com/gateway.do"
```

### 6. 获取沙箱测试账号

访问 https://open.alipay.com/develop/sandbox/account

复制 **买家账号**：
```
账号：xxxx@alitest.com
登录密码：xxxxxx
支付密码：111111
```

### 7. 测试支付

1. 启动应用：`npm run dev`
2. 登录你的应用
3. 使用完免费额度或点击充值
4. 选择支付宝支付
5. 会跳转到支付宝沙箱支付页面
6. 使用沙箱买家账号登录
7. 支付密码：`111111`
8. 完成支付

### 8. 验证回调

检查：
- 浏览器控制台是否有回调日志
- 数据库 `payment_orders` 状态是否变为 `paid`
- 用户额度是否增加

## 密钥格式说明

### 私钥格式（必须包含 BEGIN/END）
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAx...（密钥内容）
...
-----END RSA PRIVATE KEY-----
```

### 公钥格式（必须包含 BEGIN/END）
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx...（密钥内容）
...
-----END PUBLIC KEY-----
```

## 常见问题

**Q: 回调地址怎么配置？**  
A: 自动使用 `NEXT_PUBLIC_APP_URL + /api/billing/alipay/notify`，确保配置正确的公网地址

**Q: 本地开发怎么接收回调？**  
A: 使用 ngrok：
```bash
ngrok http 3000
# 复制 https 地址到 NEXT_PUBLIC_APP_URL
```

**Q: 沙箱支付后额度没增加？**  
A: 检查：
1. 回调 URL 是否可访问
2. `payment_orders` 表状态
3. 控制台错误日志

**Q: 如何切换到生产环境？**  
A: 更换为正式应用配置：
- APPID → 正式应用
- 密钥 → 正式应用密钥
- 网关 → `https://openapi.alipay.com/gateway.do`

## 测试金额

沙箱环境支持任意金额，测试时可以使用 0.01 元

## 更多帮助

- 支付宝文档：https://opendocs.alipay.com/
- 沙箱介绍：https://opendocs.alipay.com/common/02kkv7
