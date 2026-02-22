export const generateQuestionsPrompt = (idea: string) => `
你是一个专业的产品经理和创业顾问。用户有一个产品想法，需要你帮助澄清和结构化这个想法。

用户的想法："""${idea}"""

请根据这个想法，生成3个引导性问题，帮助用户更好地思考产品定位。问题应该：
1. 简洁明了，非技术背景也能理解
2. 提供示例答案，降低回答门槛
3. 覆盖目标用户、痛点、价值主张三个维度

请用以下JSON格式返回（不要包含markdown代码块标记）：

{
  "questions": [
    {
      "id": "target_user",
      "question": "这个产品主要是给谁用的？",
      "placeholder": "描述你的目标用户群体...",
      "example": "例如：自由设计师、小型企业主..."
    },
    {
      "id": "pain_point",
      "question": "...",
      "placeholder": "...",
      "example": "..."
    },
    {
      "id": "transformation",
      "question": "...",
      "placeholder": "...",
      "example": "..."
    }
  ]
}

要求：
- 问题必须与用户的想法高度相关
- 示例答案要具体、真实
- 返回纯JSON，不要其他文字
`;

export const generatePagePrompt = (
  idea: string,
  answers: Record<string, string>,
  language: 'zh-CN' | 'en' = 'zh-CN'
) => {
  const isChinese = language === 'zh-CN';

  if (isChinese) {
    return `
你是一个专业的产品文案撰写专家和着陆页设计师。根据用户提供的产品想法和回答，生成一个完整的单页产品页面内容。

用户的产品想法："""${idea}"""

用户的回答：
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

请生成以下内容的着陆页文案，要求：
1. 产品名称：简洁、易记、有辨识度（2-3个字最佳）
2. 一句话介绍：价值主张清晰，不超过15个字
3. 问题描述：共情目标用户的痛点，描述具体场景
4. 解决方案：突出核心功能，用3个特性展示
5. CTA：行动号召按钮文案

请用以下JSON格式返回（不要包含markdown代码块标记）：

{
  "productName": "产品名称",
  "tagline": "一句话介绍",
  "description": "简短描述，50字以内",
  "problemSection": {
    "headline": "痛点标题，引发共鸣",
    "description": "痛点详细描述，100字以内，用场景化语言",
    "painPoints": ["痛点1", "痛点2", "痛点3"]
  },
  "solutionSection": {
    "headline": "解决方案标题",
    "description": "解决方案概述，50字以内",
    "features": [
      {
        "title": "功能1标题",
        "description": "功能1描述",
        "icon": "相关emoji"
      },
      {
        "title": "功能2标题",
        "description": "功能2描述",
        "icon": "相关emoji"
      },
      {
        "title": "功能3标题",
        "description": "功能3描述",
        "icon": "相关emoji"
      }
    ]
  },
  "ctaSection": {
    "text": "开始使用",
    "subtext": "无需信用卡，立即体验"
  }
}

要求：
- 文案风格：专业但不生硬，有温度
- 使用中文，符合中文语境
- 避免过度营销词汇，真诚表达
- 返回纯JSON，不要其他文字
`;
  } else {
    return `
You are a professional product copywriter and landing page designer. Based on the user's product idea and responses, generate a complete single-page product page content.

User's product idea: """${idea}"""

User's responses:
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Generate landing page copy with the following requirements:
1. Product name: Concise, memorable, and distinctive (2-3 words ideal)
2. Tagline: Clear value proposition, no more than 10 words
3. Problem description: Empathize with target users' pain points, describe specific scenarios
4. Solution: Highlight core features with 3 key characteristics
5. CTA: Call-to-action button copy

Return in the following JSON format (do not include markdown code blocks):

{
  "productName": "Product Name",
  "tagline": "One-line introduction",
  "description": "Brief description, under 20 words",
  "problemSection": {
    "headline": "Pain point headline that resonates",
    "description": "Detailed pain point description, under 50 words, use scenario-based language",
    "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"]
  },
  "solutionSection": {
    "headline": "Solution headline",
    "description": "Solution overview, under 20 words",
    "features": [
      {
        "title": "Feature 1 title",
        "description": "Feature 1 description",
        "icon": "Related emoji"
      },
      {
        "title": "Feature 2 title",
        "description": "Feature 2 description",
        "icon": "Related emoji"
      },
      {
        "title": "Feature 3 title",
        "description": "Feature 3 description",
        "icon": "Related emoji"
      }
    ]
  },
  "ctaSection": {
    "text": "Get Started",
    "subtext": "No credit card required, start now"
  }
}

Requirements:
- Writing style: Professional but approachable, warm
- Use English, conform to English context and idioms
- Avoid overly promotional language, express sincerely
- Return pure JSON, no other text
`;
  }
};

export function parseAIResponse<T>(content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch {
    const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }
    
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(content.slice(jsonStart, jsonEnd + 1)) as T;
    }
    
    throw new Error('无法解析AI响应');
  }
}
