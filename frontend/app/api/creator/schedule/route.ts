import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"

// GET /api/creator/schedule - Get all scheduled posts for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const scheduledPosts = await prisma.scheduledPost.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        scheduledFor: "asc",
      },
    })

    return NextResponse.json({ scheduledPosts })
  } catch (error) {
    console.error("Error fetching scheduled posts:", error)
    return NextResponse.json({ error: "Failed to fetch scheduled posts" }, { status: 500 })
  }
}

// POST /api/creator/schedule - Create a new scheduled post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()

    // Validate scheduled date is in the future
    const scheduledDate = new Date(data.scheduledFor)
    const now = new Date()

    if (scheduledDate <= now) {
      return NextResponse.json({ error: "Scheduled date must be in the future" }, { status: 400 })
    }

    // Create the scheduled post
    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        id: uuidv4(),
        title: data.title,
        content: data.content,
        scheduledFor: scheduledDate.toISOString(),
        status: "scheduled",
        timezone: data.timezone || "UTC",
        categoryId: data.categoryId,
        tags: data.tags || [],
        recurringPattern: data.recurringPattern,
        author: {
          connect: {
            id: session.user.id,
          },
        },
      },
    })

    return NextResponse.json({ scheduledPost })
  } catch (error) {
    console.error("Error creating scheduled post:", error)
    return NextResponse.json({ error: "Failed to schedule post" }, { status: 500 })
  }
}

