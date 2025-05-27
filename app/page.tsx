"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Hash,
  Sparkles,
  Filter,
  Shield,
  ShieldCheck,
  Link,
  Eye,
  EyeOff,
  TrendingUp,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  RefreshCw,
  X,
} from "lucide-react"

interface TagItem {
  id: string
  name: string
  description: string
  category: string
  color: string
  url?: string
  favicon?: string
  isActive: boolean
  clickCount: number
  createdAt: Date
  updatedAt: Date
}

interface WebsiteInfo {
  title: string
  description: string
  favicon: string
  url: string
}

const categories = ["工作", "学习", "娱乐", "技术", "生活", "其他"]

const colors = [
  {
    bg: "bg-gradient-to-r from-blue-500 to-blue-600",
    text: "text-blue-600",
    border: "border-blue-200",
    light: "bg-blue-50",
  },
  {
    bg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-200",
    light: "bg-emerald-50",
  },
  {
    bg: "bg-gradient-to-r from-purple-500 to-purple-600",
    text: "text-purple-600",
    border: "border-purple-200",
    light: "bg-purple-50",
  },
  {
    bg: "bg-gradient-to-r from-rose-500 to-rose-600",
    text: "text-rose-600",
    border: "border-rose-200",
    light: "bg-rose-50",
  },
  {
    bg: "bg-gradient-to-r from-amber-500 to-amber-600",
    text: "text-amber-600",
    border: "border-amber-200",
    light: "bg-amber-50",
  },
  {
    bg: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    text: "text-indigo-600",
    border: "border-indigo-200",
    light: "bg-indigo-50",
  },
  {
    bg: "bg-gradient-to-r from-teal-500 to-teal-600",
    text: "text-teal-600",
    border: "border-teal-200",
    light: "bg-teal-50",
  },
  {
    bg: "bg-gradient-to-r from-slate-500 to-slate-600",
    text: "text-slate-600",
    border: "border-slate-200",
    light: "bg-slate-50",
  },
]

export default function TagWebsite() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagItem | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(false)
  const [fetchStatus, setFetchStatus] = useState<"idle" | "success" | "error">("idle")
  const [iconMethod, setIconMethod] = useState<"auto" | "upload" | "url">("auto")
  const [customIconUrl, setCustomIconUrl] = useState("")
  const [uploadedIcon, setUploadedIcon] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    color: "0",
    url: "",
    favicon: "",
    isActive: true,
  })

  // 初始化示例数据
  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => {
        const parsedTags = data.map((tag: any) => ({
          ...tag,
          createdAt: new Date(tag.createdAt),
          updatedAt: new Date(tag.updatedAt),
        }))
        setTags(parsedTags)
      })
  }, [])

  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || tag.category === selectedCategory
    const matchesStatus = showInactive || tag.isActive
    return matchesSearch && matchesCategory && matchesStatus
  })

  // 获取热门标签（按点击次数排序，只显示前5个活跃标签）
  const popularTags = tags
    .filter((tag) => tag.isActive)
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 5)

  // 标准化URL格式
  const normalizeUrl = (input: string): string => {
    let url = input.trim()

    // 如果没有协议，添加 https://
    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`
    }

    return url
  }

  // 提取域名
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
    }
  }

  // 使用多个API获取网站信息
  const fetchWebsiteInfo = async (input: string): Promise<WebsiteInfo | null> => {
    setIsLoadingWebsite(true)
    setFetchStatus("idle")

    try {
      const normalizedUrl = normalizeUrl(input)
      const domain = extractDomain(normalizedUrl)

      // 方法1: 使用 LinkPreview API
      try {
        const response = await fetch(`https://api.linkpreview.net/?key=demo&q=${encodeURIComponent(normalizedUrl)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.title && data.description) {
            setFetchStatus("success")
            return {
              title: data.title,
              description: data.description || `来自 ${domain} 的网站`,
              favicon: data.image || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
              url: normalizedUrl,
            }
          }
        }
      } catch (error) {
        console.log("LinkPreview API failed:", error)
      }

      // 方法2: 使用 Favicon API + 基本信息
      try {
        // 获取favicon
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

        // 尝试获取网站基本信息
        const metaResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`)
        if (metaResponse.ok) {
          const metaData = await metaResponse.json()
          const html = metaData.contents

          // 解析HTML获取title和description
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
          const descMatch =
            html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)

          const title = titleMatch ? titleMatch[1].trim() : domain
          const description = descMatch ? descMatch[1].trim() : `来自 ${domain} 的网站`

          setFetchStatus("success")
          return {
            title,
            description,
            favicon: faviconUrl,
            url: normalizedUrl,
          }
        }
      } catch (error) {
        console.log("Meta fetch failed:", error)
      }

      // 方法3: 使用 Microlink API
      try {
        const microlinkResponse = await fetch(`https://api.microlink.io?url=${encodeURIComponent(normalizedUrl)}`)
        if (microlinkResponse.ok) {
          const microlinkData = await microlinkResponse.json()
          if (microlinkData.status === "success" && microlinkData.data) {
            setFetchStatus("success")
            return {
              title: microlinkData.data.title || domain,
              description: microlinkData.data.description || `来自 ${domain} 的网站`,
              favicon: microlinkData.data.logo?.url || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
              url: normalizedUrl,
            }
          }
        }
      } catch (error) {
        console.log("Microlink API failed:", error)
      }

      // 备用方案：使用基本信息
      setFetchStatus("error")
      return {
        title: domain,
        description: `来自 ${domain} 的网站`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        url: normalizedUrl,
      }
    } catch (error) {
      console.error("All fetch methods failed:", error)
      setFetchStatus("error")
      return null
    } finally {
      setIsLoadingWebsite(false)
    }
  }

  const handleDomainInput = async (input: string) => {
    if (!input || input.length < 3) return

    const websiteInfo = await fetchWebsiteInfo(input)
    if (websiteInfo) {
      setFormData((prev) => ({
        ...prev,
        name: websiteInfo.title,
        description: websiteInfo.description,
        favicon: websiteInfo.favicon,
        url: websiteInfo.url,
      }))
      setIconMethod("auto")
    }
  }

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith("image/")) {
        alert("请选择图片文件")
        return
      }

      // 检查文件大小 (限制为2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("图片文件大小不能超过2MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedIcon(result)
        setFormData((prev) => ({ ...prev, favicon: result }))
        setIconMethod("upload")
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理自定义图标URL
  const handleCustomIconUrl = (url: string) => {
    setCustomIconUrl(url)
    setFormData((prev) => ({ ...prev, favicon: url }))
    setIconMethod("url")
  }

  // 重新获取图标
  const refetchIcon = async () => {
    if (formData.url) {
      const domain = extractDomain(formData.url)
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      setFormData((prev) => ({ ...prev, favicon: faviconUrl }))
      setIconMethod("auto")
      setUploadedIcon(null)
      setCustomIconUrl("")
    }
  }

  // 清除图标
  const clearIcon = () => {
    setFormData((prev) => ({ ...prev, favicon: "" }))
    setUploadedIcon(null)
    setCustomIconUrl("")
    setIconMethod("auto")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      setIsAdmin(true)
      setIsAdminDialogOpen(false)
      setAdminPassword("")
    } else {
      alert("密码错误")
    }
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    setShowInactive(false)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return

    const now = new Date()
    const newTag: TagItem = {
      id: editingTag ? editingTag.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      color: formData.color,
      url: formData.url,
      favicon: formData.favicon,
      isActive: formData.isActive,
      clickCount: editingTag ? editingTag.clickCount : 0,
      createdAt: editingTag ? editingTag.createdAt : now,
      updatedAt: now,
    }

    // 保存到数据库
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTag),
    })

    if (editingTag) {
      setTags(tags.map((tag) => (tag.id === editingTag.id ? newTag : tag)))
    } else {
      setTags([...tags, newTag])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      color: "0",
      url: "",
      favicon: "",
      isActive: true,
    })
    setEditingTag(null)
    setIsDialogOpen(false)
    setFetchStatus("idle")
    setIconMethod("auto")
    setUploadedIcon(null)
    setCustomIconUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleEdit = (tag: TagItem) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      description: tag.description,
      category: tag.category,
      color: tag.color,
      url: tag.url || "",
      favicon: tag.favicon || "",
      isActive: tag.isActive,
    })

    // 判断图标类型
    if (tag.favicon?.startsWith("data:")) {
      setIconMethod("upload")
      setUploadedIcon(tag.favicon)
    } else if (tag.favicon && !tag.favicon.includes("google.com/s2/favicons")) {
      setIconMethod("url")
      setCustomIconUrl(tag.favicon)
    } else {
      setIconMethod("auto")
    }

    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id))
  }

  const toggleTagStatus = (id: string) => {
    setTags(tags.map((tag) => (tag.id === id ? { ...tag, isActive: !tag.isActive, updatedAt: new Date() } : tag)))
  }

  const handleTagClick = (tag: TagItem) => {
    if (tag.url && tag.isActive) {
      // 增加点击次数
      setTags(tags.map((t) => (t.id === tag.id ? { ...t, clickCount: t.clickCount + 1 } : t)))
      // 打开链接
      window.open(tag.url, "_blank", "noopener,noreferrer")
    }
  }

  const getColorClasses = (colorIndex: string) => {
    return colors[Number.parseInt(colorIndex)] || colors[0]
  }

  const activeTags = tags.filter((tag) => tag.isActive)
  const activeCategories = new Set(activeTags.map((tag) => tag.category))

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <header className="relative bg-white border-b border-slate-200/60 sticky top-0 z-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75" />
                <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  标签管理器
                </h1>
                <p className="text-slate-600 mt-1">智能管理您的数字书签与标签</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* 管理员功能 */}
              {isAdmin ? (
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">管理员模式</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showInactive}
                      onCheckedChange={setShowInactive}
                      className="data-[state=checked]:bg-orange-500"
                    />
                    <span className="text-sm text-slate-600">显示已禁用</span>
                  </div>
                  <Button variant="outline" onClick={handleAdminLogout} className="rounded-xl">
                    退出管理
                  </Button>
                  {/* 只有管理员可以看到添加标签按钮 */}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setEditingTag(null)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        添加标签
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="space-y-3">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                          {editingTag ? "编辑标签" : "创建新标签"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          {editingTag
                            ? "修改标签信息以更好地组织您的内容"
                            : "输入网站URL自动获取网站信息，或手动填写标签详情"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-6">
                        {!editingTag && (
                          <div className="space-y-2">
                            <Label htmlFor="domain" className="text-sm font-medium text-slate-700">
                              快速添加 - 输入网站URL
                            </Label>
                            <div className="flex space-x-2">
                              <div className="relative flex-1">
                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                  id="domain"
                                  placeholder="例如: https://github.com 或 react.dev"
                                  className="pl-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                  onBlur={(e) => handleDomainInput(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleDomainInput(e.currentTarget.value)}
                                />
                              </div>
                              <div className="flex items-center">
                                {isLoadingWebsite && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                {fetchStatus === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {fetchStatus === "error" && <AlertCircle className="h-4 w-4 text-orange-500" />}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <span>输入URL后按回车或失去焦点自动获取网站信息</span>
                              {fetchStatus === "success" && <span className="text-green-600">• 获取成功</span>}
                              {fetchStatus === "error" && <span className="text-orange-600">• 使用默认信息</span>}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                            标签名称
                          </Label>
                          <div className="flex space-x-2">
                            {formData.favicon && (
                              <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                                <img
                                  src={formData.favicon || "/placeholder.svg"}
                                  alt="favicon"
                                  className="w-6 h-6"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=24&width=24&query=Website icon"
                                  }}
                                />
                              </div>
                            )}
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="输入标签名称"
                              className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* 图标管理 */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">标签图标</Label>
                          <Tabs value={iconMethod} onValueChange={(value) => setIconMethod(value as any)}>
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="auto" className="text-xs">
                                自动获取
                              </TabsTrigger>
                              <TabsTrigger value="upload" className="text-xs">
                                上传图片
                              </TabsTrigger>
                              <TabsTrigger value="url" className="text-xs">
                                图标链接
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="auto" className="space-y-3">
                              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                                <Globe className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-700">自动从网站获取图标</span>
                                {formData.url && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={refetchIcon}
                                    className="ml-auto h-6 px-2 text-blue-600 hover:text-blue-700"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    重新获取
                                  </Button>
                                )}
                              </div>
                            </TabsContent>

                            <TabsContent value="upload" className="space-y-3">
                              <div className="space-y-2">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="w-full rounded-xl border-dashed border-2 h-20 flex flex-col items-center justify-center space-y-2"
                                >
                                  <Upload className="h-5 w-5 text-slate-400" />
                                  <span className="text-sm text-slate-600">点击上传图片</span>
                                  <span className="text-xs text-slate-400">支持 JPG, PNG, GIF (最大2MB)</span>
                                </Button>
                                {uploadedIcon && (
                                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                                    <img
                                      src={uploadedIcon || "/placeholder.svg"}
                                      alt="uploaded"
                                      className="w-6 h-6 rounded"
                                    />
                                    <span className="text-sm text-green-700 flex-1">图片上传成功</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={clearIcon}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TabsContent>

                            <TabsContent value="url" className="space-y-3">
                              <div className="space-y-2">
                                <Input
                                  placeholder="输入图标URL地址"
                                  value={customIconUrl}
                                  onChange={(e) => handleCustomIconUrl(e.target.value)}
                                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <p className="text-xs text-slate-500">
                                  例如: https://example.com/icon.png 或使用 Emoji: 🚀
                                </p>
                                {customIconUrl && (
                                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                                    {customIconUrl.length <= 4 ? (
                                      <span className="text-lg">{customIconUrl}</span>
                                    ) : (
                                      <img
                                        src={customIconUrl || "/placeholder.svg"}
                                        alt="custom icon"
                                        className="w-6 h-6 rounded"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = "none"
                                        }}
                                      />
                                    )}
                                    <span className="text-sm text-green-700 flex-1">自定义图标已设置</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={clearIcon}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                            描述
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="输入标签描述"
                            rows={3}
                            className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                            分类
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="选择分类" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                              {categories.map((category) => (
                                <SelectItem key={category} value={category} className="rounded-lg">
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">主题颜色</Label>
                          <div className="grid grid-cols-4 gap-3">
                            {colors.map((color, index) => (
                              <button
                                key={index}
                                type="button"
                                className={`relative w-full h-12 rounded-xl ${color.bg} ${
                                  formData.color === index.toString()
                                    ? "ring-2 ring-offset-2 ring-slate-400 scale-105"
                                    : "hover:scale-105"
                                } transition-all duration-200 shadow-lg`}
                                onClick={() => setFormData({ ...formData, color: index.toString() })}
                              >
                                {formData.color === index.toString() && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="url" className="text-sm font-medium text-slate-700">
                            链接
                          </Label>
                          <Input
                            id="url"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://example.com"
                            className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-xl">
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                          />
                          <Label className="text-sm font-medium text-orange-700">
                            启用标签 {!formData.isActive && "(禁用后用户无法看到此标签)"}
                          </Label>
                        </div>
                      </div>
                      <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={resetForm} className="rounded-xl">
                          取消
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl"
                        >
                          {editingTag ? "更新标签" : "创建标签"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-xl">
                      <Shield className="h-4 w-4 mr-2" />
                      管理员登录
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>管理员登录</span>
                      </DialogTitle>
                      <DialogDescription>请输入管理员密码以访问高级功能</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">密码</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="输入管理员密码"
                          className="rounded-xl"
                          onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                        />
                      </div>
                      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                        <strong>演示密码:</strong> admin123
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)} className="rounded-xl">
                        取消
                      </Button>
                      <Button onClick={handleAdminLogin} className="rounded-xl">
                        登录
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                placeholder="搜索标签名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-slate-400" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-56 h-12 pl-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="all" className="rounded-lg">
                    所有分类
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="rounded-lg">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 热门标签 */}
        <div className="mb-10">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900">热门标签</h2>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              TOP 5
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularTags.map((tag, index) => {
              const colorClasses = getColorClasses(tag.color)
              return (
                <Card
                  key={tag.id}
                  className="group border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer hover:-translate-y-0.5"
                  onClick={() => handleTagClick(tag)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="relative">
                        <div className={`absolute inset-0 ${colorClasses.bg} rounded-lg blur opacity-20`} />
                        <div className="relative w-8 h-8 bg-white rounded-lg border flex items-center justify-center">
                          {tag.favicon ? (
                            tag.favicon.length <= 4 ? (
                              <span className="text-sm">{tag.favicon}</span>
                            ) : (
                              <img
                                src={tag.favicon || "/placeholder.svg"}
                                alt={tag.name}
                                className="w-5 h-5"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=20&width=20&query=Website icon"
                                }}
                              />
                            )
                          ) : (
                            <div className={`w-3 h-3 rounded-full ${colorClasses.bg}`} />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate text-sm">{tag.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`${colorClasses.light} ${colorClasses.text} border-0 text-xs px-2 py-0.5`}
                          >
                            {tag.category}
                          </Badge>
                          <span className="text-xs text-slate-500">#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate">{tag.clickCount} 次点击</span>
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Tags Grid */}
        {filteredTags.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden mb-10">
            <CardContent className="text-center py-16">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full blur opacity-50" />
                <div className="relative w-20 h-20 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full mx-auto flex items-center justify-center">
                  <Tag className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">没有找到标签</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {searchTerm || selectedCategory !== "all"
                  ? "尝试调整搜索条件或筛选器来找到您需要的标签"
                  : isAdmin
                    ? "开始创建您的第一个标签，让数字生活更有序！"
                    : "暂无可用标签，请联系管理员添加"}
              </p>
              {!searchTerm && selectedCategory === "all" && isAdmin && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  创建第一个标签
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredTags.map((tag) => {
              const colorClasses = getColorClasses(tag.color)
              return (
                <Card
                  key={tag.id}
                  className={`group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm rounded-2xl overflow-hidden hover:-translate-y-1 ${
                    tag.isActive ? "bg-white/80 cursor-pointer" : "bg-slate-100/80"
                  }`}
                  onClick={() => handleTagClick(tag)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="relative">
                          {tag.favicon ? (
                            <div className="w-10 h-10 bg-white rounded-xl border shadow-sm flex items-center justify-center">
                              {tag.favicon.length <= 4 ? (
                                <span className="text-lg">{tag.favicon}</span>
                              ) : (
                                <img
                                  src={tag.favicon || "/placeholder.svg"}
                                  alt={tag.name}
                                  className="w-6 h-6"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=24&width=24&query=Website icon"
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <div
                              className={`w-4 h-4 rounded-full ${colorClasses.bg} shadow-sm ${!tag.isActive ? "opacity-50" : ""}`}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle
                            className={`text-xl font-bold transition-colors ${
                              tag.isActive ? "text-slate-900 group-hover:text-slate-700" : "text-slate-500"
                            }`}
                          >
                            {tag.name}
                          </CardTitle>
                          {!tag.isActive && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs mt-1">
                              已禁用
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTagStatus(tag.id)
                            }}
                            className={`h-8 w-8 rounded-lg ${
                              tag.isActive
                                ? "hover:bg-red-50 hover:text-red-600"
                                : "hover:bg-green-50 hover:text-green-600"
                            }`}
                          >
                            {tag.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(tag)
                            }}
                            className="h-8 w-8 rounded-lg hover:bg-slate-100"
                          >
                            <Edit className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(tag.id)
                            }}
                            className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`w-fit ${colorClasses.light} ${colorClasses.text} border-0 rounded-lg px-3 py-1 font-medium ${
                        !tag.isActive ? "opacity-50" : ""
                      }`}
                    >
                      {tag.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription
                      className={`leading-relaxed ${tag.isActive ? "text-slate-600" : "text-slate-400"}`}
                    >
                      {tag.description}
                    </CardDescription>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                          {tag.clickCount} 次点击
                        </div>
                        {isAdmin && <Link className="h-3 w-3 text-orange-500" />}
                      </div>

                      <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                        {tag.createdAt.toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Stats - 移到底部 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-blue-700">总标签数</CardTitle>
                  <div className="text-3xl font-bold text-blue-900 mt-2">
                    {showInactive ? tags.length : activeTags.length}
                  </div>
                  {isAdmin && showInactive && (
                    <div className="text-xs text-blue-600 mt-1">
                      活跃: {activeTags.length} | 禁用: {tags.length - activeTags.length}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Hash className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-emerald-700">分类数量</CardTitle>
                  <div className="text-3xl font-bold text-emerald-900 mt-2">
                    {showInactive ? new Set(tags.map((tag) => tag.category)).size : activeCategories.size}
                  </div>
                </div>
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <Tag className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-purple-700">搜索结果</CardTitle>
                  <div className="text-3xl font-bold text-purple-900 mt-2">{filteredTags.length}</div>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Search className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
