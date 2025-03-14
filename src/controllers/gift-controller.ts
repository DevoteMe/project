import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { paymentService } from "../services/payment-service"
import { notificationService } from "../services/notification-service"

export const giftController = {
  async getGiftCatalog(req: Request, res: Response) {
    try {
      const gifts = await prisma.gift.findMany({
        where: {
          isActive: true,
          OR: [
            { isLimited: false },
            {
              isLimited: true,
              availableUntil: {
                gte: new Date(),
              },
            },
          ],
        },
        orderBy: {
          price: "asc",
        },
      })

      return res.status(200).json(gifts)
    } catch (error) {
      console.error("Error fetching gift catalog:", error)
      return res.status(500).json({ error: "Failed to fetch gift catalog" })
    }
  },

  async sendGift(req: Request, res: Response) {
    try {
      const senderId = req.user.id
      const { giftId, recipientId, contentId, message, paymentMethodId } = req.body

      // Verify gift exists and is available
      const gift = await prisma.gift.findFirst({
        where: {
          id: giftId,
          isActive: true,
          OR: [
            { isLimited: false },
            {
              isLimited: true,
              availableUntil: {
                gte: new Date(),
              },
            },
          ],
        },
      })

      if (!gift) {
        return res.status(404).json({ error: "Gift not found or not available" })
      }

      // Verify recipient exists
      const recipient = await prisma.user.findUnique({
        where: {
          id: recipientId,
        },
      })

      if (!recipient) {
        return res.status(404).json({ error: "Recipient not found" })
      }

      // Verify content exists if contentId is provided
      if (contentId) {
        const content = await prisma.content.findUnique({
          where: {
            id: contentId,
          },
        })

        if (!content) {
          return res.status(404).json({ error: "Content not found" })
        }

        if (content.creatorId !== recipientId) {
          return res.status(400).json({ error: "Content does not belong to the recipient" })
        }
      }

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId: senderId,
        recipientId,
        amount: gift.price,
        paymentMethodId,
        description: `Gift: ${gift.name}`,
      })

      if (!paymentResult.success) {
        return res.status(400).json({ error: paymentResult.message })
      }

      // Create gift purchase record
      const giftPurchase = await prisma.giftPurchase.create({
        data: {
          giftId,
          senderId,
          recipientId,
          contentId,
          message,
          price: gift.price,
          paymentId: paymentResult.paymentId,
        },
      })

      // Update creator's revenue
      await prisma.user.update({
        where: {
          id: recipientId,
        },
        data: {
          totalRevenue: {
            increment: gift.price,
          },
        },
      })

      // Send notification to recipient
      await notificationService.sendNotification({
        userId: recipientId,
        type: "gift_received",
        title: "New Gift Received",
        message: `${req.user.name} sent you a ${gift.name}${message ? `: "${message}"` : ""}`,
        data: {
          giftId,
          giftName: gift.name,
          senderId,
          senderName: req.user.name,
          contentId,
          message,
        },
      })

      return res.status(201).json(giftPurchase)
    } catch (error) {
      console.error("Error sending gift:", error)
      return res.status(500).json({ error: "Failed to send gift" })
    }
  },

  async getReceivedGifts(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 20 } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      const gifts = await prisma.giftPurchase.findMany({
        where: {
          recipientId: userId,
        },
        include: {
          gift: true,
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          content: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: Number(limit),
      })

      const total = await prisma.giftPurchase.count({
        where: {
          recipientId: userId,
        },
      })

      return res.status(200).json({
        gifts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error("Error fetching received gifts:", error)
      return res.status(500).json({ error: "Failed to fetch received gifts" })
    }
  },

  async getSentGifts(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 20 } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      const gifts = await prisma.giftPurchase.findMany({
        where: {
          senderId: userId,
        },
        include: {
          gift: true,
          recipient: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          content: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: Number(limit),
      })

      const total = await prisma.giftPurchase.count({
        where: {
          senderId: userId,
        },
      })

      return res.status(200).json({
        gifts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error("Error fetching sent gifts:", error)
      return res.status(500).json({ error: "Failed to fetch sent gifts" })
    }
  },

  async getGiftStats(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { period = "month" } = req.query

      // Get total received gifts
      const totalReceived = await prisma.giftPurchase.count({
        where: {
          recipientId: userId,
        },
      })

      // Get total revenue from gifts
      const giftPurchases = await prisma.giftPurchase.findMany({
        where: {
          recipientId: userId,
        },
        select: {
          price: true,
        },
      })

      const totalRevenue = giftPurchases.reduce((sum, purchase) => sum + purchase.price, 0)

      // Get popular gifts
      const popularGifts = await prisma.$queryRaw`
        SELECT 
          g.id as "giftId", 
          g.name as "giftName", 
          g.image_url as "imageUrl",
          COUNT(gp.id) as count
        FROM gift_purchases gp
        JOIN gifts g ON gp.gift_id = g.id
        WHERE gp.recipient_id = ${userId}
        GROUP BY g.id, g.name, g.image_url
        ORDER BY count DESC
        LIMIT 5
      `

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

      // Calculate actual amounts for each period
      for (const periodData of revenueByPeriod) {
        let startDate, endDate

        if (period === "week") {
          startDate = new Date(periodData.period)
          endDate = new Date(periodData.period)
          endDate.setDate(endDate.getDate() + 1)
        } else {
          const [year, month] = periodData.period.split("-").map(Number)
          startDate = new Date(year, month - 1, 1)
          endDate = new Date(year, month, 0)
        }

        const purchases = await prisma.giftPurchase.findMany({
          where: {
            recipientId: userId,
            createdAt: {
              gte: startDate,
              lt: endDate,
            },
          },
          select: {
            price: true,
          },
        })

        periodData.amount = purchases.reduce((sum, purchase) => sum + purchase.price, 0)
      }

      return res.status(200).json({
        totalReceived,
        totalRevenue,
        popularGifts,
        revenueByPeriod,
      })
    } catch (error) {
      console.error("Error fetching gift stats:", error)
      return res.status(500).json({ error: "Failed to fetch gift statistics" })
    }
  },
}

