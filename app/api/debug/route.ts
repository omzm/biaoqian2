import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const now = new Date()
  await db.query(
    `INSERT INTO tags (id, name, description, category, color, isActive, clickCount, createdAt, updatedAt)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    ["test-001", "测试标签", "这是一个测试", "技术", "1", true, 0, now, now],
  )
  return NextResponse.json({ status: "inserted test-001" })
}
