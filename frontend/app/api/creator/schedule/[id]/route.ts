import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/creator/schedule/[id] - Get a specific scheduled post
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const scheduledId = params.id

    const scheduledPost = await prisma.scheduledPost.findUnique({
      where: {
        id: scheduledId,
        authorId: session.user.id,
      },
    })

    if (!scheduledPost) {
      return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 })
    }

    return NextResponse.json({ scheduledPost })
  } catch (error) {
    console.error("Error fetching scheduled post:", error)
    return NextResponse.json({ error: "Failed to fetch scheduled post" }, { status: 500 })
  }
}

// PUT /api/creator/schedule/[id] - Update a scheduled post
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const scheduledId = params.id
    const data = await req.json()

    // Check if the scheduled post exists and belongs to the user
    const existingScheduled = await prisma.scheduledPost.findUnique({
      where: {
        id: scheduledId,
        authorId: session.user.id,
      },
    })

    if (!existingScheduled) {
      return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 })
    }

    // Validate the scheduled date is in the future
    if (data.scheduledFor) {
      const scheduledDate = new Date(data.scheduledFor)
      const now = new Date()

      if (scheduledDate <= now) {
        return NextResponse.json({ error: "Scheduled date must be in the future" }, { status: 400 })
      }
    }

    // Update the scheduled post
    const updatedScheduledPost = await prisma.scheduledPost.update({
      where: {
        id: scheduledId,
      },
      data: {
        title: data.title || existingScheduled.title,
        content: data.content || existingScheduled.content,
        scheduledFor: data.scheduledFor || existingScheduled.scheduledFor,
        timezone: data.timezone || existingScheduled.timezone,
        categoryId: data.categoryId || existingScheduled.categoryId,
        tags: data.tags || existingScheduled.tags,
        recurringPattern: data.recurringPattern || existingScheduled.recurringPattern,
        updatedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ scheduledPost: updatedScheduledPost })
  } catch (error) {
    console.error("Error updating scheduled post:", error)
    return NextResponse.json({ error: "Failed to update scheduled post" }, { status: 500 })
  }
}

// DELETE /api/creator/schedule/[id] - Delete a scheduled post
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const scheduledId = params.id

    // Check if the scheduled post exists and belongs to the user
    const existingScheduled = await prisma.scheduledPost.findUnique({
      where: {
        id: scheduledId,
        authorId: session.user.id,
      },
    })

    if (!existingScheduled) {
      return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 })
    }

    // Delete the scheduled post
    await prisma.scheduledPost.delete({
      where: {
        id: scheduledId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting scheduled post:", error)
    return NextResponse.json({ error: "Failed to delete scheduled post" }, { status: 500 })
  }
}

