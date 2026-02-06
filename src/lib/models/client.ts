import OpenAI from 'openai'

export interface ModelConfig {
  provider: string
  apiKey: string
  baseUrl?: string
  modelId: string
}

export function createAIClient(config: ModelConfig) {
  const { provider, apiKey, baseUrl, modelId } = config

  const openAICompatibleProviders = ['openai', 'deepseek', 'custom', 'zhipu', 'moonshot', 'alibaba']
  
  if (openAICompatibleProviders.includes(provider)) {
    return {
      type: 'openai' as const,
      client: new OpenAI({
        apiKey,
        baseURL: baseUrl || undefined,
      }),
      modelId,
      async chatCompletion(messages: Array<{role: string, content: string}>, options?: {temperature?: number, maxTokens?: number}) {
        const completion = await this.client.chat.completions.create({
          model: this.modelId,
          messages: messages as any,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        })
        return completion.choices[0]?.message?.content || ''
      }
    }
  }

  if (provider === 'anthropic') {
    return {
      type: 'anthropic' as const,
      apiKey,
      baseUrl: baseUrl || 'https://api.anthropic.com',
      modelId,
      async chatCompletion(messages: Array<{role: string, content: string}>, options?: {temperature?: number, maxTokens?: number}) {
        const response = await fetch(`${this.baseUrl}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: this.modelId,
            messages: messages.map(m => ({
              role: m.role === 'system' ? 'assistant' : m.role,
              content: m.content,
            })),
            max_tokens: options?.maxTokens ?? 2000,
            temperature: options?.temperature ?? 0.7,
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Anthropic API error: ${error}`)
        }

        const data = await response.json()
        return data.content?.[0]?.text || ''
      }
    }
  }

  if (provider === 'google') {
    return {
      type: 'google' as const,
      apiKey,
      baseUrl: baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
      modelId,
      async chatCompletion(messages: Array<{role: string, content: string}>, options?: {temperature?: number, maxTokens?: number}) {
        const url = `${this.baseUrl}/models/${this.modelId}:generateContent?key=${this.apiKey}`
        
        const contents = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: options?.temperature ?? 0.7,
              maxOutputTokens: options?.maxTokens ?? 2000,
            },
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Google Gemini API error: ${error}`)
        }

        const data = await response.json()
        return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      }
    }
  }

  throw new Error(`不支持的模型提供商: ${provider}`)
}

export type AIClient = ReturnType<typeof createAIClient>
