"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Upload, Globe, RefreshCw, X } from "lucide-react"

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
  createdAt: Date | null
  updatedAt: Date | null
}

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TagItem) => void
  onCancel: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  iconMethod: string
  setIconMethod: (value: string) => void
  uploadedIcon: string | null
  customIconUrl: string
  setCustomIconUrl: (url: string) => void
  clearIcon: () => void
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  refetchIcon: () => void
  categories: string[]
  colors: any[]
  fetchStatus: "idle" | "success" | "error"
  isLoadingWebsite: boolean
  editingTag: TagItem | null
}

export function TagEditor(props: Props) {
  const {
    isOpen,
    onOpenChange,
    onCancel,
    fileInputRef,
    iconMethod,
    setIconMethod,
    uploadedIcon,
    customIconUrl,
    setCustomIconUrl,
    clearIcon,
    handleFileUpload,
    refetchIcon,
    categories,
    colors,
    fetchStatus,
    isLoadingWebsite,
    editingTag,
  } = props

  const { register, handleSubmit, reset, setValue, watch } = useForm<TagItem>({
    defaultValues: {
      id: "",
      name: "",
      description: "",
      category: "",
      color: "0",
      url: "",
      favicon: "",
      isActive: true,
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const watchedValues = watch()

  // Reset form when editingTag changes
  useEffect(() => {
    if (editingTag) {
      reset(editingTag)
    } else {
      reset({
        id: "",
        name: "",
        description: "",
        category: "",
        color: "0",
        url: "",
        favicon: "",
        isActive: true,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }, [editingTag, reset])

  const onSubmit = (data: TagItem) => {
    props.onSubmit(data)
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  const handleCustomIconUrlChange = (url: string) => {
    setCustomIconUrl(url)
    setValue("favicon", url)
  }

  const handleFileUploadWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e)
    // The parent component will handle setting uploadedIcon,
    // and we'll use setValue to update the form
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setValue("favicon", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRefetchIcon = () => {
    refetchIcon()
    if (watchedValues.url) {
      const domain = watchedValues.url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      setValue("favicon", faviconUrl)
    }
  }

  const handleClearIcon = () => {
    clearIcon()
    setValue("favicon", "")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
            {editingTag ? "编辑标签" : "创建新标签"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {editingTag ? "修改标签信息以更好地组织您的内容" : "输入网站URL自动获取网站信息，或手动填写标签详情"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-6">
            {/* 标签名 */}
            <div className="space-y-2">
              <Label>标签名称</Label>
              <Input {...register("name")} placeholder="输入标签名称" />
            </div>

            {/* 图标选择 */}
            <div className="space-y-2">
              <Label>图标</Label>
              <Tabs value={iconMethod} onValueChange={(v) => setIconMethod(v as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="auto">自动</TabsTrigger>
                  <TabsTrigger value="url">链接</TabsTrigger>
                </TabsList>

                <TabsContent value="auto">
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">自动从网站获取图标</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefetchIcon}
                      className="ml-auto h-6 px-2 text-blue-600"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      重新获取
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="url">
                  <Input
                    value={customIconUrl}
                    onChange={(e) => handleCustomIconUrlChange(e.target.value)}
                    placeholder="https://example.com/icon.png"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea rows={3} {...register("description")} placeholder="输入标签描述" />
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <Label>分类</Label>
              <Select value={watchedValues.category} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 颜色选择 */}
            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`h-10 rounded-xl ${color.bg} ${
                      watchedValues.color === index.toString()
                        ? "ring-2 ring-offset-2 ring-slate-400 scale-105"
                        : "hover:scale-105"
                    } transition`}
                    onClick={() => setValue("color", index.toString())}
                  />
                ))}
              </div>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label>链接</Label>
              <Input {...register("url")} placeholder="https://example.com" />
            </div>

            {/* 状态切换 */}
            <div className="flex items-center space-x-2">
              <Switch checked={watchedValues.isActive} onCheckedChange={(val) => setValue("isActive", val)} />
              <span>启用标签</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
