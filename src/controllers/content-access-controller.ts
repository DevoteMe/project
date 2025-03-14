import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"

export const contentAccessController = {
  async getContentAccess(req: Request, res: Response) {
    try {
      const { contentId } = req.params

      const contentAccess = await prisma.contentAccess.findUnique({
        where: {
          contentId,
        },
      })

      if (!contentAccess) {
        return res.status(200).json({
          contentId,
          accessLevel: "public", // Default access level
          previewEnabled: false,
        })
      }

      return res.status(200).json(contentAccess)
    } catch (error) {
      console.error("Error fetching content access:", error)
      return res.status(500).json({ error: "Failed to fetch content access settings" })
    }
  },

  async updateContentAccess(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { contentId } = req.params
      const { accessLevel, allowedTierIds, previewEnabled, previewPercentage } = req.body

      // Verify content ownership
      const content = await prisma.content.findUnique({
        where: {
          id: contentId,
        },
      })

      if (!content) {
        return res.status(404).json({ error: "Content not found" })
      }

      if (content.creatorId !== userId) {
        return res.status(403).json({ error: "You do not have permission to update this content" })
      }

      // Validate tier IDs if access level is tier-specific
      if (accessLevel === "tier-specific" && allowedTierIds && allowedTierIds.length > 0) {
        const tiers = await prisma.subscriptionTier.findMany({
          where: {
            id: {
              in: allowedTierIds,
            },
            creatorId: userId,
          },
        })

        if (tiers.length !== allowedTierIds.length) {
          return res.status(400).json({ error: "One or more tier IDs are invalid" })
        }
      }

      // Update or create content access settings
      const contentAccess = await prisma.contentAccess.upsert({
        where: {
          contentId,
        },
        update: {
          accessLevel,
          allowedTierIds: accessLevel === "tier-specific" ? allowedTierIds : null,
          previewEnabled: previewEnabled || false,
          previewPercentage: previewEnabled ? previewPercentage || 20 : null,
        },
        create: {
          contentId,
          accessLevel,
          allowedTierIds: accessLevel === "tier-specific" ? allowedTierIds : null,
          previewEnabled: previewEnabled || false,
          previewPercentage: previewEnabled ? previewPercentage || 20 : null,
        },
      })

      return res.status(200).json(contentAccess)
    } catch (error) {
      console.error("Error updating content access:", error)
      return res.status(500).json({ error: "Failed to update content access settings" })
    }
  },

  async canAccessContent(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { contentId } = req.params

      // Get content and its access settings
      const content = await prisma.content.findUnique({
        where: {
          id: contentId,
        },
        include: {
          access: true,
        },
      })

      if (!content) {
        return res.status(404).json({ error: "Content not found" })
      }

      // If content is public, allow access
      if (!content.access || content.access.accessLevel === "public") {
        return res.status(200).json({ canAccess: true })
      }

      // If user is the creator, allow access
      if (content.creatorId === userId) {
        return res.status(200).json({ canAccess: true })
      }

      // Check if user has an active subscription
      if (content.access.accessLevel === "subscribers") {
        const subscription = await prisma.subscription.findFirst({
          where: {
            userId,
            creatorId: content.creatorId,
            status: "active",
          },
        })

        return res.status(200).json({
          canAccess: !!subscription,
          previewEnabled: content.access.previewEnabled,
          previewPercentage: content.access.previewPercentage,
        })
      }

      // Check if user has an active subscription to the required tiers
      if (content.access.accessLevel === "tier-specific" && content.access.allowedTierIds) {
        const subscription = await prisma.subscription.findFirst({
          where: {
            userId,
            creatorId: content.creatorId,
            tierId: {
              in: content.access.allowedTierIds,
            },
            status: "active",
          },
        })

        return res.status(200).json({
          canAccess: !!subscription,
          previewEnabled: content.access.previewEnabled,
          previewPercentage: content.access.previewPercentage,
        })
      }

      // Default: no access
      return res.status(200).json({
        canAccess: false,
        previewEnabled: content.access.previewEnabled,
        previewPercentage: content.access.previewPercentage,
      })
    } catch (error) {
      console.error("Error checking content access:", error)
      return res.status(500).json({ error: "Failed to check content access" })
    }
  },

  async getCreatorExclusiveContent(req: Request, res: Response) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 20, accessLevel } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      const whereClause: any = {
        creatorId: userId,
      }

      if (accessLevel) {
        whereClause.access = {
          accessLevel: accessLevel as string,
        }
      }

      const content = await prisma.content.findMany({
        where: whereClause,
        include: {
          access: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: Number(limit),
      })

      const total = await prisma.content.count({
        where: whereClause,
      })

      return res.status(200).json({
        content,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error("Error fetching creator exclusive content:", error)
      return res.status(500).json({ error: "Failed to fetch exclusive content" })
    }
  },

  async getExclusiveContentStats(req: Request, res: Response) {
    try {
      const userId = req.user.id

      // Get total content count
      const totalContent = await prisma.content.count({
        where: {
          creatorId: userId,
        },
      })

      // Get content by access level
      const contentByAccessLevel = await prisma.$queryRaw`
        SELECT 
          COALESCE(ca.access_level, 'public') as "accessLevel",
          COUNT(c.id) as count
        FROM content c
        LEFT JOIN content_access ca ON c.id = ca.content_id
        WHERE c.creator_id = ${userId}
        GROUP BY COALESCE(ca.access_level, 'public')
      `

      // Calculate engagement rate (simplified)
      const exclusiveContent = await prisma.content.findMany({
        where: {
          creatorId: userId,
          access: {
            accessLevel: {
              in: ["subscribers", "tier-specific"],
            },
          },
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
              shares: true,
            },
          },
        },
      })

      const publicContent = await prisma.content.findMany({
        where: {
          creatorId: userId,
          OR: [
            {
              access: {
                accessLevel: "public",
              },
            },
            {
              access: null,
            },
          ],
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
              shares: true,
            },
          },
        },
      })

      const exclusiveEngagement = exclusiveContent.reduce(
        (sum, content) => sum + content._count.likes + content._count.comments + content._count.shares,
        0,
      )

      const publicEngagement = publicContent.reduce(
        (sum, content) => sum + content._count.likes + content._count.comments + content._count.shares,
        0,
      )

      const exclusiveEngagementRate = exclusiveContent.length > 0 ? exclusiveEngagement / exclusiveContent.length : 0

      const publicEngagementRate = publicContent.length > 0 ? publicEngagement / publicContent.length : 0

      const engagementRate = exclusiveEngagementRate

      // Calculate conversion rate (simplified)
      const subscriptionConversions = await prisma.$queryRaw`
        SELECT 
          c.id as "contentId",
          c.title,
          COUNT(DISTINCT s.id) as "conversionCount"
        FROM content c
        JOIN content_access ca ON c.id = ca.content_id
        JOIN subscriptions s ON c.creator_id = s.creator_id
        WHERE c.creator_id = ${userId}
        AND ca.access_level IN ('subscribers', 'tier-specific')
        AND s.created_at > c.created_at
        AND s.created_at < DATE_ADD(c.created_at, INTERVAL 7 DAY)
        GROUP BY c.id, c.title
        ORDER BY "conversionCount" DESC
        LIMIT 5
      `

      const totalExclusiveContent = exclusiveContent.length
      const totalSubscribers = await prisma.subscription.count({
        where: {
          creatorId: userId,
          status: "active",
        },
      })

      const conversionRate =
        totalExclusiveContent > 0 && totalSubscribers > 0 ? (totalSubscribers / totalExclusiveContent) * 100 : 0

      return res.status(200).json({
        totalExclusiveContent,
        contentByAccessLevel,
        engagementRate,
        conversionRate,
        topConvertingContent: subscriptionConversions,
      })
    } catch (error) {
      console.error("Error fetching exclusive content stats:", error)
      return res.status(500).json({ error: "Failed to fetch exclusive content statistics" })
    }
  },
}

