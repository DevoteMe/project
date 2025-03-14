import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // In a real app, this would delete the notification from a database
  return NextResponse.json({ success: true })
}

