import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"

// POST /api/creator/schedule/[id]/publish - Publish a scheduled post immediately
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const scheduledId = params.id

    // Find the scheduled post
    const scheduledPost = await prisma.scheduledPost.findUnique({
      where: {
        id: scheduledId,
        authorId: session.user.id,
      },
    })

    if (!scheduledPost) {
      return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 })
    }

    // Create a new post from the scheduled post data
    const post = await prisma.post.create({
      data: {
        id: uuidv4(),
        title: scheduledPost.title,
        content: scheduledPost.content,
        published: true,
        categoryId: scheduledPost.categoryId,
        tags: scheduledPost.tags,
        author: {
          connect: {
            id: session.user.id,
          },
        },
      },
    })

    // Update the scheduled post to indicate it has been published
    await prisma.scheduledPost.update({
      where: {
        id: scheduledId,
      },
      data: {
        status: "published",
        postId: post.id,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Error publishing scheduled post:", error)
    return NextResponse.json({ error: "Failed to publish post" }, { status: 500 })
  }
}

