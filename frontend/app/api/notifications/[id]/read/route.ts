import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // In a real app, this would update the notification in a database
  return NextResponse.json({ success: true })
}

