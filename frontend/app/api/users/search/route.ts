import { NextResponse } from "next/server"
import { currentUser } from "@/lib/auth"

// GET /api/users/search - Search for users
export async function GET(request: Request) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // In a real app, search for users in your database
    // For this demo, we'll return mock users
    const mockUsers = [
      {
        id: "user1",
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "user2",
        name: "Jane Smith",
        username: "janesmith",
        email: "jane@example.com",
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "user3",
        name: "Bob Johnson",
        username: "bobjohnson",
        email: "bob@example.com",
        image: "/placeholder.svg?height=40&width=40",
      },
    ]

    // Filter users by query
    const filteredUsers = mockUsers.filter(
      (mockUser) =>
        mockUser.name.toLowerCase().includes(query.toLowerCase()) ||
        mockUser.username.toLowerCase().includes(query.toLowerCase()),
    )

    return NextResponse.json({ users: filteredUsers })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
}

