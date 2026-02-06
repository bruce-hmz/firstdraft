export interface Question {
  id: string
  question: string
  placeholder: string
  example: string
}

export interface QuestionTemplate {
  keywords: string[]
  questions: Question[]
}

// 精细化场景模板
const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // 亲子/育儿类
  {
    keywords: ['宝宝', '婴儿', '育儿', '孩子', '成长记录', '宝妈', '奶爸', '亲子'],
    questions: [
      {
        id: 'target_user',
        question: '你的应用主要帮助什么样的父母？',
        placeholder: '描述目标父母群体的特征...',
        example: '0-3岁新手宝妈、职场二胎妈妈、爷爷奶奶带娃家庭',
      },
      {
        id: 'pain_point',
        question: '这些父母在记录宝宝成长时遇到什么困难？',
        placeholder: '描述具体的育儿记录痛点...',
        example: '照片散落在各相册难以整理、记不住疫苗接种时间、错过宝宝第一次翻身等里程碑',
      },
      {
        id: 'unique_value',
        question: '你的产品如何让育儿记录变得轻松又有意义？',
        placeholder: '说明核心功能和情感价值...',
        example: '自动生成成长时间轴、智能提醒疫苗体检、一键生成成长纪念册分享给家人',
      },
    ],
  },

  // 健身/运动类
  {
    keywords: ['健身', '运动', '减肥', '增肌', '瑜伽', '跑步', '训练'],
    questions: [
      {
        id: 'target_user',
        question: '你的应用主要服务什么样的健身人群？',
        placeholder: '描述目标用户的健身水平...',
        example: '健身小白想入门、工作繁忙的上班族、需要系统训练的进阶者',
      },
      {
        id: 'pain_point',
        question: '他们在健身过程中最难坚持或最容易放弃的原因是什么？',
        placeholder: '描述健身中的具体阻力...',
        example: '不知道动作标不标准、看不到效果就放弃、一个人练太孤独没动力',
      },
      {
        id: 'unique_value',
        question: '你的产品如何帮助他们养成健身习惯并看到效果？',
        placeholder: '说明激励和效果追踪机制...',
        example: 'AI实时纠正动作、可视化身体数据变化、打卡社群互相监督',
      },
    ],
  },

  // 学习/教育类
  {
    keywords: ['学习', '教育', '考试', '英语', '编程', '技能', '课程', '知识'],
    questions: [
      {
        id: 'target_user',
        question: '你的学习工具主要面向什么样的学习者？',
        placeholder: '描述目标学习群体...',
        example: '在职想转行的人、准备考证的学生、想培养新兴趣的成年人',
      },
      {
        id: 'pain_point',
        question: '他们在自学过程中最容易遇到什么障碍？',
        placeholder: '描述学习中的具体困难...',
        example: '不知道从哪里开始学、学了就忘没反馈、找不到合适的学习资源',
      },
      {
        id: 'unique_value',
        question: '你的产品如何让学习变得更高效和可持续？',
        placeholder: '说明学习方法和支持机制...',
        example: '个性化学习路径规划、间隔重复记忆提醒、项目实战练习',
      },
    ],
  },

  // 理财/财务类
  {
    keywords: ['理财', '记账', '投资', '省钱', '预算', '财务管理', '支出'],
    questions: [
      {
        id: 'target_user',
        question: '你的理财工具主要服务什么样的用户？',
        placeholder: '描述目标用户的财务状况...',
        example: '月光族想存钱、刚工作想理财的年轻人、想实现财务自由的奋斗者',
      },
      {
        id: 'pain_point',
        question: '他们在理财或记账时最头疼的问题是什么？',
        placeholder: '描述财务管理的具体痛点...',
        example: '不知道钱花哪了、记账太麻烦坚持不下来、不懂投资怕亏',
      },
      {
        id: 'unique_value',
        question: '你的产品如何帮助他们建立健康的财务习惯？',
        placeholder: '说明自动化和激励机制...',
        example: '自动同步账单无需手动记、智能分析消费结构、可视化储蓄目标进度',
      },
    ],
  },

  // 宠物类
  {
    keywords: ['宠物', '猫', '狗', '养宠', '铲屎官', '宠物店', '宠物用品'],
    questions: [
      {
        id: 'target_user',
        question: '你的应用主要服务什么样的宠物主人？',
        placeholder: '描述养宠人群的特征...',
        example: '忙碌的上班族铲屎官、多宠家庭、新手宠物家长',
      },
      {
        id: 'pain_point',
        question: '养宠过程中最让他们焦虑或困扰的是什么？',
        placeholder: '描述养宠的具体痛点...',
        example: '忘记驱虫疫苗时间、不知道宠物异常行为啥意思、宠物生病找不到靠谱医院',
      },
      {
        id: 'unique_value',
        question: '你的产品如何让养宠变得更轻松和科学？',
        placeholder: '说明智能化和便利性...',
        example: '智能提醒喂养护理时间、AI识别宠物情绪健康、附近宠物服务一键预约',
      },
    ],
  },

  // 旅行/出游类
  {
    keywords: ['旅行', '旅游', '出游', '攻略', '景点', '酒店', '行程'],
    questions: [
      {
        id: 'target_user',
        question: '你的旅行工具主要面向什么样的旅行者？',
        placeholder: '描述旅行者的类型...',
        example: '背包客穷游党、亲子游家庭、周末短途游上班族',
      },
      {
        id: 'pain_point',
        question: '他们在规划或旅行过程中最费时费力的是什么？',
        placeholder: '描述旅行规划的具体痛点...',
        example: '做攻略太麻烦信息太分散、行程排太满或太松散、到了当地语言不通',
      },
      {
        id: 'unique_value',
        question: '你的产品如何让旅行规划变得简单且体验更好？',
        placeholder: '说明智能规划和本地服务...',
        example: '输入目的地自动生成行程、实时推荐附近美食景点、离线地图和翻译',
      },
    ],
  },

  // 美食/烹饪类
  {
    keywords: ['美食', '烹饪', '菜谱', '做饭', '烘焙', '食谱', '厨房'],
    questions: [
      {
        id: 'target_user',
        question: '你的美食应用主要服务什么样的烹饪爱好者？',
        placeholder: '描述目标用户的烹饪水平...',
        example: '厨房小白想学做菜、忙碌的上班族想快速做饭、喜欢研究新菜式的爱好者',
      },
      {
        id: 'pain_point',
        question: '他们在做饭或找菜谱时最常遇到的问题是什么？',
        placeholder: '描述烹饪的具体困难...',
        example: '不知道买什么菜、看菜谱步骤不清楚、想做某道菜但缺食材',
      },
      {
        id: 'unique_value',
        question: '你的产品如何让做饭变得更简单有趣？',
        placeholder: '说明智能推荐和教学...',
        example: '根据现有食材推荐菜谱、视频分步骤教学、智能购物清单生成',
      },
    ],
  },

  // 睡眠/健康类
  {
    keywords: ['睡眠', '失眠', '助眠', '白噪音', '冥想', '放松', '休息'],
    questions: [
      {
        id: 'target_user',
        question: '你的睡眠应用主要帮助什么样的用户？',
        placeholder: '描述目标用户的睡眠问题...',
        example: '熬夜失眠的上班族、焦虑睡不着的年轻人、需要改善睡眠质量的老年人',
      },
      {
        id: 'pain_point',
        question: '他们通常在睡前或睡眠中遇到什么困扰？',
        placeholder: '描述睡眠的具体问题...',
        example: '躺下后思绪万千睡不着、半夜易醒再难入睡、不知道睡眠质量如何',
      },
      {
        id: 'unique_value',
        question: '你的产品如何帮助他们改善睡眠质量？',
        placeholder: '说明助眠机制和数据反馈...',
        example: '个性化白噪音和冥想引导、睡眠周期分析、睡前放松计划',
      },
    ],
  },

  // SaaS/效率工具类
  {
    keywords: ['效率', '工具', 'SaaS', '软件', '平台', '系统', '自动化', '工作流'],
    questions: [
      {
        id: 'target_user',
        question: '你的工具主要帮助什么角色的用户提升效率？',
        placeholder: '描述目标用户的职业或身份...',
        example: '自由职业者管理多项目、小团队协作办公、远程工作者提高效率',
      },
      {
        id: 'pain_point',
        question: '他们在日常工作中最浪费时间或最容易出错的环节是什么？',
        placeholder: '描述工作效率的具体痛点...',
        example: '手动整理数据报表、跨平台切换管理、任务分配和跟进混乱',
      },
      {
        id: 'unique_value',
        question: '你的产品如何自动化或优化这个环节？',
        placeholder: '说明核心功能和效率提升...',
        example: '一键生成智能报表、统一工作台管理、自动提醒和进度追踪',
      },
    ],
  },

  // 电商/购物类
  {
    keywords: ['电商', '购物', '买', '卖', '商品', '店铺', '零售', '卖货'],
    questions: [
      {
        id: 'target_user',
        question: '你的产品主要面向什么类型的买家或卖家？',
        placeholder: '描述目标用户的消费习惯或商家类型...',
        example: '注重性价比的精明消费者、追求品质的轻奢人群、想要开网店的小商家',
      },
      {
        id: 'pain_point',
        question: '他们在购买或销售过程中最困扰的问题是什么？',
        placeholder: '描述电商交易的具体痛点...',
        example: '比价比到眼花、担心买到假货、店铺流量少不知道咋推广',
      },
      {
        id: 'unique_value',
        question: '你的产品如何创造更好的交易体验或销售效果？',
        placeholder: '说明差异化价值和便利性...',
        example: '全网比价自动找最低价、正品溯源保障、智能推荐精准获客',
      },
    ],
  },

  // 社交/社区类
  {
    keywords: ['社交', '社区', '交友', '圈子', '兴趣', '同好', '交流'],
    questions: [
      {
        id: 'target_user',
        question: '你希望连接什么样的用户群体？他们有什么共同特征？',
        placeholder: '描述社区用户的共同点...',
        example: '同城运动爱好者、特定行业从业者、某种兴趣的深度发烧友',
      },
      {
        id: 'pain_point',
        question: '他们在现有社交平台上无法得到满足的需求是什么？',
        placeholder: '描述社交的具体缺失...',
        example: '找不到志同道合的朋友、信息太杂质量低、缺乏深度交流的机会',
      },
      {
        id: 'unique_value',
        question: '你的平台如何创造独特的连接或交流体验？',
        placeholder: '说明社区的独特价值...',
        example: '基于兴趣精准匹配、高质量内容筛选、线下活动组织',
      },
    ],
  },

  // 创作/内容类
  {
    keywords: ['创作', '写作', '视频', '内容', '自媒体', '博主', 'up主', '创作'],
    questions: [
      {
        id: 'target_user',
        question: '你的工具主要面向什么类型的创作者？',
        placeholder: '描述创作者的身份...',
        example: '想做自媒体的新人、需要高效产出的职业博主、想记录生活的普通人',
      },
      {
        id: 'pain_point',
        question: '他们在创作过程中最头疼的问题是什么？',
        placeholder: '描述创作的具体困难...',
        example: '不知道写什么内容、剪辑太费时间、发了内容没流量',
      },
      {
        id: 'unique_value',
        question: '你的产品如何帮助他们提升创作效率或内容质量？',
        placeholder: '说明创作辅助和分发...',
        example: 'AI辅助选题和文案、一键剪辑模板、数据分析优化内容',
      },
    ],
  },

  // 默认通用模板
  {
    keywords: ['app', '应用', '小程序', '网站', '产品'],
    questions: [
      {
        id: 'target_user',
        question: '这个产品主要是给谁用的？',
        placeholder: '描述你的目标用户群体，越具体越好...',
        example: '刚毕业的职场新人、有特定需求的垂直人群、想解决某类问题的普通人',
      },
      {
        id: 'core_problem',
        question: '他们现在面临什么具体问题或痛点？',
        placeholder: '描述用户目前遇到的困难场景...',
        example: '现有方案太复杂或太贵、没有这个工具效率很低、手动操作容易出错',
      },
      {
        id: 'unique_value',
        question: '你的产品如何独特地解决这个问题？',
        placeholder: '说明你的解决方案和差异化价值...',
        example: '用AI自动化处理、比竞品更简单便宜、针对特定场景深度优化',
      },
    ],
  },
]

export function getQuestionsForIdea(idea: string): Question[] {
  const ideaLower = idea.toLowerCase()
  
  // 按匹配度排序，找到最相关的模板
  const matches = QUESTION_TEMPLATES.map(template => {
    const matchCount = template.keywords.filter(kw => 
      ideaLower.includes(kw.toLowerCase())
    ).length
    return { template, matchCount }
  }).filter(m => m.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
  
  if (matches.length > 0) {
    return matches[0].template.questions
  }
  
  // 返回默认模板
  return QUESTION_TEMPLATES[QUESTION_TEMPLATES.length - 1].questions
}
