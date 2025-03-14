import { PrismaClient, VisibilityType, TransactionType } from "@prisma/client"
import { bunnyCDNService } from "./bunny-cdn.service"
import { paymentService } from "./payment.service"
import config from "../config"

const prisma = new PrismaClient()

export class PostService {
  /**
   * Create a new post
   * @param creatorId Creator user ID
   * @param postData Post data
   * @param contentFile Content file buffer
   * @param thumbnailFile Thumbnail file buffer
   */
  async createPost(
    creatorId: string,
    postData: {
      title: string
      visibilityType: VisibilityType
      price?: number
      freeForDevotees?: boolean
      isNsfw?: boolean
      categories: string[]
      mainCategory?: string
    },
    contentFile: {
      buffer: Buffer
      originalname: string
      mimetype: string
    },
    thumbnailFile: {
      buffer: Buffer
      originalname: string
      mimetype: string
    },
  ): Promise<any> {
    try {
      // Check if user is a content creator
      const user = await prisma.user.findUnique({
        where: { id: creatorId },
        include: { contentCreator: true },
      })

      if (!user || !user.contentCreator) {
        throw new Error("User is not a content creator")
      }

      // Generate unique filenames
      const timestamp = Date.now()
      const contentFilename = `${timestamp}-${contentFile.originalname}`
      const thumbnailFilename = `${timestamp}-thumbnail-${thumbnailFile.originalname}`

      // Determine if content should be protected
      const isProtected =
        postData.visibilityType === VisibilityType.PAY_PER_VIEW || postData.visibilityType === VisibilityType.DEVOTEES

      // Upload files to CDN
      const contentUrl = await bunnyCDNService.uploadContent(
        contentFile.buffer,
        contentFilename,
        creatorId,
        isProtected,
      )

      const thumbnailUrl = await bunnyCDNService.uploadThumbnail(thumbnailFile.buffer, thumbnailFilename, creatorId)

      // Create post
      const post = await prisma.post.create({
        data: {
          creatorId,
          title: postData.title,
          contentUrl,
          thumbnailUrl,
          visibilityType: postData.visibilityType,
          price: postData.price,
          freeForDevotees: postData.freeForDevotees,
          isNsfw: postData.isNsfw,
        },
      })

      // Add categories
      for (const categoryId of postData.categories) {
        await prisma.categoryOnPost.create({
          data: {
            postId: post.id,
            categoryId,
            isMainCategory: categoryId === postData.mainCategory,
          },
        })
      }

      // Update content creator stats
      await prisma.contentCreator.update({
        where: { userId: creatorId },
        data: {
          totalPosts: { increment: 1 },
        },
      })

      // Return post with categories
      return await prisma.post.findUnique({
        where: { id: post.id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      })
    } catch (error) {
      console.error("Error creating post:", error)
      throw new Error("Failed to create post")
    }
  }

  /**
   * Get posts for discovery page
   * @param categoryId Optional category ID
   * @param page Page number
   * @param limit Number of posts per page
   * @param userId Optional user ID for filtering NSFW content
   */
  async getDiscoveryPosts(categoryId?: string, page = 1, limit = 12, userId?: string): Promise<any> {
    try {
      const skip = (page - 1) * limit

      // Get user NSFW settings if userId is provided
      let showNsfw = false
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        })
        showNsfw = user?.nsfwSettings?.showNsfw || false
      }

      // Build where clause
      const where: any = {
        visibilityType: VisibilityType.PUBLIC,
      }

      // Add category filter if provided
      if (categoryId) {
        where.categories = {
          some: {
            categoryId,
          },
        }
      }

      // Add NSFW filter
      if (!showNsfw) {
        where.isNsfw = false
      }

      // Get posts
      const posts = await prisma.post.findMany({
        where,
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
          categories: {
            include: {
              category: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      })

      // Get total count
      const totalCount = await prisma.post.count({ where })

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
      console.error("Error getting discovery posts:", error)
      throw new Error("Failed to get discovery posts")
    }
  }

  /**
   * Get premium content creators for a category
   * @param categoryId Category ID
   */
  async getPremiumCreators(categoryId: string): Promise<any> {
    try {
      const now = new Date()

      // Get active premium spots
      const premiumSpots = await prisma.premiumSpot.findMany({
        where: {
          categoryId,
          startTime: { lte: now },
          endTime: { gte: now },
        },
        include: {
          creator: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profilePicture: true,
                  isOnline: true,
                  lastSeen: true,
                },
              },
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      })

      return premiumSpots.map((spot) => ({
        id: spot.creator.user.id,
        username: spot.creator.user.username,
        profilePicture: spot.creator.user.profilePicture,
        isOnline: spot.creator.user.isOnline,
        lastSeen: spot.creator.user.lastSeen,
        endTime: spot.endTime,
      }))
    } catch (error) {
      console.error("Error getting premium creators:", error)
      throw new Error("Failed to get premium creators")
    }
  }

  /**
   * Get feed posts for a user
   * @param userId User ID
   * @param page Page number
   * @param limit Number of posts per page
   */
  async getFeedPosts(userId: string, page = 1, limit = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit

      // Get user NSFW settings
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      const showNsfw = user?.nsfwSettings?.showNsfw || false

      // Get user subscriptions and follows
      const subscriptions = await prisma.subscription.findMany({
        where: {
          userId,
          status: "ACTIVE",
        },
        select: {
          creatorId: true,
        },
      })

      const creatorIds = subscriptions.map((sub) => sub.creatorId)

      // Build where clause
      const where: any = {
        OR: [
          {
            creatorId: { in: creatorIds },
            visibilityType: VisibilityType.DEVOTEES,
          },
          {
            creatorId: { in: creatorIds },
            visibilityType: VisibilityType.PUBLIC,
          },
          {
            creatorId: { in: creatorIds },
            visibilityType: VisibilityType.FOLLOWERS,
          },
        ],
      }

      // Add NSFW filter
      if (!showNsfw) {
        where.isNsfw = false
      }

      // Get posts
      const posts = await prisma.post.findMany({
        where,
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
          categories: {
            include: {
              category: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      })

      // Get total count
      const totalCount = await prisma.post.count({ where })

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
      console.error("Error getting feed posts:", error)
      throw new Error("Failed to get feed posts")
    }
  }

  /**
   * Get post by ID
   * @param postId Post ID
   * @param userId Optional user ID for access control
   */
  async getPostById(postId: string, userId?: string): Promise<any> {
    try {
      // Get post
      const post = await prisma.post.findUnique({
        where: { id: postId },
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
          categories: {
            include: {
              category: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Check access control if user ID is provided
      if (userId && userId !== post.creatorId) {
        // Check if post is public
        if (post.visibilityType === VisibilityType.PUBLIC) {
          return post
        }

        // Check if user is subscribed to creator
        if (post.visibilityType === VisibilityType.DEVOTEES) {
          const subscription = await prisma.subscription.findFirst({
            where: {
              userId,
              creatorId: post.creatorId,
              status: "ACTIVE",
            },
          })

          if (!subscription) {
            throw new Error("Access denied: Subscription required")
          }
        }

        // Check if user has purchased pay-per-view content
        if (post.visibilityType === VisibilityType.PAY_PER_VIEW) {
          const transaction = await prisma.transaction.findFirst({
            where: {
              userId,
              postId,
              type: "PAY_PER_VIEW",
              status: "SUCCEEDED",
            },
          })

          if (!transaction) {
            throw new Error("Access denied: Purchase required")
          }
        }
      }

      // If the user doesn't have access to the content but it's pay-per-view or devotees-only,
      // generate a blurred preview URL
      if (
        userId &&
        userId !== post.creatorId &&
        (post.visibilityType === VisibilityType.PAY_PER_VIEW || post.visibilityType === VisibilityType.DEVOTEES)
      ) {
        // Extract the path from the content URL
        const contentUrlPath = post.contentUrl.replace(`${config.bunnyCDN.pullZone}/`, "")

        // Add a blurred preview URL to the post object
        post.blurredPreviewUrl = bunnyCDNService.generateBlurredPreviewUrl(contentUrlPath)
      }

      return post
    } catch (error) {
      console.error("Error getting post:", error)
      throw new Error("Failed to get post")
    }
  }

  /**
   * Like a post
   * @param postId Post ID
   * @param userId User ID
   */
  async likePost(postId: string, userId: string): Promise<any> {
    try {
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Check if user has already liked the post
      const existingLike = await prisma.like.findFirst({
        where: {
          postId,
          userId,
        },
      })

      if (existingLike) {
        return existingLike
      }

      // Create like
      const like = await prisma.like.create({
        data: {
          postId,
          userId,
        },
      })

      // Update content creator stats
      await prisma.contentCreator.updateMany({
        where: { userId: post.creatorId },
        data: {
          totalLikes: { increment: 1 },
        },
      })

      // Create notification for post creator
      await prisma.notification.create({
        data: {
          userId: post.creatorId,
          type: "LIKE",
          content: "Someone liked your post",
          relatedUserId: userId,
          relatedPostId: postId,
        },
      })

      return like
    } catch (error) {
      console.error("Error liking post:", error)
      throw new Error("Failed to like post")
    }
  }

  /**
   * Unlike a post
   * @param postId Post ID
   * @param userId User ID
   */
  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Delete like
      await prisma.like.deleteMany({
        where: {
          postId,
          userId,
        },
      })

      // Update content creator stats
      await prisma.contentCreator.updateMany({
        where: { userId: post.creatorId },
        data: {
          totalLikes: { decrement: 1 },
        },
      })
    } catch (error) {
      console.error("Error unliking post:", error)
      throw new Error("Failed to unlike post")
    }
  }

  /**
   * Add comment to a post
   * @param postId Post ID
   * @param userId User ID
   * @param content Comment content
   * @param parentId Optional parent comment ID for replies
   */
  async addComment(postId: string, userId: string, content: string, parentId?: string): Promise<any> {
    try {
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Check if parent comment exists if provided
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
        })

        if (!parentComment) {
          throw new Error("Parent comment not found")
        }
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
          parentId,
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
      })

      // Update content creator stats
      await prisma.contentCreator.updateMany({
        where: { userId: post.creatorId },
        data: {
          totalComments: { increment: 1 },
        },
      })

      // Create notification for post creator
      await prisma.notification.create({
        data: {
          userId: post.creatorId,
          type: "COMMENT",
          content: "Someone commented on your post",
          relatedUserId: userId,
          relatedPostId: postId,
          relatedCommentId: comment.id,
        },
      })

      return comment
    } catch (error) {
      console.error("Error adding comment:", error)
      throw new Error("Failed to add comment")
    }
  }

  /**
   * Get comments for a post
   * @param postId Post ID
   * @param page Page number
   * @param limit Number of comments per page
   */
  async getComments(postId: string, page = 1, limit = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit

      // Get top-level comments
      const comments = await prisma.comment.findMany({
        where: {
          postId,
          parentId: null,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
          replies: {
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
              createdAt: "asc",
            },
            take: 3, // Get first 3 replies
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      })

      // Get total count
      const totalCount = await prisma.comment.count({
        where: {
          postId,
          parentId: null,
        },
      })

      return {
        comments,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      }
    } catch (error) {
      console.error("Error getting comments:", error)
      throw new Error("Failed to get comments")
    }
  }

  /**
   * Purchase pay-per-view content
   * @param postId Post ID
   * @param userId User ID
   */
  async purchasePost(postId: string, userId: string): Promise<any> {
    try {
      // Check if post exists and is pay-per-view
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          creator: true,
        },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      if (post.visibilityType !== VisibilityType.PAY_PER_VIEW) {
        throw new Error("Post is not pay-per-view")
      }

      if (!post.price) {
        throw new Error("Post price not set")
      }

      // Check if user has already purchased the post
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          userId,
          postId,
          type: TransactionType.PAY_PER_VIEW,
          status: "SUCCEEDED",
        },
      })

      if (existingTransaction) {
        throw new Error("Post already purchased")
      }

      // Get user's Stripe customer ID
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Process payment
      const transactionId = await paymentService.processOneTimePayment(
        userId,
        post.creatorId,
        Number(post.price),
        TransactionType.PAY_PER_VIEW,
        "stripe_customer_id", // This should be retrieved from the user's record
        postId,
      )

      return {
        transactionId,
        message: "Payment processing initiated",
      }
    } catch (error) {
      console.error("Error purchasing post:", error)
      throw new Error("Failed to purchase post")
    }
  }
}

export const postService = new PostService()

