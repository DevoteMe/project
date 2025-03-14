import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { paymentService } from "../services/payment-service"
import { userService } from "../services/user-service"
import { notificationService } from "../services/notification-service"

export const subscriptionController = {
  // Creator subscription tier management
  async getCreatorTiers(req: Request, res: Response) {
    try {
      const userId = req.user.id

      const tiers = await prisma.subscriptionTier.findMany({
        where: {
          creatorId: userId,
        },
        include: {
          _count: {
            select: {
              subscriptions: {
                where: {
                  status: "active",
                },
              },
            },
          },
        },
        orderBy: {
          price: "asc",
        },
      })

      const formattedTiers = tiers.map((tier) => ({
        ...tier,
        currentSubscribers: tier._count.subscriptions,
        _count: undefined,
      }))

      return res.status(200).json(formattedTiers)
    } catch (error) {
      console.error("Error fetching creator tiers:", error)
      return res.status(500).json({ error: "Failed to fetch subscription tiers" })
    }
  },

  async createTier(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { name, description, price, billingPeriod, features, color, isDefault, isPublic, maxSubscribers } = req.body

      // Validate creator status
      const isCreator = await userService.isUserCreator(userId)
      if (!isCreator) {
        return res.status(403).json({ error: "Only creators can create subscription tiers" })
      }

      // If this tier is set as default, update other tiers
      if (isDefault) {
        await prisma.subscriptionTier.updateMany({
          where: {
            creatorId: userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        })
      }

      const tier = await prisma.subscriptionTier.create({
        data: {
          creatorId: userId,
          name,
          description,
          price: Number.parseFloat(price),
          billingPeriod,
          features,
          color,
          isDefault: isDefault || false,
          isPublic: isPublic !== false, // Default to true if not specified
          maxSubscribers,
        },
      })

      return res.status(201).json(tier)
    } catch (error) {
      console.error("Error creating subscription tier:", error)
      return res.status(500).json({ error: "Failed to create subscription tier" })
    }
  },

  async updateTier(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { tierId } = req.params
      const { name, description, price, billingPeriod, features, color, isDefault, isPublic, maxSubscribers } = req.body

      // Verify tier ownership
      const existingTier = await prisma.subscriptionTier.findUnique({
        where: {
          id: tierId,
        },
      })

      if (!existingTier) {
        return res.status(404).json({ error: "Subscription tier not found" })
      }

      if (existingTier.creatorId !== userId) {
        return res.status(403).json({ error: "You do not have permission to update this tier" })
      }

      // If this tier is set as default, update other tiers
      if (isDefault) {
        await prisma.subscriptionTier.updateMany({
          where: {
            creatorId: userId,
            isDefault: true,
            id: {
              not: tierId,
            },
          },
          data: {
            isDefault: false,
          },
        })
      }

      const updatedTier = await prisma.subscriptionTier.update({
        where: {
          id: tierId,
        },
        data: {
          name,
          description,
          price: price !== undefined ? Number.parseFloat(price) : undefined,
          billingPeriod,
          features,
          color,
          isDefault,
          isPublic,
          maxSubscribers,
        },
      })

      return res.status(200).json(updatedTier)
    } catch (error) {
      console.error("Error updating subscription tier:", error)
      return res.status(500).json({ error: "Failed to update subscription tier" })
    }
  },

  async deleteTier(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { tierId } = req.params

      // Verify tier ownership
      const existingTier = await prisma.subscriptionTier.findUnique({
        where: {
          id: tierId,
        },
      })

      if (!existingTier) {
        return res.status(404).json({ error: "Subscription tier not found" })
      }

      if (existingTier.creatorId !== userId) {
        return res.status(403).json({ error: "You do not have permission to delete this tier" })
      }

      // Check if tier has active subscribers
      const activeSubscribers = await prisma.subscription.count({
        where: {
          tierId,
          status: "active",
        },
      })

      if (activeSubscribers > 0) {
        return res.status(400).json({
          error: "Cannot delete tier with active subscribers",
          activeSubscribers,
        })
      }

      await prisma.subscriptionTier.delete({
        where: {
          id: tierId,
        },
      })

      return res.status(200).json({ message: "Subscription tier deleted successfully" })
    } catch (error) {
      console.error("Error deleting subscription tier:", error)
      return res.status(500).json({ error: "Failed to delete subscription tier" })
    }
  },

  // Subscriber management
  async getCreatorSubscribers(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { status, tierId, page = 1, limit = 20 } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      const whereClause: any = {
        creatorId: userId,
      }

      if (status) {
        whereClause.status = status
      }

      if (tierId) {
        whereClause.tierId = tierId
      }

      const subscribers = await prisma.subscription.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          tier: true,
        },
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: "desc",
        },
      })

      const total = await prisma.subscription.count({
        where: whereClause,
      })

      return res.status(200).json({
        subscribers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      return res.status(500).json({ error: "Failed to fetch subscribers" })
    }
  },

  async getCreatorSubscriptionStats(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { period = "month" } = req.query

      // Get total subscribers
      const totalSubscribers = await prisma.subscription.count({
        where: {
          creatorId: userId,
          status: "active",
        },
      })

      // Get total revenue
      const subscriptions = await prisma.subscription.findMany({
        where: {
          creatorId: userId,
          status: "active",
        },
        include: {
          tier: true,
        },
      })

      const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.tier.price, 0)

      // Get tier distribution
      const tiers = await prisma.subscriptionTier.findMany({
        where: {
          creatorId: userId,
        },
        include: {
          _count: {
            select: {
              subscriptions: {
                where: {
                  status: "active",
                },
              },
            },
          },
        },
      })

      const tierDistribution = tiers.map((tier) => ({
        tierId: tier.id,
        tierName: tier.name,
        subscriberCount: tier._count.subscriptions,
        percentage: totalSubscribers > 0 ? (tier._count.subscriptions / totalSubscribers) * 100 : 0,
      }))

      // Get revenue by period
      const now = new Date()
      const revenueByPeriod = []

      if (period === "week") {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const dayStr = date.toISOString().split("T")[0]

          revenueByPeriod.push({
            period: dayStr,
            amount: 0, // Will be calculated below
          })
        }
      } else {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now)
          date.setMonth(date.getMonth() - i)
          const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

          revenueByPeriod.push({
            period: monthStr,
            amount: 0, // Will be calculated below
          })
        }
      }

      // Calculate retention rate (simplified)
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      const subscribersOneMonthAgo = await prisma.subscription.count({
        where: {
          creatorId: userId,
          status: "active",
          createdAt: {
            lt: oneMonthAgo,
          },
        },
      })

      const stillSubscribed = await prisma.subscription.count({
        where: {
          creatorId: userId,
          status: "active",
          createdAt: {
            lt: oneMonthAgo,
          },
        },
      })

      const retentionRate = subscribersOneMonthAgo > 0 ? (stillSubscribed / subscribersOneMonthAgo) * 100 : 100

      return res.status(200).json({
        totalSubscribers,
        totalRevenue,
        activeSubscriptions: totalSubscribers,
        tierDistribution,
        revenueByPeriod,
        retentionRate,
      })
    } catch (error) {
      console.error("Error fetching subscription stats:", error)
      return res.status(500).json({ error: "Failed to fetch subscription statistics" })
    }
  },

  // User subscription management
  async getUserSubscriptions(req: Request, res: Response) {
    try {
      const userId = req.user.id

      const subscriptions = await prisma.subscription.findMany({
        where: {
          userId,
        },
        include: {
          tier: true,
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return res.status(200).json(subscriptions)
    } catch (error) {
      console.error("Error fetching user subscriptions:", error)
      return res.status(500).json({ error: "Failed to fetch subscriptions" })
    }
  },

  async createSubscription(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { creatorId, tierId } = req.params
      const { paymentMethodId } = req.body

      // Verify tier exists and is public
      const tier = await prisma.subscriptionTier.findFirst({
        where: {
          id: tierId,
          creatorId,
          isPublic: true,
        },
      })

      if (!tier) {
        return res.status(404).json({ error: "Subscription tier not found or not available" })
      }

      // Check if user already has an active subscription to this creator
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          creatorId,
          status: "active",
        },
      })

      if (existingSubscription) {
        return res.status(400).json({
          error: "You already have an active subscription to this creator",
          subscription: existingSubscription,
        })
      }

      // Check if tier has reached max subscribers
      if (tier.maxSubscribers) {
        const currentSubscribers = await prisma.subscription.count({
          where: {
            tierId,
            status: "active",
          },
        })

        if (currentSubscribers >= tier.maxSubscribers) {
          return res.status(400).json({ error: "This subscription tier has reached its maximum number of subscribers" })
        }
      }

      // Process payment
      const paymentResult = await paymentService.createSubscription({
        userId,
        creatorId,
        tierId,
        paymentMethodId,
        amount: tier.price,
        interval: tier.billingPeriod,
      })

      if (!paymentResult.success) {
        return res.status(400).json({ error: paymentResult.message })
      }

      // Calculate end date based on billing period
      const startDate = new Date()
      const endDate = new Date(startDate)

      switch (tier.billingPeriod) {
        case "monthly":
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case "quarterly":
          endDate.setMonth(endDate.getMonth() + 3)
          break
        case "yearly":
          endDate.setFullYear(endDate.getFullYear() + 1)
          break
      }

      // Create subscription record
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          creatorId,
          tierId,
          tierName: tier.name,
          startDate,
          endDate,
          autoRenew: true,
          status: "active",
          price: tier.price,
          billingPeriod: tier.billingPeriod,
          paymentId: paymentResult.paymentId,
        },
      })

      // Send notification to creator
      await notificationService.sendNotification({
        userId: creatorId,
        type: "new_subscriber",
        title: "New Subscriber",
        message: `${req.user.name} subscribed to your ${tier.name} tier!`,
        data: {
          subscriberId: userId,
          tierId,
          tierName: tier.name,
        },
      })

      return res.status(201).json(subscription)
    } catch (error) {
      console.error("Error creating subscription:", error)
      return res.status(500).json({ error: "Failed to create subscription" })
    }
  },

  async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { subscriptionId } = req.params

      // Verify subscription ownership
      const subscription = await prisma.subscription.findUnique({
        where: {
          id: subscriptionId,
        },
        include: {
          tier: true,
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" })
      }

      if (subscription.userId !== userId) {
        return res.status(403).json({ error: "You do not have permission to cancel this subscription" })
      }

      if (subscription.status !== "active") {
        return res.status(400).json({ error: "This subscription is not active" })
      }

      // Cancel payment with payment provider
      await paymentService.cancelSubscription(subscription.paymentId)

      // Update subscription record
      const updatedSubscription = await prisma.subscription.update({
        where: {
          id: subscriptionId,
        },
        data: {
          status: "canceled",
          autoRenew: false,
        },
      })

      // Send notification to creator
      await notificationService.sendNotification({
        userId: subscription.creatorId,
        type: "subscription_canceled",
        title: "Subscription Canceled",
        message: `${req.user.name} canceled their ${subscription.tierName} subscription.`,
        data: {
          subscriberId: userId,
          tierId: subscription.tierId,
          tierName: subscription.tierName,
        },
      })

      return res.status(200).json(updatedSubscription)
    } catch (error) {
      console.error("Error canceling subscription:", error)
      return res.status(500).json({ error: "Failed to cancel subscription" })
    }
  },

  async renewSubscription(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { subscriptionId } = req.params
      const { paymentMethodId } = req.body

      // Verify subscription ownership
      const subscription = await prisma.subscription.findUnique({
        where: {
          id: subscriptionId,
        },
        include: {
          tier: true,
        },
      })

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" })
      }

      if (subscription.userId !== userId) {
        return res.status(403).json({ error: "You do not have permission to renew this subscription" })
      }

      if (subscription.status === "active" && subscription.autoRenew) {
        return res.status(400).json({ error: "This subscription is already active and set to auto-renew" })
      }

      // Process payment
      const paymentResult = await paymentService.createSubscription({
        userId,
        creatorId: subscription.creatorId,
        tierId: subscription.tierId,
        paymentMethodId,
        amount: subscription.tier.price,
        interval: subscription.tier.billingPeriod,
      })

      if (!paymentResult.success) {
        return res.status(400).json({ error: paymentResult.message })
      }

      // Calculate new end date based on billing period
      const startDate = new Date()
      const endDate = new Date(startDate)

      switch (subscription.tier.billingPeriod) {
        case "monthly":
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case "quarterly":
          endDate.setMonth(endDate.getMonth() + 3)
          break
        case "yearly":
          endDate.setFullYear(endDate.getFullYear() + 1)
          break
      }

      // Update subscription record
      const updatedSubscription = await prisma.subscription.update({
        where: {
          id: subscriptionId,
        },
        data: {
          status: "active",
          autoRenew: true,
          startDate,
          endDate,
          paymentId: paymentResult.paymentId,
        },
      })

      return res.status(200).json(updatedSubscription)
    } catch (error) {
      console.error("Error renewing subscription:", error)
      return res.status(500).json({ error: "Failed to renew subscription" })
    }
  },
}

