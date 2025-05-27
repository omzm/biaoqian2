"use client"

import type React from "react"
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

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: any
  setFormData: (data: any) => void
  onSubmit: () => void
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
  editingTag: any
}

export function TagEditor(props: Props) {
  const {
    isOpen,
    onOpenChange,
    formData,
    setFormData,
    onSubmit,
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

        <div className="grid gap-6 py-6">
          {/* 标签名 */}
          <div className="space-y-2">
            <Label>标签名称</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入标签名称"
            />
          </div>

          {/* 图标选择 */}
          <div className="space-y-2">
            <Label>图标</Label>
            <Tabs value={iconMethod} onValueChange={(v) => setIconMethod(v as any)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="auto">自动</TabsTrigger>
                <TabsTrigger value="upload">上传</TabsTrigger>
                <TabsTrigger value="url">链接</TabsTrigger>
              </TabsList>

              <TabsContent value="auto">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">自动从网站获取图标</span>
                  <Button variant="ghost" size="sm" onClick={refetchIcon} className="ml-auto h-6 px-2 text-blue-600">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    重新获取
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-20 border-dashed border-2"
                >
                  <Upload className="h-5 w-5 text-slate-400" />
                  上传图标（PNG/JPG）
                </Button>
                {uploadedIcon && (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                    <img src={uploadedIcon || "/placeholder.svg"} className="w-6 h-6" alt="uploaded icon" />
                    <span className="text-sm text-green-700 flex-1">图片上传成功</span>
                    <Button type="button" variant="ghost" size="sm" onClick={clearIcon} className="text-red-500">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url">
                <Input
                  value={customIconUrl}
                  onChange={(e) => {
                    setCustomIconUrl(e.target.value)
                    setFormData({ ...formData, favicon: e.target.value })
                  }}
                  placeholder="https://example.com/icon.png"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="输入标签描述"
            />
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label>分类</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
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
                    formData.color === index.toString()
                      ? "ring-2 ring-offset-2 ring-slate-400 scale-105"
                      : "hover:scale-105"
                  } transition`}
                  onClick={() => setFormData({ ...formData, color: index.toString() })}
                />
              ))}
            </div>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label>链接</Label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          {/* 状态切换 */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
            />
            <span>启用标签</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={onSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
