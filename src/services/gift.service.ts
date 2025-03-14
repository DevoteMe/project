import { PrismaClient } from "@prisma/client"
import { paymentService } from "./payment.service"

const prisma = new PrismaClient()

export class GiftService {
  /**
   * Get gift catalog
   */
  async getGiftCatalog(): Promise<any> {
    try {
      return await prisma.gift.findMany({
        where: {
          isActive: true,
        },
      })
    } catch (error) {
      console.error("Error getting gift catalog:", error)
      throw new Error("Failed to get gift catalog")
    }
  }

  /**
   * Send a gift to a user
   * @param userId User ID
   * @param creatorId Creator ID
   * @param giftId Gift ID
   * @param message Optional message
   */
  async sendGift(userId: string, creatorId: string, giftId: string, message?: string): Promise<any> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Check if creator exists
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
      })

      if (!creator) {
        throw new Error("Creator not found")
      }

      // Check if gift exists
      const gift = await prisma.gift.findUnique({
        where: { id: giftId },
      })

      if (!gift) {
        throw new Error("Gift not found")
      }

      // Process payment
      const transactionId = await paymentService.processOneTimePayment(
        userId,
        creatorId,
        Number(gift.price),
        "TIP", // Assuming TIP transaction type for gifts
        "stripe_customer_id", // Replace with actual Stripe customer ID
      )

      // Create gift purchase
      const giftPurchase = await prisma.giftPurchase.create({
        data: {
          giftId,
          userId,
          creatorId,
          amount: gift.price,
          transactionId,
          message,
        },
      })

      return {
        transactionId,
        message: "Payment processing initiated",
      }
    } catch (error) {
      console.error("Error sending gift:", error)
      throw new Error("Failed to send gift")
    }
  }

  /**
   * Get received gifts for a user
   * @param userId User ID
   */
  async getReceivedGifts(userId: string): Promise<any> {
    try {
      return await prisma.giftPurchase.findMany({
        where: {
          creatorId: userId,
        },
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
      })
    } catch (error) {
      console.error("Error getting received gifts:", error)
      throw new Error("Failed to get received gifts")
    }
  }

  /**
   * Get sent gifts for a user
   * @param userId User ID
   */
  async getSentGifts(userId: string): Promise<any> {
    try {
      return await prisma.giftPurchase.findMany({
        where: {
          userId,
        },
        include: {
          creator: {
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
      })
    } catch (error) {
      console.error("Error getting sent gifts:", error)
      throw new Error("Failed to get sent gifts")
    }
  }
}

export const giftService = new GiftService()

