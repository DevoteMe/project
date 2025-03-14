import { type NextRequest, NextResponse } from "next/server"
import type { ContentPerformance } from "@/services/analytics-service"

export async function GET(request: NextRequest) {
  // Get query params
  const searchParams = request.nextUrl.searchParams
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const sortBy = searchParams.get("sortBy") || "views"

  // Generate mock data
  const data = generateMockContentData(limit)

  // Sort data based on sortBy parameter
  const sortedData = [...data]
  switch (sortBy) {
    case "views":
      sortedData.sort((a, b) => b.views - a.views)
      break
    case "engagement":
      sortedData.sort((a, b) => {
        const engagementA = a.engagement.likes + a.engagement.comments + a.engagement.shares + a.engagement.saves
        const engagementB = b.engagement.likes + b.engagement.comments + b.engagement.shares + b.engagement.saves
        return engagementB - engagementA
      })
      break
    case "revenue":
      sortedData.sort((a, b) => b.conversionRate - a.conversionRate)
      break
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(sortedData)
}

// Mock data generator for content performance
function generateMockContentData(limit: number): ContentPerformance[] {
  const contentTypes = [
    "How to",
    "Tutorial",
    "Review",
    "Guide",
    "Tips",
    "Showcase",
    "Behind the Scenes",
    "Q&A",
    "Interview",
    "Story",
  ]

  const topics = [
    "Photography",
    "Digital Art",
    "Writing",
    "Music Production",
    "Video Editing",
    "Cooking",
    "Fitness",
    "Fashion",
    "Makeup",
    "Travel",
  ]

  return Array(limit)
    .fill(0)
    .map((_, i) => {
      const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)]
      const topic = topics[Math.floor(Math.random() * topics.length)]

      return {
        id: `post-${i + 1}`,
        title: `${contentType}: ${topic} ${i + 1}`,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        views: Math.floor(Math.random() * 10000) + 100,
        engagement: {
          likes: Math.floor(Math.random() * 2000) + 50,
          comments: Math.floor(Math.random() * 500) + 10,
          shares: Math.floor(Math.random() * 300) + 5,
          saves: Math.floor(Math.random() * 200) + 5,
        },
        conversionRate: Math.random() * 0.15, // 0-15%
      }
    })
}

