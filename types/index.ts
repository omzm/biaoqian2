export interface TagItem {
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
