import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/creator/analytics/posts - Get post analytics
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

    // Get user's posts
    const posts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
        published: true,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    })

    // For each post, get analytics data
    const analytics = await Promise.all(
      posts.map(async (post) => {
        // Get views
        const views = await prisma.view.count({
          where: {
            postId: post.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        })

        // Get unique views
        const uniqueViews = await prisma.view.groupBy({
          by: ["userId"],
          where: {
            postId: post.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: true,
        })

        // Get likes
        const likes = await prisma.like.count({
          where: {
            postId: post.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        })

        // Get comments
        const comments = await prisma.comment.count({
          where: {
            postId: post.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        })

        // Get shares
        const shares = await prisma.share.count({
          where: {
            postId: post.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        })

        // Get bookmarks
        const bookmarks = await prisma.bookmark.count({
          where: {
            postId: post.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        })

        // Calculate average read time (mock data for now)
        const averageReadTime = Math.floor(Math.random() * 300) + 60 // 1-5 minutes in seconds

        // Calculate bounce rate (mock data for now)
        const bounceRate = Math.random() * 50 + 10 // 10-60%

        // Calculate clickthrough rate (mock data for now)
        const clickthroughRate = Math.random() * 20 + 5 // 5-25%

        return {
          postId: post.id,
          title: post.title,
          publishDate: post.createdAt,
          views,
          uniqueViews: uniqueViews.length,
          likes,
          comments,
          shares,
          bookmarks,
          averageReadTime,
          bounceRate,
          clickthroughRate,
        }
      }),
    )

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching post analytics:", error)
    return NextResponse.json({ error: "Failed to fetch post analytics" }, { status: 500 })
  }
}

