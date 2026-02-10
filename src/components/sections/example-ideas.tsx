'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb, ArrowRight } from 'lucide-react'

interface ExampleIdea {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
}

const EXAMPLE_IDEAS: ExampleIdea[] = [
  {
    id: 'dev-tool',
    title: '代码片段管理工具',
    description: '一个帮助开发者快速找到、保存和分享代码片段的工具',
    category: '开发工具',
    tags: ['开发者', '效率', '代码管理']
  },
  {
    id: 'parenting-app',
    title: '宝宝成长记录应用',
    description: '帮助新手父母记录宝宝成长里程碑、疫苗接种和日常护理的移动应用',
    category: '亲子育儿',
    tags: ['育儿', '成长记录', '新手父母']
  },
  {
    id: 'sleep-tracker',
    title: '智能睡眠追踪器',
    description: '通过AI分析睡眠模式，提供个性化睡眠改善建议的健康应用',
    category: '健康生活',
    tags: ['健康', '睡眠', 'AI分析']
  },
  {
    id: 'social-community',
    title: '兴趣社交平台',
    description: '连接有相同兴趣爱好的用户，创建深度交流的垂直社区',
    category: '社交社区',
    tags: ['社交', '社区', '兴趣']
  },
  {
    id: 'ecommerce-helper',
    title: '电商比价助手',
    description: '帮助消费者找到最优惠价格，提供正品保障和智能推荐',
    category: '电商购物',
    tags: ['电商', '比价', '购物助手']
  },
  {
    id: 'content-creator',
    title: '内容创作助手',
    description: 'AI辅助内容创作者选题、写作和分发的全流程工具',
    category: '内容创作',
    tags: ['创作', 'AI', '内容分发']
  }
]

interface ExampleIdeasProps {
  onSelectIdea: (idea: string) => void
}

export function ExampleIdeas({ onSelectIdea }: ExampleIdeasProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(EXAMPLE_IDEAS.map(idea => idea.category)))
  
  const filteredIdeas = selectedCategory 
    ? EXAMPLE_IDEAS.filter(idea => idea.category === selectedCategory)
    : EXAMPLE_IDEAS

  const handleSelectIdea = (idea: ExampleIdea) => {
    const fullDescription = `${idea.title}：${idea.description}`
    onSelectIdea(fullDescription)
  }

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-neutral-900">不知道从哪里开始？</h3>
        </div>
        <p className="text-neutral-600">
          选择一个示例想法，或者直接输入你自己的创意
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className="text-sm"
        >
          全部
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="text-sm"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => (
          <Card 
            key={idea.id} 
            className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-neutral-200"
            onClick={() => handleSelectIdea(idea)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {idea.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mb-2">
                    {idea.category}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
              </div>
              
              <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                {idea.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {idea.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-neutral-500">
          💡 点击任意示例想法开始，或者直接在上方输入你自己的创意
        </p>
      </div>
    </div>
  )
}