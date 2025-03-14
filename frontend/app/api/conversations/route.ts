import { NextResponse } from "next/server"
import { currentUser } from "@/lib/auth"
import { generateMockConversations } from "@/lib/mock-data"

// GET /api/conversations - Get all conversations for the current user
export async function GET() {
  // Get current user
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // In a real app, fetch conversations from your database
  // For this demo, we'll use mock data
  const conversations = generateMockConversations(user)

  return NextResponse.json({ conversations })
}

// POST /api/conversations - Create a new conversation
export async function POST(request: Request) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userIds, type, name } = body

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid userIds" }, { status: 400 })
    }

    // Check if conversation type is valid
    if (type && !["direct", "group"].includes(type)) {
      return NextResponse.json({ error: "Invalid conversation type" }, { status: 400 })
    }

    // For a group conversation, name is required
    if (type === "group" && userIds.length > 1 && !name) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    // In a real app, create a conversation in your database
    // For this demo, we'll return a mock conversation
    const conversation = {
      id: `conv-${Date.now()}`,
      type: type || (userIds.length > 1 ? "group" : "direct"),
      name: name,
      members: [
        {
          userId: user.id,
          user: user,
          role: "admin",
          joinedAt: new Date().toISOString(),
        },
        ...userIds.map((userId: string) => ({
          userId,
          role: "member",
          joinedAt: new Date().toISOString(),
        })),
      ],
      lastMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
      isArchived: false,
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}

