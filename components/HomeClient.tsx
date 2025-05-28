"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import type { Tag } from "@prisma/client"

import { useSession } from "next-auth/react"
import { TagList } from "@/components/TagList"

interface HomeClientProps {
  tags: Tag[]
  popularTags: Tag[]
}

const HomeClient: React.FC<HomeClientProps> = ({ tags: initialTags, popularTags: initialPopularTags }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [filteredTags, setFilteredTags] = useState<Tag[]>(initialTags)
  const [searchTerm, setSearchTerm] = useState("")
  const [popularTags, setPopularTags] = useState<Tag[]>(initialPopularTags)

  const handleClick = (id: string) => {
    router.push(`/questions/tag/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/tags/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tags/${id}`, { method: "DELETE" })
      refreshTags()
      toast.success("Tag deleted")
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleToggle = async (id: string) => {
    const tag = tags.find((t) => t.id === id)
    if (!tag) return

    const updatedTag = { ...tag, isActive: !tag.isActive, updatedAt: new Date() }

    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTag),
    })

    refreshTags()
  }

  const refreshTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags")
      const tags = await res.json()
      setTags(tags)
      setFilteredTags(tags)
    } catch (error) {
      toast.error("Something went wrong")
    }
  }, [])

  useEffect(() => {
    refreshTags()
  }, [refreshTags])

  useEffect(() => {
    if (searchTerm) {
      const filtered = tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredTags(filtered)
    } else {
      setFilteredTags(tags)
    }
  }, [searchTerm, tags])

  const getColorClasses = (index: number) => {
    const colors = ["bg-red-100", "bg-green-100", "bg-blue-100", "bg-yellow-100", "bg-purple-100"]
    return colors[index % colors.length]
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tags..."
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <TagList
        tags={filteredTags}
        popularTags={popularTags}
        isAdmin={isAdmin}
        onClick={handleClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        getColorClasses={getColorClasses}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white shadow-md rounded-md p-4">
            <h3 className="text-lg font-semibold">Total Tags</h3>
            <p className="text-gray-600">{tags.length}</p>
          </div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h3 className="text-lg font-semibold">Popular Tags</h3>
            <p className="text-gray-600">{popularTags.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeClient
