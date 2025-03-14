import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient()

export class GDPRService {
  /**
   * Export user data in compliance with GDPR
   */
  async exportUserData(userId: string): Promise<{ success: boolean; filePath?: string; message?: string }> {
    try {
      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          posts: true,
          comments: true,
          subscriptions: true,
          followers: true,
          following: true,
          notifications: true,
        },
      })

      if (!user) {
        return {
          success: false,
          message: "User not found",
        }
      }

      // Create export directory if it doesn't exist
      const exportDir = path.join(__dirname, "../../exports")
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true })
      }

      // Generate unique filename
      const exportId = uuidv4()
      const exportPath = path.join(exportDir, `user_data_${exportId}.json`)

      // Prepare data for export (excluding sensitive fields)
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        profile: user.profile,
        posts: user.posts.map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })),
        comments: user.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          postId: comment.postId,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        })),
        subscriptions: user.subscriptions.map((sub) => ({
          id: sub.id,
          creatorId: sub.creatorId,
          startDate: sub.startDate,
          endDate: sub.endDate,
          status: sub.status,
        })),
        followers: user.followers.map((follower) => ({
          id: follower.id,
          followerId: follower.followerId,
          createdAt: follower.createdAt,
        })),
        following: user.following.map((following) => ({
          id: following.id,
          followingId: following.followingId,
          createdAt: following.createdAt,
        })),
        notifications: user.notifications.map((notification) => ({
          id: notification.id,
          type: notification.type,
          content: notification.content,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        })),
      }

      // Write data to file
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2))

      return {
        success: true,
        filePath: exportPath,
      }
    } catch (error) {
      console.error("Error exporting user data:", error)
      return {
        success: false,
        message: "An error occurred while exporting data",
      }
    }
  }

  /**
   * Delete user account and all associated data
   */
  async deleteUserAccount(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return {
          success: false,
          message: "User not found",
        }
      }

      // Delete user and all related data (Prisma will handle cascading deletes)
      await prisma.user.delete({
        where: { id: userId },
      })

      return {
        success: true,
        message: "Account deleted successfully",
      }
    } catch (error) {
      console.error("Error deleting user account:", error)
      return {
        success: false,
        message: "An error occurred while deleting account",
      }
    }
  }

  /**
   * Schedule account deletion (with grace period)
   */
  async scheduleAccountDeletion(userId: string, daysGracePeriod = 30): Promise<{ success: boolean; message: string }> {
    try {
      // Calculate deletion date
      const deletionDate = new Date()
      deletionDate.setDate(deletionDate.getDate() + daysGracePeriod)

      // Update user record with scheduled deletion date
      await prisma.user.update({
        where: { id: userId },
        data: {
          scheduledDeletionDate: deletionDate,
          status: "PENDING_DELETION",
        },
      })

      return {
        success: true,
        message: `Account scheduled for deletion on ${deletionDate.toISOString().split("T")[0]}`,
      }
    } catch (error) {
      console.error("Error scheduling account deletion:", error)
      return {
        success: false,
        message: "An error occurred while scheduling account deletion",
      }
    }
  }

  /**
   * Cancel scheduled account deletion
   */
  async cancelScheduledDeletion(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Update user record to remove scheduled deletion
      await prisma.user.update({
        where: { id: userId },
        data: {
          scheduledDeletionDate: null,
          status: "ACTIVE",
        },
      })

      return {
        success: true,
        message: "Scheduled account deletion has been canceled",
      }
    } catch (error) {
      console.error("Error canceling scheduled deletion:", error)
      return {
        success: false,
        message: "An error occurred while canceling scheduled deletion",
      }
    }
  }
}

