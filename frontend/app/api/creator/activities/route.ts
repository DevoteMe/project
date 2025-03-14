import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/creator/activities - Get recent activities for the creator
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's posts
    const posts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
        published: true,
      },
      select: {
        id: true,
        title: true,
      },
    })

    const postIds = posts.map((post) => post.id)
    const postTitles = posts.reduce(
      (acc, post) => {
        acc[post.id] = post.title
        return acc
      },
      {} as Record<string, string>,
    )

    // Get recent follows
    const follows = await prisma.follow.findMany({
      where: {
        followingId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    const followActivities = follows.map((follow) => ({
      id: `follow-${follow.id}`,
      type: "follow" as const,
      user: follow.follower,
      timestamp: follow.createdAt,
    }))

    // Get recent likes
    const likes = await prisma.like.findMany({
      where: {
        postId: {
          in: postIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    const likeActivities = likes.map((like) => ({
      id: `like-${like.id}`,
      type: "like" as const,
      user: like.user,
      postId: like.postId,
      postTitle: postTitles[like.postId],
      timestamp: like.createdAt,
    }))

    // Get recent comments
    const comments = await prisma.comment.findMany({
      where: {
        postId: {
          in: postIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    const commentActivities = comments.map((comment) => ({
      id: `comment-${comment.id}`,
      type: "comment" as const,
      user: comment.user,
      postId: comment.postId,
      postTitle: postTitles[comment.postId],
      content: comment.content,
      timestamp: comment.createdAt,
    }))

    // Get recent shares
    const shares = await prisma.share.findMany({
      where: {
        postId: {
          in: postIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    const shareActivities = shares.map((share) => ({
      id: `share-${share.id}`,
      type: "share" as const,
      user: share.user,
      postId: share.postId,
      postTitle: postTitles[share.postId],
      timestamp: share.createdAt,
    }))

    // Get recent purchases
    const purchases = await prisma.transaction.findMany({
      where: {
        creatorId: session.user.id,
        status: "completed",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    const purchaseActivities = purchases.map((purchase) => ({
      id: `purchase-${purchase.id}`,
      type: "purchase" as const,
      user: purchase.user,
      timestamp: purchase.createdAt,
    }))

    // Combine all activities, sort by timestamp, and take the most recent 10
    const allActivities = [
      ...followActivities,
      ...likeActivities,
      ...commentActivities,
      ...shareActivities,
      ...purchaseActivities,
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({ activities: allActivities })
  } catch (error) {
    console.error("Error fetching creator activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

