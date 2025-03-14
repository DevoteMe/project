import { PrismaClient, type NotificationPreference } from "@prisma/client"

const prisma = new PrismaClient()

export class NotificationPreferenceService {
  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreference | null> {
    try {
      // Get existing preferences or create default
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      })

      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId)
      }

      return preferences
    } catch (error) {
      console.error("Error getting notification preferences:", error)
      return null
    }
  }

  /**
   * Create default notification preferences
   */
  async createDefaultPreferences(userId: string): Promise<NotificationPreference> {
    try {
      return await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          newFollower: true,
          newComment: true,
          newLike: true,
          newSubscriber: true,
          newMessage: true,
          contentUpdates: true,
          accountAlerts: true,
          marketingEmails: true,
        },
      })
    } catch (error) {
      console.error("Error creating default notification preferences:", error)
      throw error
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreference>,
  ): Promise<{ success: boolean; message?: string; data?: NotificationPreference }> {
    try {
      // Remove id and userId from update data
      const { id, userId: _, ...updateData } = preferences as any

      // Get existing preferences or create default
      let existingPreferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      })

      if (!existingPreferences) {
        existingPreferences = await this.createDefaultPreferences(userId)
      }

      // Update preferences
      const updatedPreferences = await prisma.notificationPreference.update({
        where: { id: existingPreferences.id },
        data: updateData,
      })

      return {
        success: true,
        data: updatedPreferences,
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error)
      return {
        success: false,
        message: "An error occurred while updating notification preferences",
      }
    }
  }

  /**
   * Check if a user should receive a specific notification type
   */
  async shouldSendNotification(
    userId: string,
    type: string,
    channel: "email" | "push" | "inApp" = "inApp",
  ): Promise<boolean> {
    try {
      const preferences = await this.getPreferences(userId)

      if (!preferences) {
        return true // Default to sending if no preferences found
      }

      // Check if the channel is enabled
      const channelEnabled =
        channel === "email"
          ? preferences.emailEnabled
          : channel === "push"
            ? preferences.pushEnabled
            : preferences.inAppEnabled

      if (!channelEnabled) {
        return false
      }

      // Check specific notification type
      switch (type) {
        case "NEW_FOLLOWER":
          return preferences.newFollower
        case "NEW_COMMENT":
          return preferences.newComment
        case "NEW_LIKE":
          return preferences.newLike
        case "NEW_SUBSCRIBER":
          return preferences.newSubscriber
        case "NEW_MESSAGE":
          return preferences.newMessage
        case "CONTENT_UPDATE":
          return preferences.contentUpdates
        case "ACCOUNT_ALERT":
          return preferences.accountAlerts
        case "MARKETING":
          return preferences.marketingEmails
        default:
          return true
      }
    } catch (error) {
      console.error("Error checking notification preferences:", error)
      return true // Default to sending if error
    }
  }
}

