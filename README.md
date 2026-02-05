# FirstDraft - AI 产品页面生成器

**把一个模糊的想法，变成真实存在的第一稿。**

Turn your first idea into something real.

A simple way to turn rough ideas into shareable product pages — in minutes.

## 功能特性

- 🤖 AI 驱动：支持多种大模型（OpenAI、Claude、Gemini、DeepSeek 等）
- ⚡ 快速生成：从想法到页面只需几分钟
- 🎨 专业设计：自动生成现代、简洁的产品页面
- 🔗 一键分享：生成可分享的链接，快速获得反馈
- ⚙️ 运营者后台：灵活配置 AI 模型和系统参数

## 技术栈

- **前端**: Next.js 16 + TypeScript + Tailwind CSS
- **UI 组件**: shadcn/ui
- **状态管理**: Zustand
- **动画**: Framer Motion
- **AI**: 多模型支持（OpenAI、Anthropic、Google 等）
- **数据库**: PostgreSQL + Prisma

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的配置：

```env
# 必需
DATABASE_URL="postgresql://user:password@localhost:5432/firstdraft"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 可选：运行时在管理后台配置
OPENAI_API_KEY="your-openai-api-key"
```

### 3. 设置数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 运行数据库迁移
npm run db:migrate
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 配置 AI 模型

1. 访问 http://localhost:3000/admin
2. 在"AI 模型管理"中添加你的大模型 API Key
3. 支持的提供商：OpenAI、Anthropic、Google、DeepSeek、自定义 OpenAI 兼容 API

## 项目结构

```
firstdraft/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # 运营者管理后台
│   │   ├── api/             # API 路由
│   │   │   ├── admin/       # 管理后台 API
│   │   │   └── generate/    # AI 生成 API
│   │   ├── page.tsx         # 首页
│   │   └── ...
│   ├── components/          # React 组件
│   │   ├── ui/              # shadcn/ui 组件
│   │   └── ...
│   ├── lib/                 # 工具函数
│   ├── stores/              # Zustand 状态管理
│   └── types/               # TypeScript 类型定义
├── prisma/
│   └── schema.prisma        # 数据库 Schema
└── package.json
```

## 管理后台功能

### AI 模型配置

在 `/admin` 页面可以：

- **添加多个模型**：支持 OpenAI、Claude、Gemini、DeepSeek 等
- **设置默认模型**：用户生成时会使用默认模型
- **灵活切换**：随时启用/停用某个模型
- **自定义 API**：支持 OpenAI 兼容的自定义接口

### Supabase 配置

- 配置 Supabase URL 和 Anon Key
- 用于未来扩展用户系统、数据持久化等功能

## 部署

### Vercel（推荐）

```bash
npm i -g vercel
vercel
```

### 环境变量配置

在 Vercel Dashboard 中配置以下环境变量：

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

**注意**：AI 模型 API Key 建议在部署后通过管理后台配置，而不是写入环境变量。

## 许可证

MIT License

## 品牌

**FirstDraft** - Turn your first idea into something real.
