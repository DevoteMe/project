import Stripe from "stripe"
import { config } from "../config/app-config"
import { PrismaClient, TransactionType, TransactionStatus } from "@prisma/client"

const prisma = new PrismaClient()
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2023-10-16",
})

export class PaymentService {
  /**
   * Create a customer in Stripe
   * @param userId User ID
   * @param email User email
   */
  async createCustomer(userId: string, email: string): Promise<string> {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      })

      return customer.id
    } catch (error) {
      console.error("Error creating Stripe customer:", error)
      throw new Error("Failed to create payment customer")
    }
  }

  /**
   * Create a subscription for a user to a content creator
   * @param userId User ID
   * @param creatorId Creator ID
   * @param priceAmount Price amount in dollars
   */
  async createSubscription(
    userId: string,
    creatorId: string,
    priceAmount: number,
    stripeCustomerId: string,
  ): Promise<string> {
    try {
      // First, create a product for the creator if it doesn't exist
      const productName = `Devotion to Creator ${creatorId}`

      // Check if product exists
      const products = await stripe.products.list({
        active: true,
        metadata: {
          creatorId,
        },
      })

      let product
      if (products.data.length > 0) {
        product = products.data[0]
      } else {
        product = await stripe.products.create({
          name: productName,
          metadata: {
            creatorId,
          },
        })
      }

      // Create or update price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(priceAmount * 100), // Convert to cents
        currency: config.stripe.currency,
        recurring: {
          interval: "month",
        },
        metadata: {
          creatorId,
        },
      })

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          {
            price: price.id,
          },
        ],
        metadata: {
          userId,
          creatorId,
        },
        application_fee_percent: config.stripe.platformFeePercent,
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId,
          creatorId,
          amount: priceAmount,
          platformFee: (priceAmount * config.stripe.platformFeePercent) / 100,
          type: TransactionType.SUBSCRIPTION,
          status: TransactionStatus.SUCCEEDED,
          stripePaymentId: subscription.id,
        },
      })

      // Create subscription record
      const dbSubscription = await prisma.subscription.create({
        data: {
          userId,
          creatorId,
          price: priceAmount,
          stripeSubscriptionId: subscription.id,
        },
      })

      return dbSubscription.id
    } catch (error) {
      console.error("Error creating subscription:", error)
      throw new Error("Failed to create subscription")
    }
  }

  /**
   * Process a one-time payment (tip, pay-per-view)
   * @param userId User ID
   * @param creatorId Creator ID
   * @param amount Amount in dollars
   * @param type Transaction type
   * @param postId Optional post ID for pay-per-view
   * @param messageId Optional message ID for tips on messages
   */
  async processOneTimePayment(
    userId: string,
    creatorId: string,
    amount: number,
    type: TransactionType,
    stripeCustomerId: string,
    postId?: string,
    messageId?: string,
  ): Promise<string> {
    try {
      // Get creator's connected account
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        include: { contentCreator: true },
      })

      if (!creator || !creator.contentCreator) {
        throw new Error("Creator not found")
      }

      // Calculate platform fee
      const platformFee = (amount * config.stripe.platformFeePercent) / 100

      // Calculate referral fee if applicable
      let referralFee = 0
      if (
        creator.contentCreator.referrerId &&
        creator.contentCreator.referralEndDate &&
        new Date() < creator.contentCreator.referralEndDate
      ) {
        referralFee = (amount * 5) / 100 // 5% referral fee
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: config.stripe.currency,
        customer: stripeCustomerId,
        metadata: {
          userId,
          creatorId,
          type,
          postId: postId || "",
          messageId: messageId || "",
        },
        application_fee_amount: Math.round((platformFee + referralFee) * 100),
      })

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          creatorId,
          postId,
          messageId,
          amount,
          platformFee,
          referralFee: referralFee || undefined,
          type,
          status: TransactionStatus.PENDING,
          stripePaymentId: paymentIntent.id,
        },
      })

      return transaction.id
    } catch (error) {
      console.error("Error processing payment:", error)
      throw new Error("Failed to process payment")
    }
  }

  /**
   * Handle Stripe webhook events
   * @param event Stripe event
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
          break
        case "payment_intent.payment_failed":
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
          break
        case "customer.subscription.deleted":
          await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
          break
        // Add more event handlers as needed
      }
    } catch (error) {
      console.error("Error handling webhook event:", error)
      throw new Error("Failed to process webhook event")
    }
  }

  /**
   * Handle successful payment
   * @param paymentIntent Stripe payment intent
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { userId, creatorId, type, postId, messageId } = paymentIntent.metadata

    // Update transaction status
    await prisma.transaction.updateMany({
      where: {
        stripePaymentId: paymentIntent.id,
      },
      data: {
        status: TransactionStatus.SUCCEEDED,
      },
    })

    // Handle specific transaction types
    if (type === TransactionType.PAY_PER_VIEW && postId) {
      // Grant access to the post
      // Implementation depends on your access control system
    } else if (type === TransactionType.TIP && messageId) {
      // Update message with tip amount
      await prisma.message.update({
        where: { id: messageId },
        data: {
          tipAmount: paymentIntent.amount / 100, // Convert from cents to dollars
        },
      })
    }

    // Create notification for the creator
    await prisma.notification.create({
      data: {
        userId: creatorId,
        type: "TIP",
        content: `You received a payment of $${paymentIntent.amount / 100}`,
        relatedUserId: userId,
      },
    })
  }

  /**
   * Handle failed payment
   * @param paymentIntent Stripe payment intent
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Update transaction status
    await prisma.transaction.updateMany({
      where: {
        stripePaymentId: paymentIntent.id,
      },
      data: {
        status: TransactionStatus.FAILED,
      },
    })
  }

  /**
   * Handle canceled subscription
   * @param subscription Stripe subscription
   */
  private async handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
    const { userId, creatorId } = subscription.metadata

    // Update subscription status
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: "CANCELED",
        endDate: new Date(),
      },
    })

    // Create notification for the creator
    await prisma.notification.create({
      data: {
        userId: creatorId,
        type: "DEVOTEE",
        content: "A user has canceled their devotion to you",
        relatedUserId: userId,
      },
    })
  }
}

export const paymentService = new PaymentService()

