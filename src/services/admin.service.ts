import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class AdminService {
  /**
   * Get admin settings
   * @param key Setting key
   */
  async getSetting(key: string): Promise<any> {
    try {
      const setting = await prisma.adminSetting.findUnique({
        where: { key },
      })

      return setting?.value
    } catch (error) {
      console.error("Error getting admin setting:", error)
      throw new Error("Failed to get admin setting")
    }
  }

  /**
   * Update admin settings
   * @param key Setting key
   * @param value Setting value
   */
  async updateSetting(key: string, value: any): Promise<any> {
    try {
      const setting = await prisma.adminSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })

      return setting
    } catch (error) {
      console.error("Error updating admin setting:", error)
      throw new Error("Failed to update admin setting")
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<any> {
    try {
      return await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      })
    } catch (error) {
      console.error("Error getting categories:", error)
      throw new Error("Failed to get categories")
    }
  }

  /**
   * Create a new category
   * @param name Category name
   * @param isFixed Whether the category is fixed
   */
  async createCategory(name: string, isFixed = false): Promise<any> {
    try {
      return await prisma.category.create({
        data: {
          name,
          isFixed,
        },
      })
    } catch (error) {
      console.error("Error creating category:", error)
      throw new Error("Failed to create category")
    }
  }

  /**
   * Update a category
   * @param id Category ID
   * @param name Category name
   */
  async updateCategory(id: string, name: string): Promise<any> {
    try {
      return await prisma.category.update({
        where: { id },
        data: { name },
      })
    } catch (error) {
      console.error("Error updating category:", error)
      throw new Error("Failed to update category")
    }
  }

  /**
   * Delete a category
   * @param id Category ID
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      if (category.isFixed) {
        throw new Error("Cannot delete fixed category")
      }

      await prisma.category.delete({
        where: { id },
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      throw new Error("Failed to delete category")
    }
  }

  /**
   * Get moderation queue
   * @param page Page number
   * @param limit Number of posts per page
   */
  async getModerationQueue(page = 1, limit = 20): Promise<any> {
    try {
      const skip = (page - 1) * limit

      // Get posts pending moderation
      const posts = await prisma.post.findMany({
        where: {
          // Add your moderation status field here
          // For example: moderationStatus: 'PENDING'
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        skip,
        take: limit,
      })

      // Get total count
      const totalCount = await prisma.post.count({
        where: {
          // Same condition as above
        },
      })

      return {
        posts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      }
    } catch (error) {
      console.error("Error getting moderation queue:", error)
      throw new Error("Failed to get moderation queue")
    }
  }

  /**
   * Moderate a post
   * @param postId Post ID
   * @param approved Whether the post is approved
   * @param rejectionReason Optional rejection reason
   */
  async moderatePost(postId: string, approved: boolean, rejectionReason?: string): Promise<any> {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      if (approved) {
        // Approve post
        return await prisma.post.update({
          where: { id: postId },
          data: {
            // Add your moderation status field here
            // For example: moderationStatus: 'APPROVED'
          },
        })
      } else {
        // Reject post
        return await prisma.post.update({
          where: { id: postId },
          data: {
            // Add your moderation status field here
            // For example:
            // moderationStatus: 'REJECTED',
            // rejectionReason: rejectionReason,
          },
        })
      }
    } catch (error) {
      console.error("Error moderating post:", error)
      throw new Error("Failed to moderate post")
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<any> {
    try {
      // Get user counts
      const totalUsers = await prisma.user.count()
      const totalContentCreators = await prisma.contentCreator.count()

      // Get post counts
      const totalPosts = await prisma.post.count()

      // Get transaction stats
      const transactions = await prisma.transaction.findMany({
        where: {
          status: "SUCCEEDED",
        },
        select: {
          amount: true,
          platformFee: true,
          type: true,
        },
      })

      // Calculate revenue
      const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
      const platformRevenue = transactions.reduce((sum, t) => sum + Number(t.platformFee), 0)

      // Group transactions by type
      const revenueByType: Record<string, number> = {}
      transactions.forEach((t) => {
        const type = t.type.toString()
        revenueByType[type] = (revenueByType[type] || 0) + Number(t.amount)
      })

      return {
        users: {
          total: totalUsers,
          contentCreators: totalContentCreators,
        },
        content: {
          totalPosts,
        },
        revenue: {
          total: totalRevenue,
          platform: platformRevenue,
          byType: revenueByType,
        },
      }
    } catch (error) {
      console.error("Error getting platform stats:", error)
      throw new Error("Failed to get platform stats")
    }
  }
}

export const adminService = new AdminService()

