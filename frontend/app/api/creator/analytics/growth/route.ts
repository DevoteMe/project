import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns"

// GET /api/creator/analytics/growth - Get growth trends
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(req.url)
    const start = url.searchParams.get("start")
    const end = url.searchParams.get("end")

    if (!start || !end) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 })
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    // Get all months in the range
    const months = eachMonthOfInterval({
      start: startDate,
      end: endDate,
    })

    // Get growth trends for each month
    const trends = await Promise.all(
      months.map(async (month) => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        // Get new followers for the month
        const followers = await prisma.follow.count({
          where: {
            followingId: session.user.id,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
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

        // Get engagement metrics (likes, comments, shares)
        const likes = await prisma.like.count({
          where: {
            postId: {
              in: postIds,
            },
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        })

        const comments = await prisma.comment.count({
          where: {
            postId: {
              in: postIds,
            },
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        })

        const shares = await prisma.share.count({
          where: {
            postId: {
              in: postIds,
            },
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        })

        const engagement = likes + comments + shares

        // Get revenue for the month
        const revenue = await prisma.transaction.aggregate({
          where: {
            creatorId: session.user.id,
            status: "completed",
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        })

        return {
          period: format(month, "MMM yyyy"),
          followers,
          engagement,
          revenue: revenue._sum.amount || 0,
        }
      }),
    )

    return NextResponse.json({ trends })
  } catch (error) {
    console.error("Error fetching growth trends:", error)
    return NextResponse.json({ error: "Failed to fetch growth trends" }, { status: 500 })
  }
}

