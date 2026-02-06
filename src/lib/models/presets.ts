export interface ModelPreset {
  id: string
  name: string
  provider: string
  modelId: string
  baseUrl: string
  description: string
  maxTokens?: number
  temperature?: number
}

export const MODEL_PRESETS: ModelPreset[] = [
  // OpenAI 系列 (2026年2月最新)
  {
    id: 'openai-gpt-5-3-codex',
    name: 'OpenAI GPT-5.3 Codex',
    provider: 'openai',
    modelId: 'gpt-5.3-codex',
    baseUrl: 'https://api.openai.com/v1',
    description: 'OpenAI 最新编程模型，支持Agentic Coding',
  },
  {
    id: 'openai-gpt-5-codex',
    name: 'OpenAI GPT-5 Codex',
    provider: 'openai',
    modelId: 'gpt-5-codex',
    baseUrl: 'https://api.openai.com/v1',
    description: 'OpenAI GPT-5编程优化版',
  },
  {
    id: 'openai-gpt-5-2',
    name: 'OpenAI GPT-5.2',
    provider: 'openai',
    modelId: 'gpt-5.2',
    baseUrl: 'https://api.openai.com/v1',
    description: 'OpenAI GPT-5.2 推理模型',
  },
  {
    id: 'openai-gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    baseUrl: 'https://api.openai.com/v1',
    description: 'OpenAI 多模态模型',
  },
  {
    id: 'openai-gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    description: 'OpenAI 轻量级多模态模型',
  },

  // Anthropic Claude 系列 (2026年2月最新)
  {
    id: 'anthropic-claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    modelId: 'claude-opus-4-6-20260205',
    baseUrl: 'https://api.anthropic.com/v1',
    description: 'Anthropic 最强模型，1M上下文，Agentic能力',
  },
  {
    id: 'anthropic-claude-opus-4-5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    modelId: 'claude-opus-4-5-20251124',
    baseUrl: 'https://api.anthropic.com/v1',
    description: 'Anthropic 旗舰推理模型',
  },
  {
    id: 'anthropic-claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-20250522',
    baseUrl: 'https://api.anthropic.com/v1',
    description: 'Anthropic 均衡型模型，高性价比',
  },
  {
    id: 'anthropic-claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    baseUrl: 'https://api.anthropic.com/v1',
    description: 'Anthropic 上一代均衡模型',
  },
  {
    id: 'anthropic-claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    modelId: 'claude-3-haiku-20240307',
    baseUrl: 'https://api.anthropic.com/v1',
    description: 'Anthropic 快速轻量模型',
  },

  // DeepSeek 系列
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    modelId: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/v1',
    description: 'DeepSeek 对话模型，性价比高',
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    modelId: 'deepseek-reasoner',
    baseUrl: 'https://api.deepseek.com/v1',
    description: 'DeepSeek 推理模型，擅长复杂任务',
  },

  // Google Gemini 系列
  {
    id: 'google-gemini-2-flash',
    name: 'Google Gemini 2.0 Flash',
    provider: 'google',
    modelId: 'gemini-2.0-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'Google 最新快速多模态模型',
  },
  {
    id: 'google-gemini-2-pro',
    name: 'Google Gemini 2.0 Pro',
    provider: 'google',
    modelId: 'gemini-2.0-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'Google 最新专业多模态模型',
  },
  {
    id: 'google-gemini-1-5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'google',
    modelId: 'gemini-1.5-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'Google 长上下文多模态模型',
  },

  // 智谱GLM 系列 (2026年最新)
  {
    id: 'zhipu-glm-4-7',
    name: '智谱 GLM-4.7',
    provider: 'zhipu',
    modelId: 'glm-4.7',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    description: '智谱最新旗舰模型',
  },
  {
    id: 'zhipu-glm-4-5',
    name: '智谱 GLM-4.5',
    provider: 'zhipu',
    modelId: 'glm-4.5',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    description: '智谱旗舰模型，355B参数MoE架构',
  },
  {
    id: 'zhipu-glm-4-plus',
    name: '智谱 GLM-4-Plus',
    provider: 'zhipu',
    modelId: 'glm-4-plus',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    description: '智谱增强版对话模型',
  },
  {
    id: 'zhipu-glm-4',
    name: '智谱 GLM-4',
    provider: 'zhipu',
    modelId: 'glm-4',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    description: '智谱标准版对话模型',
  },
  {
    id: 'zhipu-glm-4v',
    name: '智谱 GLM-4V',
    provider: 'zhipu',
    modelId: 'glm-4v',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    description: '智谱视觉理解模型',
  },

  // Moonshot Kimi 系列
  {
    id: 'kimi-k2-5',
    name: 'Kimi K2.5',
    provider: 'moonshot',
    modelId: 'kimi-k2.5',
    baseUrl: 'https://api.moonshot.cn/v1',
    description: 'Moonshot 最新多模态模型，支持视觉',
  },
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'moonshot',
    modelId: 'kimi-k2',
    baseUrl: 'https://api.moonshot.cn/v1',
    description: 'Moonshot K2 万亿参数模型',
  },
  {
    id: 'kimi-latest',
    name: 'Kimi Latest',
    provider: 'moonshot',
    modelId: 'kimi-latest',
    baseUrl: 'https://api.moonshot.cn/v1',
    description: 'Moonshot 最新版模型（自动更新）',
  },

  // 阿里云百炼/通义千问 系列
  {
    id: 'alibaba-qwen3-235b',
    name: '通义千问 Qwen3-235B',
    provider: 'alibaba',
    modelId: 'qwen3-235b-a22b',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '阿里云 Qwen3 旗舰模型，推理+非推理双模式',
  },
  {
    id: 'alibaba-qwen3-32b',
    name: '通义千问 Qwen3-32B',
    provider: 'alibaba',
    modelId: 'qwen3-32b',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '阿里云 Qwen3 中等规模模型',
  },
  {
    id: 'alibaba-qwen-plus',
    name: '通义千问 Qwen-Plus',
    provider: 'alibaba',
    modelId: 'qwen-plus',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '阿里云 Qwen-Plus，支持1M上下文',
  },
  {
    id: 'alibaba-qwen-max',
    name: '通义千问 Qwen-Max',
    provider: 'alibaba',
    modelId: 'qwen-max',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '阿里云 Qwen-Max 最强模型',
  },
  {
    id: 'alibaba-qwen-turbo',
    name: '通义千问 Qwen-Turbo',
    provider: 'alibaba',
    modelId: 'qwen-turbo',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '阿里云 Qwen-Turbo 快速模型',
  },

  // 自定义
  {
    id: 'custom',
    name: '自定义 OpenAI 兼容',
    provider: 'custom',
    modelId: '',
    baseUrl: '',
    description: '自定义 OpenAI 兼容接口',
  },
]

export const PRESETS_BY_PROVIDER = MODEL_PRESETS.reduce((acc, preset) => {
  if (!acc[preset.provider]) {
    acc[preset.provider] = []
  }
  acc[preset.provider].push(preset)
  return acc
}, {} as Record<string, ModelPreset[]>)

export function getModelPreset(presetId: string): ModelPreset | undefined {
  return MODEL_PRESETS.find(p => p.id === presetId)
}

export function getPresetsByProvider(provider: string): ModelPreset[] {
  return PRESETS_BY_PROVIDER[provider] || []
}
