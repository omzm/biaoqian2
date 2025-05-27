"use client"

import { useState, useRef, useEffect } from "react"
import { TagEditor } from "@/components/TagEditor"
import { TagList } from "@/components/TagList"
import type { TagItem } from "@/types"

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

export default function TagPage() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    category: "",
    color: "0",
    url: "",
    favicon: "",
    isActive: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingTag, setEditingTag] = useState<TagItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [iconMethod, setIconMethod] = useState("auto")
  const [customIconUrl, setCustomIconUrl] = useState("")
  const [uploadedIcon, setUploadedIcon] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchStatus = "idle"
  const isLoadingWebsite = false

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((tag: any) => ({
          ...tag,
          createdAt: new Date(tag.createdAt),
          updatedAt: new Date(tag.updatedAt),
        }))
        setTags(parsed)
      })
  }, [])

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
    setIconMethod("auto")
    setUploadedIcon(null)
    setCustomIconUrl("")
    if (fileInputRef.current) fileInputRef.current.value = ""
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

  const handleDelete = async (id: string) => {
    await fetch("/api/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setTags(tags.filter((tag) => tag.id !== id))
  }

  const handleEdit = (tag: TagItem) => {
    setEditingTag(tag)
    setFormData({ ...tag })
    setIsDialogOpen(true)
  }

  const handleTagClick = async (tag: TagItem) => {
    if (!tag.url) return
    const updated = { ...tag, clickCount: tag.clickCount + 1, updatedAt: new Date() }

    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })

    setTags(tags.map((t) => (t.id === tag.id ? updated : t)))
    window.open(tag.url, "_blank")
  }

  const toggleTagStatus = (id: string) => {
    setTags(tags.map((tag) => (tag.id === id ? { ...tag, isActive: !tag.isActive, updatedAt: new Date() } : tag)))
  }

  const getColorClasses = (colorIndex: string) => {
    return colors[Number.parseInt(colorIndex)] || colors[0]
  }

  const activeTags = tags.filter((tag) => tag.isActive)
  const popularTags = activeTags.sort((a, b) => b.clickCount - a.clickCount).slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto p-4">
      <TagEditor
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        fileInputRef={fileInputRef}
        iconMethod={iconMethod}
        setIconMethod={setIconMethod}
        uploadedIcon={uploadedIcon}
        customIconUrl={customIconUrl}
        setCustomIconUrl={setCustomIconUrl}
        clearIcon={() => {
          setFormData({ ...formData, favicon: "" })
          setCustomIconUrl("")
          setUploadedIcon(null)
        }}
        handleFileUpload={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => {
            const result = ev.target?.result as string
            setUploadedIcon(result)
            setFormData({ ...formData, favicon: result })
            setIconMethod("upload")
          }
          reader.readAsDataURL(file)
        }}
        refetchIcon={() => {
          if (formData.url) {
            const url = new URL(formData.url)
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`
            setFormData({ ...formData, favicon: faviconUrl })
          }
        }}
        categories={categories}
        colors={colors}
        fetchStatus={fetchStatus}
        isLoadingWebsite={isLoadingWebsite}
        editingTag={editingTag}
      />

      <TagList
        tags={tags}
        popularTags={popularTags}
        isAdmin={true}
        onClick={handleTagClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={toggleTagStatus}
        getColorClasses={getColorClasses}
      />
    </div>
  )
}
