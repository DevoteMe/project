import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/creator/stats - Get creator dashboard stats
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get current date and first day of current month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total followers
    const totalFollowers = await prisma.follow.count({
      where: {
        followingId: session.user.id,
      },
    })

    // Get new followers this month
    const newFollowers = await prisma.follow.count({
      where: {
        followingId: session.user.id,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    })

    // Get user's posts
    const posts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
        published: true,
      },
      select: {
        id: true,
      },
    })

    const postIds = posts.map((post) => post.id)
    const totalPosts = postIds.length

    // Get engagement metrics (likes, comments, shares)
    const likes = await prisma.like.count({
      where: {
        postId: {
          in: postIds,
        },
      },
    })

    const comments = await prisma.comment.count({
      where: {
        postId: {
          in: postIds,
        },
      },
    })

    const shares = await prisma.share.count({
      where: {
        postId: {
          in: postIds,
        },
      },
    })

    const totalEngagement = likes + comments + shares

    // Calculate engagement rate
    const engagementRate = totalFollowers > 0 ? (totalEngagement / (totalFollowers * totalPosts)) * 100 : 0

    // Get total revenue
    const revenue = await prisma.transaction.aggregate({
      where: {
        creatorId: session.user.id,
        status: "completed",
      },
      _sum: {
        amount: true,
      },
    })

    const totalRevenue = revenue._sum.amount || 0

    return NextResponse.json({
      totalFollowers,
      newFollowers,
      totalEngagement,
      engagementRate,
      totalPosts,
      totalRevenue,
    })
  } catch (error) {
    console.error("Error fetching creator stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

