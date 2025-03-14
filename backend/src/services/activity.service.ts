import { PrismaClient, type UserActivity } from "@prisma/client"

const prisma = new PrismaClient()

export class ActivityService {
  /**
   * Log user activity
   */
  async logActivity(
    userId: string,
    type: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any,
  ): Promise<UserActivity> {
    try {
      return await prisma.userActivity.create({
        data: {
          userId,
          type,
          ipAddress,
          userAgent,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      })
    } catch (error) {
      console.error("Error logging user activity:", error)
      throw error
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(
    userId: string,
    page = 1,
    limit = 20,
    type?: string,
  ): Promise<{ activities: UserActivity[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit

      // Build where clause
      const where: any = { userId }
      if (type) {
        where.type = type
      }

      // Get total count
      const total = await prisma.userActivity.count({ where })

      // Get activities
      const activities = await prisma.userActivity.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      })

      return {
        activities,
        total,
        pages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error("Error getting user activity:", error)
      throw error
    }
  }

  /**
   * Get recent login history
   */
  async getLoginHistory(userId: string, limit = 5): Promise<UserActivity[]> {
    try {
      return await prisma.userActivity.findMany({
        where: {
          userId,
          type: "LOGIN",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      })
    } catch (error) {
      console.error("Error getting login history:", error)
      throw error
    }
  }

  /**
   * Clear user activity history
   */
  async clearActivityHistory(
    userId: string,
    olderThan?: Date,
  ): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const where: any = { userId }

      if (olderThan) {
        where.createdAt = {
          lt: olderThan,
        }
      }

      const { count } = await prisma.userActivity.deleteMany({ where })

      return {
        success: true,
        message: `Successfully cleared ${count} activity records`,
        count,
      }
    } catch (error) {
      console.error("Error clearing activity history:", error)
      return {
        success: false,
        message: "An error occurred while clearing activity history",
      }
    }
  }
}

