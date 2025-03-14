import type { Request } from "express"
import { BaseWebhookController } from "./base-webhook.controller"
import { config } from "../../config/app-config"
import { createHmac } from "crypto"
import { prisma } from "../../lib/prisma"
import { UserService } from "../../services/user.service"
import { NotificationService } from "../../services/notification.service"
import { logger } from "../../utils/logger"
import { QueueService } from "../../services/queue.service"

export class TwilioWebhookController extends BaseWebhookController {
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
   * Verify Twilio webhook signature
   */
  protected verifySignature(req: Request): boolean {
    const twilioSignature = req.headers["x-twilio-signature"] as string

    if (!twilioSignature) {
      return false
    }

    // Construct the validation URL (full URL including protocol, host, path, and query params)
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`

    // Sort the POST parameters alphabetically
    const sortedParams = Object.keys(req.body)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = req.body[key]
          return acc
        },
        {} as Record<string, string>,
      )

    // Concatenate the URL and sorted POST parameters
    let validationString = url
    Object.keys(sortedParams).forEach((key) => {
      validationString += key + sortedParams[key]
    })

    // Create the expected signature
    const hmac = createHmac("sha1", config.twilio.authToken)
    hmac.update(validationString)
    const expectedSignature = hmac.digest("base64")

    // Compare signatures
    return twilioSignature === expectedSignature
  }

  /**
   * Process Twilio webhook event
   */
  protected async processEvent(event: any): Promise<void> {
    // Log the event
    logger.info("Processing Twilio webhook event", {
      type: event.EventType || "SMS",
      sid: event.MessageSid || event.CallSid,
    })

    // Queue the event for processing
    await this.queueService.addJob("twilio-webhook", {
      eventType: event.EventType || "SMS",
      eventData: event,
    })

    // Process some critical events immediately
    if (event.MessageStatus) {
      await this.handleMessageStatus(event)
    } else if (event.CallStatus) {
      await this.handleCallStatus(event)
    } else if (event.Body) {
      await this.handleIncomingSMS(event)
    }

    // Store the webhook event for audit purposes
    await prisma.webhookEvent.create({
      data: {
        provider: "twilio",
        eventType: event.EventType || "SMS",
        eventId: event.MessageSid || event.CallSid || `twilio-${Date.now()}`,
        payload: event,
        processedAt: new Date(),
      },
    })
  }

  /**
   * Handle message status update
   */
  private async handleMessageStatus(event: any): Promise<void> {
    const messageSid = event.MessageSid
    const status = event.MessageStatus

    // Update message status in our database
    await prisma.smsMessage.updateMany({
      where: { externalId: messageSid },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    })

    // If there was an error, log it and notify
    if (status === "failed" || status === "undelivered") {
      logger.warn("SMS delivery failed", {
        messageSid,
        status,
        errorCode: event.ErrorCode,
        errorMessage: event.ErrorMessage,
      })

      // Find the user associated with this message
      const message = await prisma.smsMessage.findFirst({
        where: { externalId: messageSid },
        include: { user: true },
      })

      if (message?.user) {
        // Update user's phone status if needed
        if (status === "failed" && event.ErrorCode) {
          await this.userService.updatePhoneStatus(message.user.id, {
            phoneValid: false,
            phoneInvalidReason: `Twilio error: ${event.ErrorCode} - ${event.ErrorMessage}`,
          })
        }

        // Notify user about failed message through alternative channel
        await this.notificationService.sendNotification(message.user.id, {
          type: "SMS_DELIVERY_FAILED",
          title: "SMS Delivery Failed",
          body: `We couldn't deliver your SMS. Reason: ${event.ErrorMessage || status}`,
          data: {
            messageSid,
            errorCode: event.ErrorCode,
            errorMessage: event.ErrorMessage,
          },
        })
      }
    }
  }

  /**
   * Handle call status update
   */
  private async handleCallStatus(event: any): Promise<void> {
    const callSid = event.CallSid
    const status = event.CallStatus

    // Update call status in our database
    await prisma.phoneCall.updateMany({
      where: { externalId: callSid },
      data: {
        status: status,
        duration: event.CallDuration ? Number.parseInt(event.CallDuration) : undefined,
        updatedAt: new Date(),
      },
    })

    // If there was an error, log it
    if (status === "failed" || status === "busy" || status === "no-answer") {
      logger.warn("Phone call failed", {
        callSid,
        status,
        errorCode: event.ErrorCode,
        errorMessage: event.ErrorMessage,
      })

      // Find the user associated with this call
      const call = await prisma.phoneCall.findFirst({
        where: { externalId: callSid },
        include: { user: true },
      })

      if (call?.user) {
        // Notify user about failed call through alternative channel
        await this.notificationService.sendNotification(call.user.id, {
          type: "CALL_FAILED",
          title: "Call Failed",
          body: `We couldn't complete your call. Reason: ${status}`,
          data: {
            callSid,
            status,
            errorCode: event.ErrorCode,
            errorMessage: event.ErrorMessage,
          },
        })
      }
    }
  }

  /**
   * Handle incoming SMS
   */
  private async handleIncomingSMS(event: any): Promise<void> {
    const from = event.From
    const body = event.Body

    // Try to find user by phone number
    const user = await this.userService.findByPhone(from)

    if (!user) {
      logger.info("Received SMS from unknown number", { from })
      return
    }

    // Store the incoming message
    await prisma.smsMessage.create({
      data: {
        userId: user.id,
        externalId: event.MessageSid,
        from: from,
        to: event.To,
        body: body,
        direction: "inbound",
        status: "received",
        receivedAt: new Date(),
      },
    })

    // Process SMS commands if applicable
    if (body.toLowerCase().startsWith("stop")) {
      await this.userService.updateNotificationPreferences(user.id, {
        smsEnabled: false,
        smsOptOutReason: "User replied STOP",
      })

      logger.info("User opted out of SMS", { userId: user.id })
    } else if (body.toLowerCase().startsWith("start")) {
      await this.userService.updateNotificationPreferences(user.id, {
        smsEnabled: true,
      })

      logger.info("User opted in to SMS", { userId: user.id })
    } else {
      // Handle other types of incoming messages
      // For example, forward to customer support or process commands
      await this.notificationService.notifyAdmins(
        "Incoming SMS",
        `Received SMS from ${user.username} (${from}): ${body}`,
      )
    }
  }
}

