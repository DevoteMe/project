import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class NotificationService {
  /**
   * Get user notifications
   * @param userId User ID
   * @param type Optional notification type
   * @param page Page number
   * @param limit Number of notifications per page
   */
  async getUserNotifications(userId: string, type?: string, page = 1, limit = 20): Promise<any> {
    try {
      const skip = (page - 1) * limit

      // Build where clause
      const where: any = {
        userId,
      }

      if (type) {
        where.type = type
      }

      // Get notifications
      const notifications = await prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      })

      // Get total count
      const totalCount = await prisma.notification.count({ where })

      // Get unread count
      const unreadCount = await prisma.notification.count({
        where: {
          ...where,
          isRead: false,
        },
      })

      return {
        notifications,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        unreadCount,
      }
    } catch (error) {
      console.error("Error getting user notifications:", error)
      throw new Error("Failed to get user notifications")
    }
  }

  /**
   * Mark notification as read
   * @param userId User ID
   * @param notificationId Notification ID
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      // Check if notification exists and belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      })

      if (!notification) {
        throw new Error("Notification not found")
      }

      // Mark as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
        },
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw new Error("Failed to mark notification as read")
    }
  }

  /**
   * Mark all notifications as read
   * @param userId User ID
   * @param type Optional notification type
   */
  async markAllAsRead(userId: string, type?: string): Promise<void> {
    try {
      // Build where clause
      const where: any = {
        userId,
        isRead: false,
      }

      if (type) {
        where.type = type
      }

      // Mark all as read
      await prisma.notification.updateMany({
        where,
        data: {
          isRead: true,
        },
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw new Error("Failed to mark all notifications as read")
    }
  }

  /**
   * Delete notification
   * @param userId User ID
   * @param notificationId Notification ID
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      // Check if notification exists and belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      })

      if (!notification) {
        throw new Error("Notification not found")
      }

      // Delete notification
      await prisma.notification.delete({
        where: { id: notificationId },
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw new Error("Failed to delete notification")
    }
  }
}

export const notificationService = new NotificationService()

