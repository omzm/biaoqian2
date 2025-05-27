import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: Request) {
  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "缺少标签ID" }, { status: 400 })
  }

  await db.query(`UPDATE tags SET clickCount = clickCount + 1, updatedAt = NOW() WHERE id = $1`, [id])
  return NextResponse.json({ status: "ok" })
}
