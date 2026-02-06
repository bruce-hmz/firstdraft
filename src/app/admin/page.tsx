'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Edit2, Key } from 'lucide-react'

interface AIModel {
  id: string
  name: string
  provider: string
  apiKey: string
  baseUrl?: string
  modelId: string
  isActive: boolean
  isDefault: boolean
  description?: string
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'custom', label: '自定义 OpenAI 兼容' },
]

export default function AdminPage() {
  const [models, setModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<AIModel | null>(null)

  const [modelName, setModelName] = useState('')
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [modelId, setModelId] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/admin/models')
      const data = await response.json()
      if (data.success) {
        setModels(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveModel = async () => {
    const payload = {
      name: modelName,
      provider,
      apiKey,
      baseUrl: baseUrl || undefined,
      modelId,
      description: description || undefined,
      isActive,
      isDefault,
    }

    try {
      const url = editingModel ? `/api/admin/models/${editingModel.id}` : '/api/admin/models'
      const method = editingModel ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        fetchModels()
        resetModelForm()
        setIsModelDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to save model:', error)
    }
  }

  const handleDeleteModel = async (id: string) => {
    if (!confirm('确定要删除这个模型吗？')) return

    try {
      const response = await fetch(`/api/admin/models/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchModels()
      }
    } catch (error) {
      console.error('Failed to delete model:', error)
    }
  }

  const resetModelForm = () => {
    setModelName('')
    setProvider('openai')
    setApiKey('')
    setBaseUrl('')
    setModelId('')
    setDescription('')
    setIsActive(true)
    setIsDefault(false)
    setEditingModel(null)
  }

  const openEditDialog = (model: AIModel) => {
    setEditingModel(model)
    setModelName(model.name)
    setProvider(model.provider)
    setApiKey(model.apiKey)
    setBaseUrl(model.baseUrl || '')
    setModelId(model.modelId)
    setDescription(model.description || '')
    setIsActive(model.isActive)
    setIsDefault(model.isDefault)
    setIsModelDialogOpen(true)
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
          <span className="text-sm text-neutral-500">管理后台</span>
        </div>
        <a href="/" className="text-neutral-600 hover:text-neutral-900">
          返回首页
        </a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">AI 模型配置</h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              大模型管理
            </CardTitle>
            <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetModelForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加模型
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingModel ? '编辑模型' : '添加模型'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>模型名称</Label>
                    <Input
                      placeholder="例如：OpenAI GPT-4"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>提供商</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {provider === 'custom' && (
                    <div>
                      <Label>Base URL (可选)</Label>
                      <Input
                        placeholder="https://api.custom.com/v1"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                  <div>
                    <Label>模型 ID</Label>
                    <Input
                      placeholder="gpt-4o-mini"
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>描述</Label>
                    <Input
                      placeholder="简短描述这个模型的用途"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isActive}
                        onCheckedChange={setIsActive}
                        id="isActive"
                      />
                      <Label htmlFor="isActive">启用</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isDefault}
                        onCheckedChange={setIsDefault}
                        id="isDefault"
                      />
                      <Label htmlFor="isDefault">设为默认</Label>
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveModel}
                    disabled={!modelName || !apiKey || !modelId}
                    className="w-full"
                  >
                    {editingModel ? '保存修改' : '添加模型'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-neutral-500">加载中...</div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                暂无模型配置，点击右上角"添加模型"开始配置
              </div>
            ) : (
              <div className="space-y-3">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{model.name}</span>
                        {model.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            默认
                          </span>
                        )}
                        {!model.isActive && (
                          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                            已停用
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        {PROVIDERS.find((p) => p.value === model.provider)?.label || model.provider} · {model.modelId}
                      </p>
                      {model.description && (
                        <p className="text-xs text-neutral-400 mt-1">
                          {model.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(model)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteModel(model.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
