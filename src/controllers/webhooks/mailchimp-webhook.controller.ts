import type { Request } from "express"
import { BaseWebhookController } from "./base-webhook.controller"
import { config } from "../../config/app-config"
import { prisma } from "../../lib/prisma"
import { UserService } from "../../services/user.service"
import { NotificationService } from "../../services/notification.service"
import { logger } from "../../utils/logger"
import { QueueService } from "../../services/queue.service"

export class MailchimpWebhookController extends BaseWebhookController {
  private userService: UserService
  private notificationService: NotificationService
  private queueService: QueueService

  constructor() {
    super()
    this.userService = new UserService()
    this.notificationService = new NotificationService()
    this.queueService = new QueueService()
  }

  /**
   * Verify Mailchimp webhook signature
   */
  protected verifySignature(req: Request): boolean {
    // Mailchimp doesn't provide a signature, but we can verify the IP address
    // and/or use a shared secret in the URL

    const secret = req.query.secret as string

    if (!secret || secret !== config.mailchimp.webhookSecret) {
      return false
    }

    return true
  }

  /**
   * Process Mailchimp webhook event
   */
  protected async processEvent(event: any): Promise<void> {
    // Log the event
    logger.info("Processing Mailchimp webhook event", {
      type: event.type,
      id: event.id,
    })

    // Queue the event for processing
    await this.queueService.addJob("mailchimp-webhook", {
      eventType: event.type,
      eventData: event.data,
    })

    // Process some critical events immediately
    switch (event.type) {
      case "subscribe":
        await this.handleSubscribe(event.data)
        break

      case "unsubscribe":
        await this.handleUnsubscribe(event.data)
        break

      case "cleaned":
        await this.handleCleaned(event.data)
        break

      case "campaign":
        await this.handleCampaign(event.data)
        break
    }

    // Store the webhook event for audit purposes
    await prisma.webhookEvent.create({
      data: {
        provider: "mailchimp",
        eventType: event.type,
        eventId: event.id || `mailchimp-${Date.now()}`,
        payload: event,
        processedAt: new Date(),
      },
    })
  }

  /**
   * Handle subscribe event
   */
  private async handleSubscribe(data: any): Promise<void> {
    const email = data.email
    const user = await this.userService.findByEmail(email)

    if (!user) {
      logger.info("Mailchimp subscribe event for non-user", { email })
      return
    }

    // Update user's email preferences
    await this.userService.updateEmailPreferences(user.id, {
      marketingEmails: true,
      subscribedAt: new Date(),
    })

    // Record the event
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: "EMAIL_SUBSCRIBE",
        metadata: {
          provider: "mailchimp",
          listId: data.list_id,
        },
      },
    })
  }

  /**
   * Handle unsubscribe event
   */
  private async handleUnsubscribe(data: any): Promise<void> {
    const email = data.email
    const user = await this.userService.findByEmail(email)

    if (!user) {
      logger.info("Mailchimp unsubscribe event for non-user", { email })
      return
    }

    // Update user's email preferences
    await this.userService.updateEmailPreferences(user.id, {
      marketingEmails: false,
      unsubscribedAt: new Date(),
    })

    // Record the event
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: "EMAIL_UNSUBSCRIBE",
        metadata: {
          provider: "mailchimp",
          listId: data.list_id,
          reason: data.reason || "User unsubscribed",
        },
      },
    })
  }

  /**
   * Handle cleaned event (email bounced or marked as spam)
   */
  private async handleCleaned(data: any): Promise<void> {
    const email = data.email
    const user = await this.userService.findByEmail(email)

    if (!user) {
      logger.info("Mailchimp cleaned event for non-user", { email })
      return
    }

    // Update user's email status
    await this.userService.updateEmailStatus(user.id, {
      emailValid: false,
      emailBounced: data.reason === "hard" || data.reason === "soft",
      emailInvalidReason: data.reason,
    })

    // Record the event
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: "EMAIL_INVALID",
        metadata: {
          provider: "mailchimp",
          reason: data.reason,
        },
      },
    })

    // Notify admin about invalid email
    await this.notificationService.notifyAdmins(
      "User Email Invalid",
      `User ${user.username} (${user.email}) has an invalid email: ${data.reason}`,
    )
  }

  /**
   * Handle campaign event
   */
  private async handleCampaign(data: any): Promise<void> {
    // Store campaign information
    await prisma.emailCampaign.create({
      data: {
        provider: "mailchimp",
        campaignId: data.id,
        subject: data.subject,
        sentAt: new Date(data.send_time),
        metadata: data,
      },
    })

    // Record campaign metrics if available
    if (data.stats) {
      await prisma.emailCampaignMetrics.create({
        data: {
          campaignId: data.id,
          sent: data.stats.sent || 0,
          opens: data.stats.opens || 0,
          clicks: data.stats.clicks || 0,
          bounces: data.stats.bounces || 0,
          unsubscribes: data.stats.unsubscribes || 0,
          recordedAt: new Date(),
        },
      })
    }
  }
}

