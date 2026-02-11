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
import { Plus, Trash2, Edit2, Key, Users, Coins, Search, Loader2, CheckCircle } from 'lucide-react'
import { MODEL_PRESETS, getPresetsByProvider } from '@/lib/models/presets'

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

interface UserInfo {
  id: string
  email: string
  remainingCredits: number
  generationCount: number
  saveCount: number
}

type TabType = 'models' | 'credits'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'zhipu', label: '智谱AI (GLM)' },
  { value: 'moonshot', label: 'Moonshot (Kimi)' },
  { value: 'alibaba', label: '阿里云百炼 (Qwen)' },
  { value: 'custom', label: '自定义 OpenAI 兼容' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('models')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (!response.ok) {
        setIsAdmin(false)
        return
      }
      const data = await response.json()
      if (!data.data?.email) {
        setIsAdmin(false)
        return
      }
      
      const adminEmail = '123387447@qq.com'
      setIsAdmin(data.data.email === adminEmail)
    } catch (error) {
      console.error('Failed to check admin status:', error)
      setIsAdmin(false)
    } finally {
      setIsCheckingAdmin(false)
    }
  }

  if (isCheckingAdmin) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-500">检查权限...</div>
      </main>
    )
  }

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-xl mb-4">拒绝访问</div>
          <p className="text-neutral-600 mb-4">您没有权限访问此页面</p>
          <a href="/" className="text-blue-500 hover:underline">
            返回首页
          </a>
        </Card>
      </main>
    )
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
        <div className="flex gap-4 mb-8 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('models')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'models'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              模型配置
            </div>
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'credits'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              用户充值
            </div>
          </button>
        </div>

        {activeTab === 'models' && <ModelsTab />}
        {activeTab === 'credits' && <CreditsTab />}
      </div>
    </main>
  )
}

function ModelsTab() {
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
  const [selectedPreset, setSelectedPreset] = useState('')

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
    setSelectedPreset('')
  }

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId)
    const preset = MODEL_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setModelName(preset.name)
      setProvider(preset.provider)
      setModelId(preset.modelId)
      setBaseUrl(preset.baseUrl)
      setDescription(preset.description)
    }
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
    setSelectedPreset('')
    setIsModelDialogOpen(true)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">AI 模型配置</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            大模型管理
          </CardTitle>
          <Dialog open={isModelDialogOpen} onOpenChange={(open) => {
            setIsModelDialogOpen(open)
            if (open) resetModelForm()
          }}>
            <DialogTrigger asChild>
              <Button>
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
                  <Label>提供商</Label>
                  <Select value={provider} onValueChange={(val) => {
                    setProvider(val)
                    setSelectedPreset('')
                    setModelName('')
                    setModelId('')
                    setBaseUrl('')
                    setDescription('')
                  }}>
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
                
                {!editingModel && getPresetsByProvider(provider).length > 0 && (
                  <div>
                    <Label>选择模型</Label>
                    <Select value={selectedPreset} onValueChange={handlePresetChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={`选择 ${PROVIDERS.find(p => p.value === provider)?.label} 模型`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getPresetsByProvider(provider).map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      选择预设模型自动填充配置
                    </p>
                  </div>
                )}
                
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    只需填写 API Key，其他配置已预设
                  </p>
                </div>
                
                {selectedPreset && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium">预设配置</h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <div><span className="font-medium">名称:</span> {modelName}</div>
                      <div><span className="font-medium">模型ID:</span> {modelId}</div>
                      <div><span className="font-medium">Base URL:</span> {baseUrl}</div>
                      <div><span className="font-medium">描述:</span> {description}</div>
                    </div>
                  </div>
                )}
                
                {!selectedPreset && (
                  <>
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
                      <Label>Base URL</Label>
                      <Input
                        placeholder="https://api.custom.com/v1"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="mt-1"
                      />
                    </div>
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
                  </>
                )}
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
  )
}

function CreditsTab() {
  const [searchEmail, setSearchEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [searchError, setSearchError] = useState('')
  
  const [creditAmount, setCreditAmount] = useState('')
  const [isAddingCredits, setIsAddingCredits] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [addError, setAddError] = useState('')

  const handleSearch = async () => {
    if (!searchEmail.trim()) return
    
    setIsSearching(true)
    setSearchError('')
    setUserInfo(null)
    setAddSuccess(false)
    
    try {
      const response = await fetch(`/api/admin/users?email=${encodeURIComponent(searchEmail)}`)
      const data = await response.json()
      
      if (!data.success) {
        setSearchError(data.error?.message || '查询失败')
        return
      }
      
      setUserInfo(data.data)
    } catch (error) {
      console.error('Search user error:', error)
      setSearchError('查询失败，请重试')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddCredits = async () => {
    if (!userInfo || !creditAmount) return
    
    const amount = parseInt(creditAmount)
    if (isNaN(amount) || amount <= 0) {
      setAddError('请输入有效的充值数量')
      return
    }
    
    setIsAddingCredits(true)
    setAddError('')
    setAddSuccess(false)
    
    try {
      const response = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id,
          amount: amount
        })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setAddError(data.error?.message || '充值失败')
        return
      }
      
      setAddSuccess(true)
      setCreditAmount('')
      
      setUserInfo({
        ...userInfo,
        remainingCredits: data.data.newBalance
      })
      
      setTimeout(() => setAddSuccess(false), 3000)
    } catch (error) {
      console.error('Add credits error:', error)
      setAddError('充值失败，请重试')
    } finally {
      setIsAddingCredits(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">用户充值管理</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              查找用户
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>用户邮箱</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="user@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !searchEmail.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {searchError && (
              <div className="text-red-500 text-sm">{searchError}</div>
            )}

            {userInfo && (
              <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-neutral-900 font-medium">
                  <Users className="h-4 w-4" />
                  {userInfo.email}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {userInfo.remainingCredits}
                    </div>
                    <div className="text-neutral-500">剩余额度</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-neutral-900">
                      {userInfo.generationCount}
                    </div>
                    <div className="text-neutral-500">生成次数</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-neutral-900">
                      {userInfo.saveCount}
                    </div>
                    <div className="text-neutral-500">保存次数</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              充值额度
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!userInfo ? (
              <div className="text-center py-8 text-neutral-400">
                请先搜索用户
              </div>
            ) : (
              <>
                <div>
                  <Label>充值数量（次）</Label>
                  <Input
                    type="number"
                    placeholder="输入充值数量"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="mt-1"
                    min={1}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    将为 {userInfo.email} 增加额度
                  </p>
                </div>

                {addError && (
                  <div className="text-red-500 text-sm">{addError}</div>
                )}

                {addSuccess && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    充值成功！
                  </div>
                )}

                <Button
                  onClick={handleAddCredits}
                  disabled={isAddingCredits || !creditAmount}
                  className="w-full"
                >
                  {isAddingCredits ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      充值中...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      确认充值
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
