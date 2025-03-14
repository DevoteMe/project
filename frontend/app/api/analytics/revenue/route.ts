import { type NextRequest, NextResponse } from "next/server"
import type { RevenueData } from "@/services/analytics-service"

export async function GET(request: NextRequest) {
  // Get period from query params
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") || "month"

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

  // Generate random revenue data
  const subscriptionRevenue = Math.floor(Math.random() * 5000) + 1000
  const spotSalesRevenue = Math.floor(Math.random() * 3000) + 500
  const tipsRevenue = Math.floor(Math.random() * 1000) + 100
  const totalRevenue = subscriptionRevenue + spotSalesRevenue + tipsRevenue

  const revenueHistory = dates.map((date) => ({
    date,
    amount: Math.floor(Math.random() * 500) + 50,
  }))

  const data: RevenueData = {
    totalRevenue,
    subscriptionRevenue,
    spotSalesRevenue,
    tipsRevenue,
    revenueHistory,
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(data)
}

