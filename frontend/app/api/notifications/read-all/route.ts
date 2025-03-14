import { NextResponse } from "next/server"

export async function PUT() {
  // In a real app, this would update all notifications in a database
  return NextResponse.json({ success: true })
}

