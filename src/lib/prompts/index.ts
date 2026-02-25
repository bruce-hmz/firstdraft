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
你是一名擅长情感化文案的落地页专家。
你的任务不是"写一个产品介绍"，而是**让看到页面的人产生"这正是我需要的"的强烈感受**。

---

## 用户的产品想法
"""${idea}"""

## 用户的回答（帮助理解目标用户和痛点）
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

---

## 核心原则（违反任何一条 = 失败）

1. **痛点必须场景化**：不要写"照片管理困难"，要写"当你在深夜打开手机想找那张珍贵的照片，翻了几百张却怎么也找不到..."
2. **解决方案写用户价值**：不要写"支持云存储"，要写"你的回忆永远安全，换个手机也不会丢"
3. **每个功能都是情感链接**：功能不是冷冰冰的特性，而是"解决某个具体焦虑的答案"
4. **CTA 要有情绪钩子**：不是"立即使用"，而是"现在就去留住那些值得记住的瞬间"

---

## 生成内容要求

### 1. productName（产品名）
- 2-4 个字
- 好记、有温度、暗示功能
- ❌ "智能照片管理系统" 
- ✅ "拾光" / "印记"

### 2. tagline（一句话定位）
- 不是产品介绍，而是**对用户的情感承诺**
- 15 字以内
- ❌ "帮助你整理照片的 AI 工具"
- ✅ "让回忆不再散落各处"

### 3. description（简短描述）
- 50 字以内
- 补充 tagline，说出用户最关心的那个"结果"

### 4. problemSection（痛点区）

**headline**：一句话戳中用户内心的标题
- ❌ "你是否面临这些困扰"
- ✅ "那些让你深夜失眠的瞬间"

**description**：用**第一人称视角**描述一个具体场景
- 必须包含：时间/地点 + 动作 + 挫败感
- 示例："当孩子突然问起'妈妈我小时候是什么样子'，你打开相册却发现照片散落在微信、iCloud、旧手机各处..."

**painPoints**：3 个痛点，每个痛点用"场景+情绪"结构
- ❌ "照片太多难以管理"
- ✅ "翻了一小时，找不到那张毕业合影"

### 5. solutionSection（解决方案区）

**headline**：让用户产生"原来可以这样"的期待
- ❌ "我们的解决方案"
- ✅ "现在，你可以这样守护回忆"

**description**：一句话说出核心价值，暗示"低门槛"
- 示例："几秒钟就能整理好，不用学习，立刻就能看到效果"

**features**：3 个功能，每个功能必须包含：
- **title**：用"动词+结果"命名
- **description**：强调用户受益，不是技术实现
- **icon**：选择能传递情感的 emoji

功能描述公式：
- ❌ "支持 AI 智能分类"
- ✅ "它会自动帮你把照片按人物、地点、时间整理好，你只需要享受翻看的乐趣"

### 6. ctaSection（行动召唤区）

**text**：带情绪的主按钮文案
- ❌ "开始使用"
- ✅ "现在就去留住那些值得记住的瞬间"

**subtext**：降低门槛的副文案
- ❌ "无需信用卡"
- ✅ "30 秒就能看到你的第一个整理结果"

---

## 输出格式（纯 JSON，不要 markdown 代码块）

{
  "productName": "...",
  "tagline": "...",
  "description": "...",
  "problemSection": {
    "headline": "...",
    "description": "...",
    "painPoints": ["...", "...", "..."]
  },
  "solutionSection": {
    "headline": "...",
    "description": "...",
    "features": [
      { "title": "...", "description": "...", "icon": "..." },
      { "title": "...", "description": "...", "icon": "..." },
      { "title": "...", "description": "...", "icon": "..." }
    ]
  },
  "ctaSection": {
    "text": "...",
    "subtext": "..."
  }
}

---

## 最后检查清单

生成完成后，请自检：
- [ ] 痛点区是否让人产生"就是我"的感觉？
- [ ] 功能描述是否强调用户受益而非技术？
- [ ] CTA 是否有情感钩子让人想点击？
- [ ] 每句话是否都值得被阅读（没有废话）？
`;
  } else {
    return `
You are a landing page expert specializing in emotional, conversion-focused copy.
Your task is not to "write a product description" but to **make visitors feel "this is exactly what I need"**.

---

## User's Product Idea
"""${idea}"""

## User's Responses (helps understand target users and pain points)
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

---

## Core Principles (violating any = failure)

1. **Pain points must be scenario-based**: Don't write "photo management is difficult", write "When you're scrolling through your phone at midnight trying to find that precious photo, swiping through hundreds but just can't find it..."
2. **Solutions describe user value**: Don't write "supports cloud storage", write "Your memories are safe forever, even if you change phones"
3. **Every feature is an emotional link**: Features aren't cold specs, they're "answers to specific anxieties"
4. **CTA has emotional hooks**: Not "Get Started", but "Start preserving the moments worth remembering"

---

## Content Requirements

### 1. productName
- 1-2 words
- Memorable, warm, hints at function
- ❌ "Smart Photo Management System"
- ✅ "Keepsake" / "Cherish"

### 2. tagline
- Not a product intro, but an **emotional promise to the user**
- Under 10 words
- ❌ "AI tool to help organize your photos"
- ✅ "Keep memories from scattering everywhere"

### 3. description
- Under 50 characters
- Complements tagline, states the "result" users care about most

### 4. problemSection

**headline**: A title that hits users right in the heart
- ❌ "Do you face these problems"
- ✅ "Those moments that keep you up at night"

**description**: Describe a specific scenario in **first-person perspective**
- Must include: time/place + action + frustration
- Example: "When your child suddenly asks 'Mom, what was I like when I was little?' You open your gallery only to find photos scattered across WeChat, iCloud, old phones..."

**painPoints**: 3 pain points, each using "scenario + emotion" structure
- ❌ "Too many photos to manage"
- ✅ "Spent an hour scrolling, still can't find that graduation photo"

### 5. solutionSection

**headline**: Creates anticipation of "I can do it this way"
- ❌ "Our Solution"
- ✅ "Now you can protect memories like this"

**description**: One sentence stating core value, hints at "low barrier"
- Example: "Organized in seconds, no learning curve, see results immediately"

**features**: 3 features, each must include:
- **title**: Named with "verb + result"
- **description**: Emphasize user benefit, not technical implementation
- **icon**: Choose an emoji that conveys emotion

Feature description formula:
- ❌ "Supports AI smart categorization"
- ✅ "It automatically organizes your photos by people, places, and time—you just enjoy browsing"

### 6. ctaSection

**text**: CTA with emotional trigger
- ❌ "Get Started"
- ✅ "Start preserving the moments worth remembering"

**subtext**: Barrier-lowering subtext
- ❌ "No credit card required"
- ✅ "See your first organized collection in 30 seconds"

---

## Output Format (pure JSON, no markdown code blocks)

{
  "productName": "...",
  "tagline": "...",
  "description": "...",
  "problemSection": {
    "headline": "...",
    "description": "...",
    "painPoints": ["...", "...", "..."]
  },
  "solutionSection": {
    "headline": "...",
    "description": "...",
    "features": [
      { "title": "...", "description": "...", "icon": "..." },
      { "title": "...", "description": "...", "icon": "..." },
      { "title": "...", "description": "...", "icon": "..." }
    ]
  },
  "ctaSection": {
    "text": "...",
    "subtext": "..."
  }
}

---

## Final Checklist

After generating, please self-check:
- [ ] Does the pain point section make people feel "that's me"?
- [ ] Do feature descriptions emphasize user benefits, not technology?
- [ ] Does the CTA have emotional hooks that make people want to click?
- [ ] Is every sentence worth reading (no fluff)?
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
