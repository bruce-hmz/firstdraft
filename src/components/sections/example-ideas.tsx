'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from '@/lib/next-intl'
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

const EXAMPLE_IDEA_IDS = ['dev-tool', 'parenting-app', 'sleep-tracker', 'social-community', 'ecommerce-helper', 'content-creator']

interface ExampleIdeasProps {
  onSelectIdea: (idea: string) => void
}

export function ExampleIdeas({ onSelectIdea }: ExampleIdeasProps) {
  const t = useTranslations()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const exampleIdeas: ExampleIdea[] = useMemo(() => {
    return EXAMPLE_IDEA_IDS.map(id => ({
      id,
      title: t(`home.exampleIdeas.${id}.title`),
      description: t(`home.exampleIdeas.${id}.description`),
      category: t(`home.exampleIdeas.${id}.category`),
      tags: [
        t(`home.exampleIdeas.${id}.tags.0`),
        t(`home.exampleIdeas.${id}.tags.1`),
        t(`home.exampleIdeas.${id}.tags.2`),
      ],
    }))
  }, [t])

  const categories = useMemo(() => {
    return Array.from(new Set(exampleIdeas.map(idea => idea.category)))
  }, [exampleIdeas])

  const filteredIdeas = selectedCategory
    ? exampleIdeas.filter(idea => idea.category === selectedCategory)
    : exampleIdeas

  const handleSelectIdea = (idea: ExampleIdea) => {
    const fullDescription = `${idea.title}：${idea.description}`
    onSelectIdea(fullDescription)
  }

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-neutral-900">{t('home.exampleTitle')}</h3>
        </div>
        <p className="text-neutral-600">
          {t('home.exampleDescription')}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className="text-sm"
        >
          {t('home.exampleAll')}
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
          {t('home.exampleHint')}
        </p>
      </div>
    </div>
  )
}
