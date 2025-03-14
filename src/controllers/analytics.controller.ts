import type { Request, Response } from "express"
import { analyticsService } from "../services/analytics.service"
import { logger } from "../utils/logger"
import { contentService } from "../services/content.service"

class AnalyticsController {
  /**
   * Get dashboard analytics data
   */
  async getDashboardData(req: Request, res: Response) {
    try {
      const { period = "week" } = req.query
      const userId = req.user?.id

      // Check if user is admin or creator
      const isAdmin = req.user?.role === "admin"

      // Get analytics data based on user role
      let data

      if (isAdmin) {
        // Admin sees platform-wide analytics
        data = await this.getPlatformAnalytics(period as string)
      } else {
        // Creator sees their own analytics
        data = await this.getCreatorAnalytics(userId as string, period as string)
      }

      return res.status(200).json({
        status: "success",
        data,
      })
    } catch (error) {
      logger.error("Error getting dashboard analytics:", error)
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve analytics data",
        code: 500,
      })
    }
  }

  /**
   * Get analytics for specific content
   */
  async getContentAnalytics(req: Request, res: Response) {
    try {
      const { contentId } = req.params
      const { period = "week" } = req.query
      const userId = req.user?.id

      // Check if content exists and user has access
      const content = await contentService.getContentById(contentId)

      if (!content) {
        return res.status(404).json({
          status: "error",
          message: "Content not found",
          code: 404,
        })
      }

      // Check if user is admin or content creator
      const isAdmin = req.user?.role === "admin"
      const isCreator = content.creatorId === userId

      if (!isAdmin && !isCreator) {
        return res.status(403).json({
          status: "error",
          message: "You don't have permission to access this content's analytics",
          code: 403,
        })
      }

      // Get content analytics
      const data = await this.getContentAnalyticsData(contentId, period as string)

      return res.status(200).json({
        status: "success",
        data,
      })
    } catch (error) {
      logger.error("Error getting content analytics:", error)
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve content analytics",
        code: 500,
      })
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const isAdmin = req.user?.role === "admin"

      // Get real-time analytics
      const realTimeStats = await analyticsService.getRealTimeStats()

      // Filter data based on user role
      let data = realTimeStats

      if (!isAdmin) {
        // For creators, filter to only show their content
        // This would require additional logic in a real implementation
        data = {
          ...realTimeStats,
          // Filter to creator-specific data
        }
      }

      return res.status(200).json({
        status: "success",
        data,
      })
    } catch (error) {
      logger.error("Error getting real-time analytics:", error)
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve real-time analytics",
        code: 500,
      })
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(req: Request, res: Response) {
    try {
      const { startDate, endDate, type = "users" } = req.query

      // Validate date format
      if (startDate && !this.isValidDateFormat(startDate as string)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid startDate format. Use YYYY-MM-DD",
          code: 400,
        })
      }

      if (endDate && !this.isValidDateFormat(endDate as string)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid endDate format. Use YYYY-MM-DD",
          code: 400,
        })
      }

      // Generate CSV data based on type
      let csvData: string

      switch (type) {
        case "users":
          csvData = await this.generateUsersCsv(startDate as string, endDate as string)
          break
        case "content":
          csvData = await this.generateContentCsv(startDate as string, endDate as string)
          break
        case "subscriptions":
          csvData = await this.generateSubscriptionsCsv(startDate as string, endDate as string)
          break
        case "payments":
          csvData = await this.generatePaymentsCsv(startDate as string, endDate as string)
          break
        default:
          return res.status(400).json({
            status: "error",
            message: "Invalid export type",
            code: 400,
          })
      }

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=analytics-${type}-${new Date().toISOString().split("T")[0]}.csv`,
      )

      return res.send(csvData)
    } catch (error) {
      logger.error("Error exporting analytics data:", error)
      return res.status(500).json({
        status: "error",
        message: "Failed to export analytics data",
        code: 500,
      })
    }
  }

  /**
   * Helper methods
   */

  private async getPlatformAnalytics(period: string) {
    // In a real implementation, this would query the database or analytics service
    // For now, we'll return mock data
    return {
      users: {
        total: 1000,
        new: 50,
        active: 300,
        growth: 5.2,
      },
      content: {
        total: 500,
        new: 25,
        views: 10000,
        engagement: 7.8,
      },
      subscriptions: {
        total: 800,
        new: 30,
        cancelled: 10,
        revenue: 15000,
      },
      topCreators: [
        { id: "creator1", name: "Creator 1", subscribers: 200, revenue: 5000 },
        { id: "creator2", name: "Creator 2", subscribers: 150, revenue: 3500 },
        { id: "creator3", name: "Creator 3", subscribers: 100, revenue: 2000 },
      ],
      topContent: [
        { id: "content1", title: "Content 1", views: 1000, engagement: 8.5 },
        { id: "content2", title: "Content 2", views: 800, engagement: 7.9 },
        { id: "content3", title: "Content 3", views: 600, engagement: 8.2 },
      ],
    }
  }

  private async getCreatorAnalytics(creatorId: string, period: string) {
    // In a real implementation, this would query the database or analytics service
    // For now, we'll return mock data
    return {
      subscribers: {
        total: 200,
        new: 15,
        cancelled: 5,
        growth: 5.0,
      },
      content: {
        total: 50,
        new: 3,
        views: 5000,
        engagement: 7.5,
      },
      revenue: {
        total: 5000,
        subscriptions: 4000,
        gifts: 1000,
        growth: 8.2,
      },
      topContent: [
        { id: "content1", title: "Content 1", views: 1000, engagement: 8.5 },
        { id: "content2", title: "Content 2", views: 800, engagement: 7.9 },
        { id: "content3", title: "Content 3", views: 600, engagement: 8.2 },
      ],
    }
  }

  private async getContentAnalyticsData(contentId: string, period: string) {
    // In a real implementation, this would query the database or analytics service
    // For now, we'll return mock data
    return {
      views: {
        total: 1000,
        unique: 800,
        returning: 200,
        growth: 5.5,
      },
      engagement: {
        likes: 150,
        comments: 50,
        shares: 30,
        avgTimeSpent: "3:45",
      },
      demographics: {
        ageGroups: [
          { group: "18-24", percentage: 25 },
          { group: "25-34", percentage: 40 },
          { group: "35-44", percentage: 20 },
          { group: "45+", percentage: 15 },
        ],
        genders: [
          { gender: "Male", percentage: 60 },
          { gender: "Female", percentage: 35 },
          { gender: "Other", percentage: 5 },
        ],
      },
      viewsOverTime: [
        { date: "2023-01-01", views: 100 },
        { date: "2023-01-02", views: 120 },
        { date: "2023-01-03", views: 150 },
        { date: "2023-01-04", views: 130 },
        { date: "2023-01-05", views: 180 },
      ],
    }
  }

  private isValidDateFormat(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    return regex.test(dateString)
  }

  private async generateUsersCsv(startDate: string, endDate: string): Promise<string> {
    // In a real implementation, this would query the database
    // For now, we'll return mock CSV data
    return `id,username,email,registrationDate,lastLoginDate,role,status
1,user1,user1@example.com,2023-01-01,2023-01-15,subscriber,active
2,user2,user2@example.com,2023-01-02,2023-01-14,subscriber,active
3,user3,user3@example.com,2023-01-03,2023-01-13,creator,active
4,user4,user4@example.com,2023-01-04,2023-01-12,subscriber,inactive
5,user5,user5@example.com,2023-01-05,2023-01-11,subscriber,active`
  }

  private async generateContentCsv(startDate: string, endDate: string): Promise<string> {
    // In a real implementation, this would query the database
    // For now, we'll return mock CSV data
    return `id,title,creatorId,creationDate,views,likes,comments,shares
1,Content 1,3,2023-01-01,1000,150,50,30
2,Content 2,3,2023-01-02,800,120,40,25
3,Content 3,6,2023-01-03,600,100,30,20
4,Content 4,6,2023-01-04,500,80,25,15
5,Content 5,9,2023-01-05,400,60,20,10`
  }

  private async generateSubscriptionsCsv(startDate: string, endDate: string): Promise<string> {
    // In a real implementation, this would query the database
    // For now, we'll return mock CSV data
    return `id,userId,creatorId,startDate,endDate,status,plan,amount
1,1,3,2023-01-01,2023-02-01,active,monthly,10.00
2,2,3,2023-01-02,2023-02-02,active,monthly,10.00
3,4,6,2023-01-03,2023-02-03,active,monthly,15.00
4,5,6,2023-01-04,2023-02-04,active,monthly,15.00
5,1,9,2023-01-05,2023-02-05,active,monthly,20.00`
  }

  private async generatePaymentsCsv(startDate: string, endDate: string): Promise<string> {
    // In a real implementation, this would query the database
    // For now, we'll return mock CSV data
    return `id,userId,creatorId,date,amount,currency,type,status,paymentMethod
1,1,3,2023-01-01,10.00,USD,subscription,succeeded,card
2,2,3,2023-01-02,10.00,USD,subscription,succeeded,card
3,4,6,2023-01-03,15.00,USD,subscription,succeeded,paypal
4,5,6,2023-01-04,15.00,USD,subscription,succeeded,card
5,1,9,2023-01-05,20.00,USD,subscription,succeeded,card`
  }
}

export const analyticsController = new AnalyticsController()

