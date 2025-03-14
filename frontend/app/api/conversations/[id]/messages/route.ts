import { NextResponse } from "next/server"
import { currentUser } from "@/lib/auth"
import { generateMockMessages } from "@/lib/mock-data"

// GET /api/conversations/:id/messages - Get messages for a conversation
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Get current user
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversationId = params.id

  // In a real app, fetch messages from your database
  // For this demo, we'll use mock data
  const messages = generateMockMessages(conversationId, user)

  return NextResponse.json({ messages })
}

// POST /api/conversations/:id/messages - Send a new message
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const conversationId = params.id
    const body = await request.json()
    const { content, attachments = [] } = body

    // Validate input
    if (!content && attachments.length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // In a real app, create a message in your database
    // For this demo, we'll return a mock message
    const message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      sender: user,
      content: content || "",
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readBy: [user.id],
      isDeleted: false,
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

