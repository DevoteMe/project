import { PrismaClient } from "@prisma/client"
import { paymentService } from "./payment.service"

const prisma = new PrismaClient()

export class SubscriptionService {
  /**
   * Subscribe to a content creator
   * @param userId User ID
   * @param creatorId Creator ID
   */
  async subscribe(userId: string, creatorId: string): Promise<any> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Check if creator exists and has a devotional price
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        include: {
          contentCreator: true,
        },
      })

      if (!creator || !creator.contentCreator) {
        throw new Error("Content creator not found")
      }

      if (!creator.contentCreator.devotionalPrice) {
        throw new Error("Content creator does not have a devotional price")
      }

      // Check if user is already subscribed
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          creatorId,
          status: "ACTIVE",
        },
      })

      if (existingSubscription) {
        throw new Error("Already subscribed to this creator")
      }

      // Get user's Stripe customer ID
      // This should be retrieved from the user's record
      const stripeCustomerId = "stripe_customer_id"

      // Create subscription
      const subscriptionId = await paymentService.createSubscription(
        userId,
        creatorId,
        Number(creator.contentCreator.devotionalPrice),
        stripeCustomerId,
      )

      // Update content creator stats
      await prisma.contentCreator.update({
        where: { userId: creatorId },
        data: {
          totalDevotees: { increment: 1 },
        },
      })

      // Create notification for creator
      await prisma.notification.create({
        data: {
          userId: creatorId,
          type: "DEVOTEE",
          content: "You have a new devotee",
          relatedUserId: userId,
        },
      })

      return { subscriptionId }
    } catch (error) {
      console.error("Error subscribing to creator:", error)
      throw new Error("Failed to subscribe to creator")
    }
  }

  /**
   * Cancel subscription
   * @param userId User ID
   * @param subscriptionId Subscription ID
   */
  async cancelSubscription(userId: string, subscriptionId: string): Promise<void> {
    try {
      // Check if subscription exists and belongs to user
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId,
          status: "ACTIVE",
        },
      })

      if (!subscription) {
        throw new Error("Subscription not found")
      }

      // Cancel subscription in Stripe
      // This should be implemented based on your Stripe integration

      // Update subscription status
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELED",
          endDate: new Date(),
        },
      })

      // Update content creator stats
      await prisma.contentCreator.update({
        where: { userId: subscription.creatorId },
        data: {
          totalDevotees: { decrement: 1 },
        },
      })

      // Create notification for creator
      await prisma.notification.create({
        data: {
          userId: subscription.creatorId,
          type: "DEVOTEE",
          content: "A devotee has canceled their subscription",
          relatedUserId: userId,
        },
      })
    } catch (error) {
      console.error("Error canceling subscription:", error)
      throw new Error("Failed to cancel subscription")
    }
  }

  /**
   * Get user's subscriptions
   * @param userId User ID
   */
  async getUserSubscriptions(userId: string): Promise<any> {
    try {
      return await prisma.subscription.findMany({
        where: {
          userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
              isOnline: true,
              lastSeen: true,
              contentCreator: {
                select: {
                  devotionalPrice: true,
                },
              },
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      })
    } catch (error) {
      console.error("Error getting user subscriptions:", error)
      throw new Error("Failed to get user subscriptions")
    }
  }

  /**
   * Get content creator's subscribers
   * @param creatorId Creator ID
   * @param page Page number
   * @param limit Number of subscribers per page
   */
  async getCreatorSubscribers(creatorId: string, page = 1, limit = 20): Promise<any> {
    try {
      const skip = (page - 1) * limit

      // Check if user is a content creator
      const creator = await prisma.contentCreator.findFirst({
        where: { userId: creatorId },
      })

      if (!creator) {
        throw new Error("User is not a content creator")
      }

      // Get subscribers
      const subscribers = await prisma.subscription.findMany({
        where: {
          creatorId,
          status: "ACTIVE",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
              country: true,
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
        skip,
        take: limit,
      })

      // Get total count
      const totalCount = await prisma.subscription.count({
        where: {
          creatorId,
          status: "ACTIVE",
        },
      })

      return {
        subscribers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      }
    } catch (error) {
      console.error("Error getting creator subscribers:", error)
      throw new Error("Failed to get creator subscribers")
    }
  }
}

export const subscriptionService = new SubscriptionService()

