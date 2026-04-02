import { createAIClient, type AIClient } from './client';
import { getModelPreset } from './presets';
import { createAdminClient } from '@/lib/supabase';

export async function getAIClient(): Promise<AIClient> {
  try {
    // 先从数据库获取默认模型配置
    const supabase = await createAdminClient();
    const { data: defaultModel, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (!error && defaultModel) {
      return createAIClient({
        provider: defaultModel.provider,
        apiKey: defaultModel.api_key,
        baseUrl: defaultModel.base_url,
        modelId: defaultModel.model_id,
      });
    }
  } catch (dbError) {
    console.warn('Database error when fetching default model:', dbError);
  }

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
