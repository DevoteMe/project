import { axiosInstance } from "@/lib/axios"

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "all"

export type DashboardData = {
  summary: {
    totalViews: number
    totalFollowers: number
    totalLikes: number
    totalComments: number
    totalRevenue: number
  }
  viewsData: {
    labels: string[]
    data: number[]
  }
  engagementData: {
    labels: string[]
    likes: number[]
    comments: number[]
    shares: number[]
  }
  topPosts: {
    id: string
    title: string
    views: number
    likes: number
    comments: number
    conversionRate?: number
  }[]
  audienceData: {
    demographics: {
      age: {
        labels: string[]
        data: number[]
      }
      gender: {
        labels: string[]
        data: number[]
      }
      location: {
        country: string
        percentage: number
      }[]
    }
    devices: {
      labels: string[]
      data: number[]
    }
    referrers: {
      source: string
      visits: number
      percentage: number
    }[]
  }
  revenueData: {
    labels: string[]
    premium: number[]
    spots: number[]
    tips: number[]
  }
}

export async function getDashboardData(period: AnalyticsPeriod = "30d"): Promise<DashboardData> {
  try {
    const response = await axiosInstance.get(`/api/analytics/dashboard?period=${period}`)
    return response.data
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    // Return mock data for development
    return getMockDashboardData(period)
  }
}

export async function getContentAnalytics(contentId: string): Promise<any> {
  try {
    const response = await axiosInstance.get(`/api/analytics/content/${contentId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching content analytics for ${contentId}:`, error)
    // Return mock data
    return {
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 100),
      // Other metrics...
    }
  }
}

// Mock data for development purposes
function getMockDashboardData(period: AnalyticsPeriod): DashboardData {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365
  const labels = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - i - 1))
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })

  return {
    summary: {
      totalViews: 145789,
      totalFollowers: 8726,
      totalLikes: 42389,
      totalComments: 5872,
      totalRevenue: 3247.85,
    },
    viewsData: {
      labels,
      data: Array.from({ length: days }, () => Math.floor(Math.random() * 1000) + 500),
    },
    engagementData: {
      labels,
      likes: Array.from({ length: days }, () => Math.floor(Math.random() * 300) + 100),
      comments: Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 10),
      shares: Array.from({ length: days }, () => Math.floor(Math.random() * 30) + 5),
    },
    topPosts: [
      { id: "1", title: "My Journey as a Creator", views: 12547, likes: 843, comments: 127 },
      { id: "2", title: "Behind the Scenes", views: 8921, likes: 612, comments: 94, conversionRate: 5.2 },
      { id: "3", title: "Premium Content Preview", views: 7458, likes: 528, comments: 86, conversionRate: 7.8 },
      { id: "4", title: "Q&A Session Highlights", views: 6234, likes: 431, comments: 112 },
      { id: "5", title: "Special Announcement", views: 5987, likes: 398, comments: 73 },
    ],
    audienceData: {
      demographics: {
        age: {
          labels: ["18-24", "25-34", "35-44", "45-54", "55+"],
          data: [15, 32, 28, 18, 7],
        },
        gender: {
          labels: ["Male", "Female", "Other"],
          data: [48, 49, 3],
        },
        location: [
          { country: "United States", percentage: 42 },
          { country: "United Kingdom", percentage: 15 },
          { country: "Canada", percentage: 8 },
          { country: "Australia", percentage: 7 },
          { country: "Germany", percentage: 5 },
          { country: "Other", percentage: 23 },
        ],
      },
      devices: {
        labels: ["Mobile", "Desktop", "Tablet"],
        data: [64, 29, 7],
      },
      referrers: [
        { source: "Direct", visits: 42350, percentage: 35 },
        { source: "Social Media", visits: 36540, percentage: 30 },
        { source: "Search Engines", visits: 24210, percentage: 20 },
        { source: "External Links", visits: 12105, percentage: 10 },
        { source: "Other", visits: 6052, percentage: 5 },
      ],
    },
    revenueData: {
      labels,
      premium: Array.from({ length: days }, () => Math.floor(Math.random() * 60) + 20),
      spots: Array.from({ length: days }, () => Math.floor(Math.random() * 40) + 10),
      tips: Array.from({ length: days }, () => Math.floor(Math.random() * 20) + 5),
    },
  }
}

