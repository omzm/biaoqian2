import { NextResponse } from "next/server"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await db.query("SELECT * FROM tags ORDER BY updatedAt DESC")
  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("收到标签数据:", data)

    const { id, name, description, category, color, url, favicon, isActive, clickCount, createdAt, updatedAt } = data

    await db.query(
      `INSERT INTO tags (id, name, description, category, color, url, favicon, isActive, clickCount, createdAt, updatedAt)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         name = $2, description = $3, category = $4, color = $5,
         url = $6, favicon = $7, isActive = $8, clickCount = $9, updatedAt = $11`,
      [id, name, description, category, color, url, favicon, isActive, clickCount, createdAt, updatedAt],
    )

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("写入数据库出错:", err)
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await db.query("DELETE FROM tags WHERE id = $1", [id])
    return NextResponse.json({ status: "deleted" })
  } catch (err) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 })
  }
}
