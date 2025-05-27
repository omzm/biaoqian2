"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "@/components/ui/card"
import { TrendingUp, Eye, EyeOff, Edit, Trash2, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TagItem } from "@/types"

interface Props {
  tags: TagItem[]
  popularTags: TagItem[]
  isAdmin: boolean
  onClick: (tag: TagItem) => void
  onEdit: (tag: TagItem) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  getColorClasses: (index: string) => any
}

export function TagList({ tags, popularTags, isAdmin, onClick, onEdit, onDelete, onToggle, getColorClasses }: Props) {
  const activeTags = tags.filter((tag) => tag.isActive)

  return (
    <>
      {/* 热门标签 */}
      <div className="mb-10">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-slate-900">热门标签</h2>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            TOP 5
          </Badge>
        </div>
        {popularTags.length === 0 ? (
          <p className="text-sm text-slate-400">暂无热门标签</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularTags.map((tag, index) => {
              const color = getColorClasses(tag.color)
              return (
                <Card
                  key={tag.id}
                  onClick={() => onClick(tag)}
                  className="group cursor-pointer bg-white/80 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="relative">
                        <div className={`absolute inset-0 ${color.bg} blur rounded-lg opacity-20`} />
                        <div className="relative w-8 h-8 bg-white rounded-lg border flex items-center justify-center">
                          {tag.favicon?.length <= 4 ? (
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
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">{tag.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`${color.light} ${color.text} border-0 text-xs px-2 py-0.5`}
                          >
                            {tag.category}
                          </Badge>
                          <span className="text-xs text-slate-500">#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>{tag.clickCount} 次点击</span>
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* 主标签列表 */}
      {tags.length === 0 ? (
        <div className="text-center py-10 text-slate-400">暂无标签，请添加</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {tags.map((tag) => {
            const colorClasses = getColorClasses(tag.color)
            return (
              <Card
                key={tag.id}
                className={`group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm rounded-2xl overflow-hidden hover:-translate-y-1 ${
                  tag.isActive ? "bg-white/80 cursor-pointer" : "bg-slate-100/80"
                }`}
                onClick={() => onClick(tag)}
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
                            onToggle(tag.id)
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
                            onEdit(tag)
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
                            onDelete(tag.id)
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
                  <CardDescription className={`leading-relaxed ${tag.isActive ? "text-slate-600" : "text-slate-400"}`}>
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
                      <span className="text-xs text-slate-500">
                        {tag.createdAt instanceof Date && !isNaN(tag.createdAt.getTime())
                          ? tag.createdAt.toLocaleDateString("zh-CN")
                          : "未知时间"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
