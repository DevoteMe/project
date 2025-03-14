import { NextResponse } from "next/server"
import { currentUser } from "@/lib/auth"

// POST /api/conversations/:id/archive - Archive a conversation
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const conversationId = params.id

    // In a real app, archive the conversation in your database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error archiving conversation:", error)
    return NextResponse.json({ error: "Failed to archive conversation" }, { status: 500 })
  }
}

