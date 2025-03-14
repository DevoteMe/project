import { PrismaClient, type VisibilityType } from "@prisma/client"

const prisma = new PrismaClient()

export class ContentAccessService {
  /**
   * Get content access settings
   * @param contentId Content ID
   */
  async getContentAccess(contentId: string): Promise<any> {
    try {
      const post = await prisma.post.findUnique({
        where: { id: contentId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      return {
        visibilityType: post.visibilityType,
        price: post.price,
        freeForDevotees: post.freeForDevotees,
      }
    } catch (error) {
      console.error("Error getting content access settings:", error)
      throw new Error("Failed to get content access settings")
    }
  }

  /**
   * Update content access settings
   * @param contentId Content ID
   * @param visibilityType Visibility type
   * @param price Price
   * @param freeForDevotees Free for devotees
   */
  async updateContentAccess(
    contentId: string,
    visibilityType: VisibilityType,
    price?: number,
    freeForDevotees?: boolean,
  ): Promise<any> {
    try {
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: contentId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Update post
      const updatedPost = await prisma.post.update({
        where: { id: contentId },
        data: {
          visibilityType,
          price,
          freeForDevotees,
        },
      })

      return {
        visibilityType: updatedPost.visibilityType,
        price: updatedPost.price,
        freeForDevotees: updatedPost.freeForDevotees,
      }
    } catch (error) {
      console.error("Error updating content access settings:", error)
      throw new Error("Failed to update content access settings")
    }
  }
}

export const contentAccessService = new ContentAccessService()

