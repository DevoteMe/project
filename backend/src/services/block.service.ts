import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class BlockService {
  /**
   * Block a user
   */
  async blockUser(blockerId: string, blockedId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Prevent self-blocking
      if (blockerId === blockedId) {
        return {
          success: false,
          message: "You cannot block yourself",
        }
      }

      // Check if the blocked user exists
      const blockedUser = await prisma.user.findUnique({
        where: { id: blockedId },
      })

      if (!blockedUser) {
        return {
          success: false,
          message: "User not found",
        }
      }

      // Check if already blocked
      const existingBlock = await prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId,
          },
        },
      })

      if (existingBlock) {
        return {
          success: false,
          message: "User is already blocked",
        }
      }

      // Create block record
      await prisma.userBlock.create({
        data: {
          blockerId,
          blockedId,
        },
      })

      // Unfollow each other if they were following
      await prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
          ],
        },
      })

      return {
        success: true,
        message: "User blocked successfully",
      }
    } catch (error) {
      console.error("Error blocking user:", error)
      return {
        success: false,
        message: "An error occurred while blocking user",
      }
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId: string, blockedId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if block exists
      const existingBlock = await prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId,
          },
        },
      })

      if (!existingBlock) {
        return {
          success: false,
          message: "User is not blocked",
        }
      }

      // Delete block record
      await prisma.userBlock.delete({
        where: {
          id: existingBlock.id,
        },
      })

      return {
        success: true,
        message: "User unblocked successfully",
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
      return {
        success: false,
        message: "An error occurred while unblocking user",
      }
    }
  }

  /**
   * Get list of blocked users
   */
  async getBlockedUsers(userId: string) {
    try {
      const blockedUsers = await prisma.userBlock.findMany({
        where: {
          blockerId: userId,
        },
        include: {
          blocked: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return {
        success: true,
        data: blockedUsers.map((block) => ({
          blockId: block.id,
          user: block.blocked,
          blockedAt: block.createdAt,
        })),
      }
    } catch (error) {
      console.error("Error getting blocked users:", error)
      return {
        success: false,
        message: "An error occurred while fetching blocked users",
      }
    }
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(userId: string, targetId: string): Promise<boolean> {
    try {
      const block = await prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: targetId },
            { blockerId: targetId, blockedId: userId },
          ],
        },
      })

      return !!block
    } catch (error) {
      console.error("Error checking block status:", error)
      return false
    }
  }
}

