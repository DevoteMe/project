import { NextResponse } from "next/server"
import { currentUser } from "@/lib/auth"

// DELETE /api/messages/:id - Delete a message
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const messageId = params.id

    // In a real app, delete or mark the message as deleted in your database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}

