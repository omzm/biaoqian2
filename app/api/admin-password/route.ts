import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    password: process.env.ADMIN_PASSWORD,
  })
}
