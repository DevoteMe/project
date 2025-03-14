import { type NextRequest, NextResponse } from "next/server"
import type { AnalyticsData } from "@/services/analytics-service"

// Mock data generator for analytics
function generateMockAnalyticsData(period: string): AnalyticsData {
  // Generate dates based on period
  const dates: string[] = []
  const now = new Date()
  let numDays = 30

  switch (period) {
    case "day":
      numDays = 24 // 24 hours
      for (let i = 0; i < numDays; i++) {
        const date = new Date(now)
        date.setHours(date.getHours() - i)
        dates.unshift(date.toISOString())
      }
      break
    case "week":
      numDays = 7
      for (let i = 0; i < numDays; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        dates.unshift(date.toISOString())
      }
      break
    case "year":
      numDays = 12 // 12 months
      for (let i = 0; i < numDays; i++) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        dates.unshift(date.toISOString())
      }
      break
    default: // month
      numDays = 30
      for (let i = 0; i < numDays; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        dates.unshift(date.toISOString())
      }
  }

  // Generate random views data
  const viewsHistory = dates.map((date) => ({
    date,
    count: Math.floor(Math.random() * 1000) + 100,
  }))

  // Calculate total views
  const totalViews = viewsHistory.reduce((sum, item) => sum + item.count, 0)

  // Generate random engagement data
  const engagement = {
    likes: Math.floor(Math.random() * 5000) + 500,
    comments: Math.floor(Math.random() * 1000) + 100,
    shares: Math.floor(Math.random() * 500) + 50,
    saves: Math.floor(Math.random() * 300) + 30,
  }

  // Generate random audience data
  const audience = {
    totalFollowers: Math.floor(Math.random() * 10000) + 1000,
    newFollowers: Math.floor(Math.random() * 500) + 50,
    demographics: {
      ageGroups: [
        { label: "18-24", value: Math.floor(Math.random() * 30) + 10 },
        { label: "25-34", value: Math.floor(Math.random() * 30) + 20 },
        { label: "35-44", value: Math.floor(Math.random() * 20) + 10 },
        { label: "45-54", value: Math.floor(Math.random() * 15) + 5 },
        { label: "55+", value: Math.floor(Math.random() * 10) + 5 },
      ],
      genders: [
        { label: "Male", value: Math.floor(Math.random() * 60) + 40 },
        { label: "Female", value: Math.floor(Math.random() * 60) + 40 },
        { label: "Other", value: Math.floor(Math.random() * 10) + 1 },
      ],
      locations: [
        { country: "United States", count: Math.floor(Math.random() * 5000) + 1000 },
        { country: "United Kingdom", count: Math.floor(Math.random() * 2000) + 500 },
        { country: "Canada", count: Math.floor(Math.random() * 1000) + 300 },
        { country: "Australia", count: Math.floor(Math.random() * 800) + 200 },
        { country: "Germany", count: Math.floor(Math.random() * 600) + 100 },
        { country: "France", count: Math.floor(Math.random() * 500) + 100 },
        { country: "Other", count: Math.floor(Math.random() * 2000) + 500 },
      ],
    },
  }

  // Generate random revenue data
  const subscriptionRevenue = Math.floor(Math.random() * 5000) + 1000
  const spotSalesRevenue = Math.floor(Math.random() * 3000) + 500
  const tipsRevenue = Math.floor(Math.random() * 1000) + 100
  const totalRevenue = subscriptionRevenue + spotSalesRevenue + tipsRevenue

  const revenueHistory = dates.map((date) => ({
    date,
    amount: Math.floor(Math.random() * 500) + 50,
  }))

  // Generate random content performance data
  const topContent = Array(10)
    .fill(0)
    .map((_, i) => ({
      id: `post-${i + 1}`,
      title: `Content Title ${i + 1} - This is a longer title that might need truncation in the UI`,
      publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      views: Math.floor(Math.random() * 5000) + 100,
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 50,
        comments: Math.floor(Math.random() * 200) + 10,
        shares: Math.floor(Math.random() * 100) + 5,
        saves: Math.floor(Math.random() * 50) + 5,
      },
      conversionRate: Math.random() * 0.1, // 0-10%
    }))

  return {
    summary: {
      period: period as any,
      views: {
        total: totalViews,
        change: Math.floor(Math.random() * 40) - 20, // -20% to +20%
      },
      engagement: {
        total: engagement.likes + engagement.comments + engagement.shares + engagement.saves,
        change: Math.floor(Math.random() * 40) - 20,
      },
      followers: {
        total: audience.totalFollowers,
        change: Math.floor(Math.random() * 30) - 10,
      },
      revenue: {
        total: totalRevenue,
        change: Math.floor(Math.random() * 40) - 10,
      },
    },
    viewsHistory,
    engagement,
    audience,
    revenue: {
      totalRevenue,
      subscriptionRevenue,
      spotSalesRevenue,
      tipsRevenue,
      revenueHistory,
    },
    topContent,
  }
}

export async function GET(request: NextRequest) {
  // Get period from query params
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") || "month"

  // Generate mock data
  const data = generateMockAnalyticsData(period)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(data)
}

