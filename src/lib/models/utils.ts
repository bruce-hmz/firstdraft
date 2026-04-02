import { createAIClient, type AIClient } from './client';
import { getModelPreset } from './presets';

export async function getAIClient(): Promise<AIClient> {
  // 从环境变量获取模型配置
  const provider = process.env.AI_PROVIDER || 'deepseek';
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const modelId = process.env.AI_MODEL_ID || 'deepseek-chat';
  const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';

  if (!apiKey) {
    throw new Error('AI API key not configured');
  }

  return createAIClient({
    provider,
    apiKey,
    baseUrl,
    modelId,
  });
}
