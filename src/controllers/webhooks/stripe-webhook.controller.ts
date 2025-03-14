import type { Request } from "express"
import { BaseWebhookController } from "./base-webhook.controller"
import { config } from "../../config/app-config"
import Stripe from "stripe"
import { prisma } from "../../lib/prisma"
import { PaymentService } from "../../services/payment.service"
import { UserService } from "../../services/user.service"
import { logger } from "../../utils/logger"
import { QueueService } from "../../services/queue.service"

export class StripeWebhookController extends BaseWebhookController {
  private stripe: Stripe
  private paymentService: PaymentService
  private userService: UserService
  private queueService: QueueService

  constructor() {
    super()
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: "2023-10-16",
    })
    this.paymentService = new PaymentService()
    this.userService = new UserService()
    this.queueService = new QueueService()
  }

  /**
   * Verify Stripe webhook signature
   */
  protected verifySignature(req: Request): boolean {
    const signature = req.headers["stripe-signature"] as string

    if (!signature) {
      return false
    }

    try {
      this.stripe.webhooks.constructEvent(req.body, signature, config.stripe.webhookSecret)
      return true
    } catch (err) {
      return false
    }
  }

  /**
   * Process Stripe webhook event
   */
  protected async processEvent(event: Stripe.Event): Promise<void> {
    // Log the event
    logger.info("Processing Stripe webhook event", {
      type: event.type,
      id: event.id,
    })

    // Queue the event for processing to ensure we don't block the webhook response
    await this.queueService.addJob("stripe-webhook", {
      eventId: event.id,
      eventType: event.type,
      eventData: event.data.object,
    })

    // Process some critical events immediately
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        break

      case "payment_intent.succeeded":
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
    }

    // Store the webhook event for audit purposes
    await prisma.webhookEvent.create({
      data: {
        provider: "stripe",
        eventType: event.type,
        eventId: event.id,
        payload: event as any,
        processedAt: new Date(),
      },
    })
  }

  /**
   * Handle checkout session completed event
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (!session.metadata?.userId) {
      logger.warn("Checkout session missing userId in metadata", { session })
      return
    }

    const userId = session.metadata.userId
    const subscriptionId = session.subscription as string

    if (subscriptionId) {
      // This was a subscription checkout
      await this.paymentService.activateSubscription(userId, subscriptionId)
    } else if (session.payment_intent) {
      // This was a one-time payment
      const paymentIntentId = session.payment_intent as string
      await this.paymentService.processOneTimePayment(userId, paymentIntentId)
    }
  }

  /**
   * Handle subscription change event
   */
  private async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    const user = await this.userService.findByStripeCustomerId(customerId)

    if (!user) {
      logger.warn("User not found for Stripe customer", { customerId })
      return
    }

    await this.paymentService.updateSubscriptionStatus(user.id, subscription.id, subscription.status)
  }

  /**
   * Handle subscription cancelled event
   */
  private async handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    const user = await this.userService.findByStripeCustomerId(customerId)

    if (!user) {
      logger.warn("User not found for Stripe customer", { customerId })
      return
    }

    await this.paymentService.cancelSubscription(user.id, subscription.id)
  }

  /**
   * Handle payment succeeded event
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    if (!paymentIntent.metadata?.userId) {
      logger.warn("Payment intent missing userId in metadata", { paymentIntent })
      return
    }

    const userId = paymentIntent.metadata.userId
    const amount = paymentIntent.amount
    const currency = paymentIntent.currency

    await this.paymentService.recordSuccessfulPayment(userId, paymentIntent.id, amount, currency)
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    if (!paymentIntent.metadata?.userId) {
      logger.warn("Payment intent missing userId in metadata", { paymentIntent })
      return
    }

    const userId = paymentIntent.metadata.userId

    await this.paymentService.recordFailedPayment(
      userId,
      paymentIntent.id,
      paymentIntent.last_payment_error?.message || "Payment failed",
    )
  }
}

