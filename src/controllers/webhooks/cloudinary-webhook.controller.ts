import type { Request } from "express"
import { BaseWebhookController } from "./base-webhook.controller"
import { config } from "../../config/app-config"
import { createHmac } from "crypto"
import { prisma } from "../../lib/prisma"
import { PostService } from "../../services/post.service"
import { UserService } from "../../services/user.service"
import { NotificationService } from "../../services/notification.service"
import { logger } from "../../utils/logger"
import { QueueService } from "../../services/queue.service"
import { BunnyCdnService } from "../../services/bunny-cdn.service"

export class CloudinaryWebhookController extends BaseWebhookController {
  private postService: PostService
  private userService: UserService
  private notificationService: NotificationService
  private queueService: QueueService
  private bunnyCdnService: BunnyCdnService

  constructor() {
    super()
    this.postService = new PostService()
    this.userService = new UserService()
    this.notificationService = new NotificationService()
    this.queueService = new QueueService()
    this.bunnyCdnService = new BunnyCdnService()
  }

  /**
   * Verify Cloudinary webhook signature
   */
  protected verifySignature(req: Request): boolean {
    const signature = req.headers["x-cld-signature"] as string
    const timestamp = req.headers["x-cld-timestamp"] as string

    if (!signature || !timestamp) {
      return false
    }

    // Check if timestamp is recent (within 30 minutes)
    const timestampNum = Number.parseInt(timestamp, 10)
    const now = Math.floor(Date.now() / 1000)
    if (now - timestampNum > 1800) {
      return false
    }

    // Construct the validation string
    const validationString = `${timestamp}${JSON.stringify(req.body)}`

    // Create the expected signature
    const hmac = createHmac("sha256", config.cloudinary.apiSecret)
    hmac.update(validationString)
    const expectedSignature = hmac.digest("hex")

    // Compare signatures
    return signature === expectedSignature
  }

  /**
   * Process Cloudinary webhook event
   */
  protected async processEvent(event: any): Promise<void> {
    // Log the event
    logger.info("Processing Cloudinary webhook event", {
      type: event.notification_type,
      resourceId: event.public_id,
    })

    // Queue the event for processing
    await this.queueService.addJob("cloudinary-webhook", {
      eventType: event.notification_type,
      eventData: event,
    })

    // Process some critical events immediately
    switch (event.notification_type) {
      case "upload":
        await this.handleUpload(event)
        break

      case "eager":
        await this.handleTransformation(event)
        break

      case "moderation":
        await this.handleModeration(event)
        break

      case "delete":
        await this.handleDelete(event)
        break
    }

    // Store the webhook event for audit purposes
    await prisma.webhookEvent.create({
      data: {
        provider: "cloudinary",
        eventType: event.notification_type,
        eventId: `cloudinary-${event.public_id}-${Date.now()}`,
        payload: event,
        processedAt: new Date(),
      },
    })
  }

  /**
   * Handle upload event
   */
  private async handleUpload(event: any): Promise<void> {
    const publicId = event.public_id
    const metadata = event.metadata || {}
    const userId = metadata.user_id
    const postId = metadata.post_id

    if (!userId) {
      logger.warn("Cloudinary upload missing user_id in metadata", { event })
      return
    }

    // If this is a post media upload
    if (postId) {
      // Update post media status
      await this.postService.updateMediaStatus(postId, publicId, {
        status: "uploaded",
        url: event.secure_url,
        metadata: {
          format: event.format,
          resourceType: event.resource_type,
          size: event.bytes,
          width: event.width,
          height: event.height,
          duration: event.duration,
        },
      })

      // If this is a video, we need to transfer it to BunnyCDN for better delivery
      if (event.resource_type === "video") {
        await this.bunnyCdnService.transferFromCloudinary(event.secure_url, publicId, userId, postId)
      }

      // Notify user that their media has been uploaded
      await this.notificationService.sendNotification(userId, {
        type: "MEDIA_UPLOADED",
        title: "Media Uploaded",
        body: "Your media has been successfully uploaded and is being processed.",
        data: {
          postId,
          mediaId: publicId,
        },
      })
    } else {
      // This might be a profile picture or other user media
      await this.userService.updateUserMedia(userId, publicId, {
        url: event.secure_url,
        type: event.resource_type,
        metadata: {
          format: event.format,
          size: event.bytes,
          width: event.width,
          height: event.height,
        },
      })
    }
  }

  /**
   * Handle transformation event
   */
  private async handleTransformation(event: any): Promise<void> {
    const publicId = event.public_id
    const metadata = event.metadata || {}
    const userId = metadata.user_id
    const postId = metadata.post_id

    if (!userId || !postId) {
      logger.warn("Cloudinary transformation missing user_id or post_id in metadata", { event })
      return
    }

    // Update post media with transformed versions
    await this.postService.updateMediaTransformations(postId, publicId, {
      transformations: event.eager.map((t: any) => ({
        url: t.secure_url,
        transformation: t.transformation,
        format: t.format,
        width: t.width,
        height: t.height,
        bytes: t.bytes,
      })),
    })

    // Notify user that their media has been processed
    await this.notificationService.sendNotification(userId, {
      type: "MEDIA_PROCESSED",
      title: "Media Processing Complete",
      body: "Your media has been processed and is now available.",
      data: {
        postId,
        mediaId: publicId,
      },
    })
  }

  /**
   * Handle moderation event
   */
  private async handleModeration(event: any): Promise<void> {
    const publicId = event.public_id
    const metadata = event.metadata || {}
    const userId = metadata.user_id
    const postId = metadata.post_id

    if (!userId) {
      logger.warn("Cloudinary moderation missing user_id in metadata", { event })
      return
    }

    const moderationStatus = event.moderation[0].status
    const moderationKind = event.moderation[0].kind

    // If content is rejected
    if (moderationStatus === "rejected") {
      logger.warn("Content moderation rejected media", {
        publicId,
        userId,
        postId,
        kind: moderationKind,
      })

      // Update media status
      if (postId) {
        await this.postService.updateMediaStatus(postId, publicId, {
          status: "rejected",
          moderationResult: event.moderation,
        })

        // Notify user that their content was rejected
        await this.notificationService.sendNotification(userId, {
          type: "CONTENT_REJECTED",
          title: "Content Rejected",
          body: `Your content was rejected due to ${moderationKind} concerns. Please review our content guidelines.`,
          data: {
            postId,
            mediaId: publicId,
            reason: moderationKind,
          },
        })
      } else {
        // This might be a profile picture or other user media
        await this.userService.updateUserMedia(userId, publicId, {
          status: "rejected",
          moderationResult: event.moderation,
        })

        // Notify user
        await this.notificationService.sendNotification(userId, {
          type: "PROFILE_MEDIA_REJECTED",
          title: "Profile Media Rejected",
          body: `Your profile media was rejected due to ${moderationKind} concerns. Please review our content guidelines.`,
          data: {
            mediaId: publicId,
            reason: moderationKind,
          },
        })
      }

      // Notify admins
      await this.notificationService.notifyAdmins(
        "Content Moderation Alert",
        `Content from user ${userId} was rejected due to ${moderationKind} concerns.`,
      )
    } else if (moderationStatus === "approved") {
      // Update media status
      if (postId) {
        await this.postService.updateMediaStatus(postId, publicId, {
          status: "approved",
          moderationResult: event.moderation,
        })
      } else {
        // This might be a profile picture or other user media
        await this.userService.updateUserMedia(userId, publicId, {
          status: "approved",
          moderationResult: event.moderation,
        })
      }
    }
  }

  /**
   * Handle delete event
   */
  private async handleDelete(event: any): Promise<void> {
    const publicId = event.public_id

    // Find media in our database
    const media = await prisma.media.findFirst({
      where: { externalId: publicId },
    })

    if (!media) {
      logger.info("Cloudinary delete event for unknown media", { publicId })
      return
    }

    // Update media status
    await prisma.media.update({
      where: { id: media.id },
      data: {
        status: "deleted",
        deletedAt: new Date(),
      },
    })

    // If this was associated with a post, update the post
    if (media.postId) {
      await this.postService.updatePostAfterMediaDeletion(media.postId, media.id)
    }
  }
}

