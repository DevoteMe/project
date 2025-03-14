import type { Request, Response } from "express"
import { config } from "../config/app-config"
import { logger } from "../utils/logger"
import { subscriptionService } from "../services/subscription.service"
import { giftService } from "../services/gift.service"
import { userService } from "../services/user.service"
import { contentService } from "../services/content.service"
import { analyticsService } from "../services/analytics.service"
import { notificationService } from "../services/notification.service"

class WebhookController {
  /**
   * Handle webhook events from Stripe
   */
  async handleStripeWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers["stripe-signature"] as string

      if (!signature) {
        return res.status(401).json({
          status: "error",
          message: "Missing stripe-signature header",
          code: 401,
        })
      }

      // Verify webhook signature
      const event = await this.verifyStripeWebhook(req.body, signature)

      // Track webhook event
      await analyticsService.trackEvent("webhook_received", {
        provider: "stripe",
        eventType: event.type,
      })

      // Process the event based on its type
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSucceeded(event.data.object)
          break

        case "payment_intent.payment_failed":
          await this.handlePaymentFailed(event.data.object)
          break

        case "customer.subscription.created":
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object)
          break

        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object)
          break

        case "customer.created":
        case "customer.updated":
          await this.handleCustomerUpdated(event.data.object)
          break

        default:
          logger.info(`Unhandled Stripe event type: ${event.type}`)
      }

      return res.status(200).json({
        status: "success",
        message: "Webhook received and processed",
      })
    } catch (error) {
      logger.error("Error processing Stripe webhook:", error)
      return res.status(400).json({
        status: "error",
        message: error instanceof Error ? error.message : "Invalid webhook payload",
        code: 400,
      })
    }
  }

  /**
   * Handle webhook events from PayPal
   */
  async handlePaypalWebhook(req: Request, res: Response) {
    try {
      const webhookId = req.headers["paypal-auth-algo"] as string

      if (!webhookId) {
        return res.status(401).json({
          status: "error",
          message: "Missing PayPal webhook authentication headers",
          code: 401,
        })
      }

      // Verify webhook signature
      const event = await this.verifyPaypalWebhook(req.body, req.headers)

      // Track webhook event
      await analyticsService.trackEvent("webhook_received", {
        provider: "paypal",
        eventType: event.event_type,
      })

      // Process the event based on its type
      switch (event.event_type) {
        case "PAYMENT.CAPTURE.COMPLETED":
          await this.handlePaypalPaymentCompleted(event.resource)
          break

        case "PAYMENT.CAPTURE.DENIED":
          await this.handlePaypalPaymentDenied(event.resource)
          break

        case "BILLING.SUBSCRIPTION.CREATED":
        case "BILLING.SUBSCRIPTION.UPDATED":
          await this.handlePaypalSubscriptionUpdated(event.resource)
          break

        case "BILLING.SUBSCRIPTION.CANCELLED":
          await this.handlePaypalSubscriptionCancelled(event.resource)
          break

        default:
          logger.info(`Unhandled PayPal event type: ${event.event_type}`)
      }

      return res.status(200).json({
        status: "success",
        message: "Webhook received and processed",
      })
    } catch (error) {
      logger.error("Error processing PayPal webhook:", error)
      return res.status(400).json({
        status: "error",
        message: error instanceof Error ? error.message : "Invalid webhook payload",
        code: 400,
      })
    }
  }

  /**
   * Handle webhook events from Mailchimp
   */
  async handleMailchimpWebhook(req: Request, res: Response) {
    try {
      const { type, data } = req.body

      // Track webhook event
      await analyticsService.trackEvent("webhook_received", {
        provider: "mailchimp",
        eventType: type,
      })

      // Process the event based on its type
      switch (type) {
        case "subscribe":
          await this.handleMailchimpSubscribe(data)
          break

        case "unsubscribe":
          await this.handleMailchimpUnsubscribe(data)
          break

        case "campaign":
          await this.handleMailchimpCampaign(data)
          break

        default:
          logger.info(`Unhandled Mailchimp event type: ${type}`)
      }

      return res.status(200).json({
        status: "success",
        message: "Webhook received and processed",
      })
    } catch (error) {
      logger.error("Error processing Mailchimp webhook:", error)
      return res.status(400).json({
        status: "error",
        message: error instanceof Error ? error.message : "Invalid webhook payload",
        code: 400,
      })
    }
  }

  /**
   * Handle webhook events from Twilio
   */
  async handleTwilioWebhook(req: Request, res: Response) {
    try {
      const { MessageStatus, MessageSid, To } = req.body

      // Track webhook event
      await analyticsService.trackEvent("webhook_received", {
        provider: "twilio",
        eventType: MessageStatus,
      })

      // Process the event based on its type
      switch (MessageStatus) {
        case "delivered":
          await this.handleTwilioMessageDelivered(MessageSid, To)
          break

        case "failed":
          await this.handleTwilioMessageFailed(MessageSid, To)
          break

        default:
          logger.info(`Unhandled Twilio event type: ${MessageStatus}`)
      }

      // Twilio expects TwiML response
      res.set("Content-Type", "text/xml")
      return res.send("<Response></Response>")
    } catch (error) {
      logger.error("Error processing Twilio webhook:", error)
      res.set("Content-Type", "text/xml")
      return res.status(400).send("<Response></Response>")
    }
  }

  /**
   * Handle webhook events from Cloudinary
   */
  async handleCloudinaryWebhook(req: Request, res: Response) {
    try {
      const { notification_type, resource_type, public_id, secure_url } = req.body

      // Track webhook event
      await analyticsService.trackEvent("webhook_received", {
        provider: "cloudinary",
        eventType: notification_type,
      })

      // Process the event based on its type
      switch (notification_type) {
        case "upload":
          await this.handleCloudinaryUpload(resource_type, public_id, secure_url)
          break

        case "delete":
          await this.handleCloudinaryDelete(resource_type, public_id)
          break

        case "moderation":
          await this.handleCloudinaryModeration(resource_type, public_id, req.body)
          break

        default:
          logger.info(`Unhandled Cloudinary event type: ${notification_type}`)
      }

      return res.status(200).json({
        status: "success",
        message: "Webhook received and processed",
      })
    } catch (error) {
      logger.error("Error processing Cloudinary webhook:", error)
      return res.status(400).json({
        status: "error",
        message: error instanceof Error ? error.message : "Invalid webhook payload",
        code: 400,
      })
    }
  }

  // Verification methods

  private async verifyStripeWebhook(payload: any, signature: string) {
    const stripe = require("stripe")(config.payment.stripe.secretKey)

    return stripe.webhooks.constructEvent(payload, signature, config.payment.stripe.webhookSecret)
  }

  private async verifyPaypalWebhook(payload: any, headers: any) {
    // In a real implementation, you would verify the PayPal webhook signature
    // using their SDK or API

    // For now, we'll just return the payload as if it was verified
    return payload
  }

  // Payment provider event handlers

  private async handlePaymentSucceeded(paymentIntent: any) {
    const { metadata } = paymentIntent

    if (!metadata || !metadata.type) {
      logger.warn("Payment intent missing metadata:", paymentIntent.id)
      return
    }

    switch (metadata.type) {
      case "subscription":
        await subscriptionService.activateSubscription(metadata.subscriptionId)
        await notificationService.sendPaymentSuccessNotification(metadata.userId)
        break

      case "gift":
        await giftService.completeGift(metadata.giftId)
        await notificationService.sendGiftCompletedNotification(metadata.giftId)
        break

      default:
        logger.warn(`Unknown payment type: ${metadata.type}`)
    }

    // Track successful payment
    await analyticsService.trackEvent("payment_succeeded", {
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentType: metadata.type,
      userId: metadata.userId,
    })
  }

  private async handlePaymentFailed(paymentIntent: any) {
    const { metadata } = paymentIntent

    if (!metadata || !metadata.type) {
      logger.warn("Payment intent missing metadata:", paymentIntent.id)
      return
    }

    switch (metadata.type) {
      case "subscription":
        await subscriptionService.markSubscriptionPaymentFailed(metadata.subscriptionId)
        await notificationService.sendPaymentFailedNotification(metadata.userId)
        break

      case "gift":
        await giftService.markGiftFailed(metadata.giftId)
        await notificationService.sendGiftFailedNotification(metadata.giftId)
        break

      default:
        logger.warn(`Unknown payment type: ${metadata.type}`)
    }

    // Track failed payment
    await analyticsService.trackEvent("payment_failed", {
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentType: metadata.type,
      userId: metadata.userId,
      errorCode: paymentIntent.last_payment_error?.code,
    })
  }

  private async handleSubscriptionUpdated(subscription: any) {
    await subscriptionService.syncSubscriptionFromStripe(subscription.id, subscription)

    // Track subscription update
    await analyticsService.trackEvent("subscription_updated", {
      subscriptionId: subscription.id,
      status: subscription.status,
      customerId: subscription.customer,
    })
  }

  private async handleSubscriptionDeleted(subscription: any) {
    await subscriptionService.cancelSubscriptionFromStripe(subscription.id)

    // Track subscription cancellation
    await analyticsService.trackEvent("subscription_cancelled", {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
    })
  }

  private async handleCustomerUpdated(customer: any) {
    // Update user information based on Stripe customer data
    if (customer.metadata && customer.metadata.userId) {
      await userService.updateUserPaymentInfo(customer.metadata.userId, {
        stripeCustomerId: customer.id,
        defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
      })
    }
  }

  private async handlePaypalPaymentCompleted(resource: any) {
    const { custom_id } = resource

    if (!custom_id) {
      logger.warn("PayPal payment missing custom_id:", resource.id)
      return
    }

    const [type, id, userId] = custom_id.split(":")

    switch (type) {
      case "subscription":
        await subscriptionService.activateSubscription(id)
        await notificationService.sendPaymentSuccessNotification(userId)
        break

      case "gift":
        await giftService.completeGift(id)
        await notificationService.sendGiftCompletedNotification(id)
        break

      default:
        logger.warn(`Unknown payment type: ${type}`)
    }

    // Track successful payment
    await analyticsService.trackEvent("payment_succeeded", {
      paymentId: resource.id,
      amount: resource.amount.value,
      currency: resource.amount.currency_code,
      paymentType: type,
      userId: userId,
    })
  }

  private async handlePaypalPaymentDenied(resource: any) {
    const { custom_id } = resource

    if (!custom_id) {
      logger.warn("PayPal payment missing custom_id:", resource.id)
      return
    }

    const [type, id, userId] = custom_id.split(":")

    switch (type) {
      case "subscription":
        await subscriptionService.markSubscriptionPaymentFailed(id)
        await notificationService.sendPaymentFailedNotification(userId)
        break

      case "gift":
        await giftService.markGiftFailed(id)
        await notificationService.sendGiftFailedNotification(id)
        break

      default:
        logger.warn(`Unknown payment type: ${type}`)
    }

    // Track failed payment
    await analyticsService.trackEvent("payment_failed", {
      paymentId: resource.id,
      amount: resource.amount.value,
      currency: resource.amount.currency_code,
      paymentType: type,
      userId: userId,
    })
  }

  private async handlePaypalSubscriptionUpdated(resource: any) {
    await subscriptionService.syncSubscriptionFromPaypal(resource.id, resource)

    // Track subscription update
    await analyticsService.trackEvent("subscription_updated", {
      subscriptionId: resource.id,
      status: resource.status,
      subscriberId: resource.subscriber.email_address,
    })
  }

  private async handlePaypalSubscriptionCancelled(resource: any) {
    await subscriptionService.cancelSubscriptionFromPaypal(resource.id)

    // Track subscription cancellation
    await analyticsService.trackEvent("subscription_cancelled", {
      subscriptionId: resource.id,
      subscriberId: resource.subscriber.email_address,
    })
  }

  // Email marketing event handlers

  private async handleMailchimpSubscribe(data: any) {
    const { email, merge_fields } = data

    // Update user preferences
    await userService.updateUserEmailPreferences(email, {
      subscribedToNewsletter: true,
      newsletterSource: "mailchimp",
    })

    // Track subscription event
    await analyticsService.trackEvent("newsletter_subscribe", {
      email,
      source: "mailchimp",
      listId: data.list_id,
    })
  }

  private async handleMailchimpUnsubscribe(data: any) {
    const { email } = data

    // Update user preferences
    await userService.updateUserEmailPreferences(email, {
      subscribedToNewsletter: false,
    })

    // Track unsubscription event
    await analyticsService.trackEvent("newsletter_unsubscribe", {
      email,
      source: "mailchimp",
      listId: data.list_id,
      reason: data.reason,
    })
  }

  private async handleMailchimpCampaign(data: any) {
    // Track campaign event
    await analyticsService.trackEvent("newsletter_campaign", {
      campaignId: data.campaign_id,
      subject: data.subject,
      status: data.status,
    })
  }

  // SMS event handlers

  private async handleTwilioMessageDelivered(messageSid: string, phoneNumber: string) {
    // Update notification status
    await notificationService.updateSmsStatus(messageSid, "delivered")

    // Track SMS delivery
    await analyticsService.trackEvent("sms_delivered", {
      messageSid,
      phoneNumber,
    })
  }

  private async handleTwilioMessageFailed(messageSid: string, phoneNumber: string) {
    // Update notification status
    await notificationService.updateSmsStatus(messageSid, "failed")

    // Track SMS failure
    await analyticsService.trackEvent("sms_failed", {
      messageSid,
      phoneNumber,
    })
  }

  // Media event handlers

  private async handleCloudinaryUpload(resourceType: string, publicId: string, secureUrl: string) {
    if (resourceType === "image" || resourceType === "video") {
      // Update content with new media URL
      await contentService.updateContentMedia(publicId, secureUrl, resourceType)

      // Track media upload
      await analyticsService.trackEvent("media_uploaded", {
        publicId,
        resourceType,
        url: secureUrl,
      })
    }
  }

  private async handleCloudinaryDelete(resourceType: string, publicId: string) {
    if (resourceType === "image" || resourceType === "video") {
      // Remove media from content
      await contentService.removeContentMedia(publicId)

      // Track media deletion
      await analyticsService.trackEvent("media_deleted", {
        publicId,
        resourceType,
      })
    }
  }

  private async handleCloudinaryModeration(resourceType: string, publicId: string, data: any) {
    if (data.moderation && data.moderation.status === "rejected") {
      // Flag content for review
      await contentService.flagContentForReview(publicId, {
        reason: "Automated content moderation",
        moderationData: data.moderation,
      })

      // Track moderation event
      await analyticsService.trackEvent("content_moderated", {
        publicId,
        resourceType,
        status: "rejected",
        moderationData: data.moderation,
      })
    }
  }
}

export const webhookController = new WebhookController()

