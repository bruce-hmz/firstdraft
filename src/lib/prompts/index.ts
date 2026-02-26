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
你的目标不是"写一个产品介绍"，而是**在 3 秒内抓住注意力，让用户产生"这正是我需要的"强烈感受，并立刻行动**。

---

## 用户的产品想法
"""${idea}"""

## 用户的回答（帮助理解目标用户和痛点）
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

---

## 核心转化原则（违反任何一条 = 转化失败）

1. **3 秒抓注意力**：第一句话必须直击痛点，让用户停下来
2. **痛点必须引发失落焦虑**：不是描述问题，而是让用户感受到"不解决这个问题会失去什么"
3. **解决方案要即时可见**：让用户能想象使用后的具体结果和心理感受
4. **功能要有故事性**：每个功能都是一个"从困扰到解脱"的微故事
5. **CTA 要制造紧迫感**：用"现在/未来对比"让用户觉得不能错过

---

## 生成内容要求

### 1. productName（产品名）
- 2-4 个字
- 好记、有温度、暗示功能
- ❌ "智能照片管理系统" 
- ✅ "拾光" / "印记"

### 2. tagline（Hero 标题 - 最关键）
**这是用户第一眼看到的内容，必须在 3 秒内抓住注意力**

结构：**痛点钩子 + 价值承诺**
- 先说出用户正在经历的困扰
- 再给出解决这个困扰的承诺

❌ 错误示例：
- "帮助你整理照片的 AI 工具"（太平淡，没有钩子）
- "让回忆不再散落各处"（还可以，但缺少冲击力）

✅ 正确示例：
- "当你想保存回忆，却无从下手 → 让 FirstDraft 自动整理你的成长故事"
- "照片太多找不到那张珍贵的？→ 一键生成你的专属回忆集"

**输出两行，用换行符分隔**：
- 第一行写痛点钩子（描述用户正在经历的困扰）
- 第二行写价值承诺（你的产品如何解决这个困扰）
- ⚠️ 直接输出文案内容，不要写"第一行：""第二行："这样的标签

输出格式示例：
- "总以为能记住宝宝每个第一次，回过神来却发现已经模糊\n让「拾光」帮你自动记录，把每个珍贵瞬间都变成永恒故事"
### 3. description（简短描述）
- 50 字以内
- 用一句话说出用户使用后能得到的具体结果

### 4. problemSection（痛点区 - 强化失落焦虑）

**headline**：不是问用户是否有问题，而是点出他们内心深处的焦虑
- ❌ "你是否面临这些困扰"
- ❌ "那些让你深夜失眠的瞬间"
- ✅ "当你翻开旧照片，却发现回忆乱成一团"
- ✅ "那些比丢失照片更痛的失落感"

**description**：用**第一人称视角**描述一个完整场景，引发"失落焦虑"
- 必须包含：场景描述 + 失落感 + "如果再不行动会怎样"的暗示
- 结构：当你...的时候 → 你发现... → 那种失落比...更痛

示例：
"当你翻开旧照片想找回那些珍贵的瞬间，却发现回忆散落在手机、微信、云盘各处，怎么也拼不完整。那种失落，比丢照片更痛——因为照片还在，但故事却找不回来了。"

**painPoints**：3 个痛点，每个痛点都要有"失去感"

❌ 错误示例：
- "照片太多难以管理"（只是描述问题）
- "找不到那张毕业合影"（缺少情绪）

✅ 正确示例：
- "翻了一小时，还是找不到孩子第一次走路的照片——那个瞬间可能永远消失了"
- "想给父母看当年的旅行照片，却发现存在旧手机里早就打不开了"
- "每次换手机都会丢一批照片，那些回忆再也找不回来了"

### 5. solutionSection（解决方案区 - 即时效果感）

**headline**：让用户产生"原来可以这样，而且很简单"的期待
- ❌ "我们的解决方案"
- ✅ "只需一键，混乱变故事"
- ✅ "现在，让你的回忆自己整理自己"

**description**：一句话说出核心价值 + 即时效果感
- 必须包含：**动作 + 时间 + 结果 + 心理感受**

❌ 错误示例：
- "几秒钟就能整理好，不用学习"（缺少心理感受）

✅ 正确示例：
- "只需一键生成，自动整理你的时间线。未来你可以自豪地分享那些珍贵瞬间"
- "30 秒内，看着混乱的照片变成一个完整的故事——你会忍不住想分享给家人"

**features**：3 个功能，每个功能都要有**故事性**

功能描述公式：**从困扰 → 到解脱 → 最终结果**

❌ 错误示例：
- "支持 AI 智能分类"（纯技术描述）
- "自动整理照片"（缺少故事性）

✅ 正确示例：
- title: "自动把混乱变成连续故事"
  description: "上传照片后，它会自动按时间、人物、地点整理——你只需要享受翻看的乐趣"
- title: "一键生成可分享页面"
  description: "整理好的回忆可以变成精美页面，一键分享给家人朋友"
- title: "永久保存，随时回看"
  description: "存在云端永远不会丢，换个手机也能继续看那些珍贵的瞬间"

### 6. ctaSection（行动召唤区 - 制造紧迫感）

**text**：用"现在/未来对比"制造紧迫感

❌ 错误示例：
- "开始使用"（太平淡）
- "现在就去留住回忆"（还可以，但缺少对比）

✅ 正确示例：
- "现在就开始保存你的回忆，不再等到未来才后悔"
- "30 秒整理你的故事，别让回忆继续散落下去"
- "立即开始，趁那些瞬间还记得"

**subtext**：降低门槛 + 暗示即时回报
- ❌ "无需信用卡"
- ✅ "30 秒看到第一个整理结果"
- ✅ "免费开始，立刻看到效果"

---

## 输出格式（纯 JSON，不要 markdown 代码块）

{
  "productName": "...",
  "tagline": "总以为能记住宝宝每个第一次，回过神来却发现已经模糊\n让「拾光」帮你自动记录，把每个珍贵瞬间都变成永恒故事",
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

## 转化检查清单（生成后必须通过）

- [ ] **Hero 标题**：是否在 3 秒内抓住注意力？是否有痛点钩子 + 价值承诺？
- [ ] **痛点区**：是否引发"失落焦虑"而不是仅仅描述问题？
- [ ] **解决方案**：是否让用户能想象使用后的具体结果和心理感受？
- [ ] **功能描述**：每个功能是否有故事性（从困扰到解脱）？
- [ ] **CTA**：是否用"现在/未来对比"制造紧迫感？
- [ ] **整体**：是否让用户产生"如果不用这个产品，我会错过什么"的感觉？
`;
  } else {
    return `
You are a landing page expert specializing in emotional, conversion-focused copy.
Your goal is not to "write a product description" but to **capture attention in 3 seconds, make visitors feel "this is exactly what I need", and drive immediate action**.

---

## User's Product Idea
"""${idea}"""

## User's Responses (helps understand target users and pain points)
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

---

## Core Conversion Principles (violating any = conversion failure)

1. **3-Second Attention Grab**: The first line must hit the pain point directly, make users stop scrolling
2. **Pain Points Must Trigger Loss Anxiety**: Don't just describe problems—make users feel what they'll lose if they don't solve this
3. **Solution Must Feel Instant**: Let users imagine the concrete result and emotional feeling after using
4. **Features Must Have Story**: Each feature is a micro "from struggle to relief" story
5. **CTA Must Create Urgency**: Use "now/future contrast" to make users feel they can't miss this

---

## Content Requirements

### 1. productName
- 1-2 words
- Memorable, warm, hints at function
- ❌ "Smart Photo Management System"
- ✅ "Keepsake" / "Cherish"

### 2. tagline (Hero Title - Most Critical)
**This is the first thing users see. It must capture attention in 3 seconds.**

Structure: **Pain Hook + Value Promise**
- First state the struggle the user is experiencing
- Then give the promise that solves this struggle

❌ Wrong examples:
- "AI tool to help organize your photos" (too flat, no hook)
- "Keep memories from scattering everywhere" (okay, but lacks impact)

✅ Correct examples:
- "When you want to save memories but don't know where to start → Let Keepsake organize your story automatically"
- "Too many photos, can't find that precious one? → One click to create your personal memory collection"

**Output two lines, separated by newline**:
- Line 1 (Pain Hook): Describe the struggle the user is experiencing
- Line 2 (Value Promise): How your product solves this struggle
- ⚠️ Output the actual copy directly, DO NOT include "Line 1:" or "Line 2:" labels

Output format example:
- "Thought I'd remember every first moment, but looking back it's all blurry now\nLet Keepsake capture it all, turning precious moments into timeless stories"
### 3. description
- Under 50 characters
- One sentence stating the concrete result users get after using

### 4. problemSection (Pain Zone - Amplify Loss Anxiety)

**headline**: Don't ask if users have problems—point out the anxiety deep in their hearts
- ❌ "Do you face these problems"
- ❌ "Those moments that keep you up at night"
- ✅ "When you open old photos, only to find memories in chaos"
- ✅ "That loss feeling more painful than losing photos"

**description**: Describe a complete scene in **first-person perspective**, trigger "loss anxiety"
- Must include: Scene description + Loss feeling + Hint of "what if I don't act"
- Structure: When you... → You discover... → That loss is more painful than...

Example:
"When you open old photos wanting to revisit those precious moments, only to find memories scattered across your phone, WeChat, cloud drives—impossible to piece together. That loss is more painful than losing photos—because the photos exist, but the story can't be found anymore."

**painPoints**: 3 pain points, each must have a "sense of loss"

❌ Wrong examples:
- "Too many photos to manage" (just describing problem)
- "Can't find that graduation photo" (lacks emotion)

✅ Correct examples:
- "Scrolled for an hour, still can't find the photo of baby's first steps—that moment might be gone forever"
- "Want to show parents those travel photos, but they're stuck on an old phone that won't turn on anymore"
- "Every phone change loses a batch of photos, those memories are gone forever"

### 5. solutionSection (Solution Zone - Instant Effect Feeling)

**headline**: Create anticipation of "I can do it this way, and it's simple"
- ❌ "Our Solution"
- ✅ "One click, chaos becomes story"
- ✅ "Now, let your memories organize themselves"

**description**: One sentence stating core value + instant effect feeling
- Must include: **Action + Time + Result + Emotional feeling**

❌ Wrong example:
- "Organized in seconds, no learning curve" (lacks emotional feeling)

✅ Correct examples:
- "Just one click, automatically organize your timeline. Soon you'll be proudly sharing those precious moments"
- "Within 30 seconds, watch scattered photos become a complete story—you'll want to share it with family immediately"

**features**: 3 features, each must have **story quality**

Feature description formula: **From struggle → To relief → Final result**

❌ Wrong examples:
- "Supports AI smart categorization" (pure tech description)
- "Automatically organize photos" (lacks story)

✅ Correct examples:
- title: "Automatically turn chaos into continuous story"
  description: "After uploading, it automatically organizes by time, people, places—you just enjoy browsing"
- title: "One-click shareable page"
  description: "Organized memories become beautiful pages, share with family and friends in one click"
- title: "Forever saved, always accessible"
  description: "Stored in cloud, never lost—even if you change phones, those precious moments are still there"

### 6. ctaSection (Call to Action - Create Urgency)

**text**: Use "now/future contrast" to create urgency

❌ Wrong examples:
- "Get Started" (too flat)
- "Start preserving memories now" (okay, but lacks contrast)

✅ Correct examples:
- "Start saving your memories now, don't wait until it's too late"
- "30 seconds to organize your story, don't let memories keep scattering"
- "Start now, while those moments are still remembered"

**subtext**: Lower barrier + hint at instant reward
- ❌ "No credit card required"
- ✅ "See your first organized result in 30 seconds"
- ✅ "Start free, see results immediately"

---

## Output Format (pure JSON, no markdown code blocks)

{
  "productName": "...",
  "tagline": "Thought I'd remember every first moment, but looking back it's all blurry now\nLet Keepsake capture it all, turning precious moments into timeless stories",
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

## Conversion Checklist (must pass after generating)

- [ ] **Hero Title**: Does it capture attention in 3 seconds? Does it have pain hook + value promise?
- [ ] **Pain Zone**: Does it trigger "loss anxiety" rather than just describing problems?
- [ ] **Solution**: Can users imagine the concrete result and emotional feeling after using?
- [ ] **Feature Descriptions**: Does each feature have story quality (from struggle to relief)?
- [ ] **CTA**: Does it use "now/future contrast" to create urgency?
- [ ] **Overall**: Does it make users feel "if I don't use this product, what will I miss"?
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
