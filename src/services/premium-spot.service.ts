import { PrismaClient, TransactionType } from "@prisma/client"
import { adminService } from "./admin.service"
import { paymentService } from "./payment.service"

const prisma = new PrismaClient()

export class PremiumSpotService {
  /**
   * Get premium spot options
   */
  async getPremiumSpotOptions(): Promise<any> {
    try {
      const prices = await adminService.getSetting("premiumSpotPrices")

      if (!prices) {
        throw new Error("Premium spot prices not configured")
      }

      return {
        options: [
          { id: "3hours", name: "3 Hours", price: prices["3hours"], duration: 3 * 60 * 60 * 1000 },
          { id: "6hours", name: "6 Hours", price: prices["6hours"], duration: 6 * 60 * 60 * 1000 },
          { id: "12hours", name: "12 Hours", price: prices["12hours"], duration: 12 * 60 * 60 * 1000 },
          { id: "24hours", name: "24 Hours", price: prices["24hours"], duration: 24 * 60 * 60 * 1000 },
          { id: "3days", name: "3 Days", price: prices["3days"], duration: 3 * 24 * 60 * 60 * 1000 },
          { id: "1week", name: "1 Week", price: prices["1week"], duration: 7 * 24 * 60 * 60 * 1000 },
        ],
      }
    } catch (error) {
      console.error("Error getting premium spot options:", error)
      throw new Error("Failed to get premium spot options")
    }
  }

  /**
   * Purchase premium spot
   * @param userId User ID
   * @param categoryId Category ID
   * @param optionId Option ID
   */
  async purchasePremiumSpot(userId: string, categoryId: string, optionId: string): Promise<any> {
    try {
      // Check if user is a content creator
      const contentCreator = await prisma.contentCreator.findFirst({
        where: { userId },
      })

      if (!contentCreator) {
        throw new Error("User is not a content creator")
      }

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      // Get premium spot options
      const { options } = await this.getPremiumSpotOptions()
      const option = options.find((opt: any) => opt.id === optionId)

      if (!option) {
        throw new Error("Invalid option")
      }

      // Calculate start and end times
      const now = new Date()

      // Find the latest end time for this category
      const latestSpot = await prisma.premiumSpot.findFirst({
        where: { categoryId },
        orderBy: { endTime: "desc" },
      })

      const startTime = latestSpot && latestSpot.endTime > now ? new Date(latestSpot.endTime) : now

      const endTime = new Date(startTime.getTime() + option.duration)

      // Get user's Stripe customer ID
      // This should be retrieved from the user's record
      const stripeCustomerId = "stripe_customer_id"

      // Process payment
      const transactionId = await paymentService.processOneTimePayment(
        userId,
        "admin", // This should be the admin user ID
        option.price,
        TransactionType.PREMIUM_SPOT,
        stripeCustomerId,
      )

      // Create premium spot
      const premiumSpot = await prisma.premiumSpot.create({
        data: {
          creatorId: contentCreator.id,
          categoryId,
          startTime,
          endTime,
          price: option.price,
        },
      })

      return {
        id: premiumSpot.id,
        startTime,
        endTime,
        price: option.price,
        transactionId,
      }
    } catch (error) {
      console.error("Error purchasing premium spot:", error)
      throw new Error("Failed to purchase premium spot")
    }
  }

  /**
   * Get user's premium spots
   * @param userId User ID
   */
  async getUserPremiumSpots(userId: string): Promise<any> {
    try {
      // Check if user is a content creator
      const contentCreator = await prisma.contentCreator.findFirst({
        where: { userId },
      })

      if (!contentCreator) {
        throw new Error("User is not a content creator")
      }

      // Get premium spots
      return await prisma.premiumSpot.findMany({
        where: { creatorId: contentCreator.id },
        include: {
          category: true,
        },
        orderBy: { startTime: "desc" },
      })
    } catch (error) {
      console.error("Error getting user premium spots:", error)
      throw new Error("Failed to get user premium spots")
    }
  }
}

export const premiumSpotService = new PremiumSpotService()

