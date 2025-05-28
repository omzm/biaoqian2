import HomeClient from "@/components/HomeClient"
import type { TagItem } from "@/types"

export const revalidate = 10

export default async function HomePage() {
  const res = await fetch("https://tag-manager-2025.vercel.app/api/tags", { next: { revalidate: 10 } })
  const tags: TagItem[] = await res.json()

  // 获取前 5 个点击最多的标签
  const popularTags = [...tags].sort((a, b) => b.clickcount - a.clickcount).slice(0, 5)

  return <HomeClient tags={tags} popularTags={popularTags} />
}
