import type { Request } from "express"
import { BaseWebhookController } from "./base-webhook.controller"
import { config } from "../../config/app-config"
import { createHmac, timingSafeEqual } from "crypto"
import { prisma } from "../../lib/prisma"
import { PaymentService } from "../../services/payment.service"
import { UserService } from "../../services/user.service"
import { logger } from "../../utils/logger"
import { QueueService } from "../../services/queue.service"

export class PayPalWebhookController extends BaseWebhookController {
  private paymentService: PaymentService
  private userService: UserService
  private queueService: QueueService

  constructor() {
    super()
    this.paymentService = new PaymentService()
    this.userService = new UserService()
    this.queueService = new QueueService()
  }

  /**
   * Verify PayPal webhook signature
   */
  protected verifySignature(req: Request): boolean {
    const webhookId = config.paypal.webhookId
    const signature = req.headers["paypal-transmission-sig"] as string
    const transmissionId = req.headers["paypal-transmission-id"] as string
    const timestamp = req.headers["paypal-transmission-time"] as string

    if (!signature || !transmissionId || !timestamp) {
      return false
    }

    // Construct the validation string
    const validationString = `${transmissionId}|${timestamp}|${req.body}|${webhookId}`

    // Create the expected signature
    const hmac = createHmac("sha256", config.paypal.webhookSecret)
    hmac.update(validationString)
    const expectedSignature = hmac.digest("base64")

    // Compare signatures using timing-safe comparison
    try {
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    } catch (err) {
      return false
    }
  }

  /**
   * Process PayPal webhook event
   */
  protected async processEvent(event: any): Promise<void> {
    // Log the event
    logger.info("Processing PayPal webhook event", {
      type: event.event_type,
      id: event.id,
    })

    // Queue the event for processing
    await this.queueService.addJob("paypal-webhook", {
      eventId: event.id,
      eventType: event.event_type,
      eventData: event.resource,
    })

    // Process some critical events immediately
    switch (event.event_type) {
      case "PAYMENT.SALE.COMPLETED":
        await this.handlePaymentCompleted(event.resource)
        break

      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.UPDATED":
        await this.handleSubscriptionChange(event.resource)
        break

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await this.handleSubscriptionCancelled(event.resource)
        break

      case "PAYMENT.SALE.DENIED":
      case "PAYMENT.SALE.REFUNDED":
        await this.handlePaymentIssue(event.resource)
        break
    }

    // Store the webhook event for audit purposes
    await prisma.webhookEvent.create({
      data: {
        provider: "paypal",
        eventType: event.event_type,
        eventId: event.id,
        payload: event,
        processedAt: new Date(),
      },
    })
  }

  /**
   * Handle payment completed event
   */
  private async handlePaymentCompleted(resource: any): Promise<void> {
    const customId = resource.custom || ""
    const userId = this.extractUserIdFromCustomId(customId)

    if (!userId) {
      logger.warn("PayPal payment missing userId in custom field", { resource })
      return
    }

    await this.paymentService.recordSuccessfulPayment(
      userId,
      resource.id,
      this.convertPayPalAmount(resource.amount.total, resource.amount.currency),
      resource.amount.currency.toLowerCase(),
    )
  }

  /**
   * Handle subscription change event
   */
  private async handleSubscriptionChange(resource: any): Promise<void> {
    const customId = resource.custom_id || ""
    const userId = this.extractUserIdFromCustomId(customId)

    if (!userId) {
      logger.warn("PayPal subscription missing userId in custom_id field", { resource })
      return
    }

    await this.paymentService.updatePayPalSubscriptionStatus(userId, resource.id, resource.status.toLowerCase())
  }

  /**
   * Handle subscription cancelled event
   */
  private async handleSubscriptionCancelled(resource: any): Promise<void> {
    const customId = resource.custom_id || ""
    const userId = this.extractUserIdFromCustomId(customId)

    if (!userId) {
      logger.warn("PayPal subscription missing userId in custom_id field", { resource })
      return
    }

    await this.paymentService.cancelPayPalSubscription(userId, resource.id)
  }

  /**
   * Handle payment issue event
   */
  private async handlePaymentIssue(resource: any): Promise<void> {
    const customId = resource.custom || ""
    const userId = this.extractUserIdFromCustomId(customId)

    if (!userId) {
      logger.warn("PayPal payment missing userId in custom field", { resource })
      return
    }

    await this.paymentService.recordFailedPayment(userId, resource.id, `PayPal payment issue: ${resource.state}`)
  }

  /**
   * Extract user ID from PayPal custom ID field
   */
  private extractUserIdFromCustomId(customId: string): string | null {
    // Format: devoteme_user_123456
    const match = customId.match(/devoteme_user_(\w+)/)
    return match ? match[1] : null
  }

  /**
   * Convert PayPal amount to cents
   */
  private convertPayPalAmount(amount: string, currency: string): number {
    const numericAmount = Number.parseFloat(amount)
    return Math.round(numericAmount * 100) // Convert to cents
  }
}

