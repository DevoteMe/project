import type { Request, Response } from "express"
import { webhookController } from "../webhook.controller"
import { analyticsService } from "../../services/analytics.service"
import { subscriptionService } from "../../services/subscription.service"
import { notificationService } from "../../services/notification.service"

// Mock dependencies
jest.mock("../../services/analytics.service")
jest.mock("../../services/subscription.service")
jest.mock("../../services/notification.service")

describe("Webhook Controller", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseObject: any = {}

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock request and response
    mockRequest = {
      body: {},
      headers: {},
      params: {},
    }

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }

    mockResponse = responseObject
  })

  describe("handleStripeWebhook", () => {
    it("should handle checkout.session.completed event", async () => {
      // Arrange
      mockRequest.body = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            customer: "cus_test_123",
            metadata: {
              userId: "user123",
              creatorId: "creator123",
              planId: "plan123",
            },
            subscription: "sub_test_123",
          },
        },
      }
      ;(subscriptionService.createSubscription as jest.Mock).mockResolvedValue({
        id: "sub123",
        userId: "user123",
        creatorId: "creator123",
      })

      // Act
      await webhookController.handleStripeWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(subscriptionService.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user123",
          creatorId: "creator123",
          planId: "plan123",
          stripeSubscriptionId: "sub_test_123",
        }),
      )

      expect(analyticsService.trackEvent).toHaveBeenCalledWith("subscription_created", expect.any(Object), "user123")

      expect(notificationService.createNotification).toHaveBeenCalled()

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })

    it("should handle customer.subscription.deleted event", async () => {
      // Arrange
      mockRequest.body = {
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_test_123",
            customer: "cus_test_123",
            metadata: {
              userId: "user123",
              creatorId: "creator123",
            },
          },
        },
      }
      ;(subscriptionService.cancelSubscription as jest.Mock).mockResolvedValue({
        id: "sub123",
        userId: "user123",
        creatorId: "creator123",
        status: "cancelled",
      })

      // Act
      await webhookController.handleStripeWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(subscriptionService.cancelSubscription).toHaveBeenCalledWith("sub_test_123")

      expect(analyticsService.trackEvent).toHaveBeenCalledWith("subscription_cancelled", expect.any(Object), "user123")

      expect(notificationService.createNotification).toHaveBeenCalled()

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })

    it("should handle payment_intent.succeeded event", async () => {
      // Arrange
      mockRequest.body = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_123",
            customer: "cus_test_123",
            metadata: {
              userId: "user123",
              type: "gift",
              recipientId: "recipient123",
            },
            amount: 1000,
          },
        },
      }

      // Act
      await webhookController.handleStripeWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(analyticsService.trackEvent).toHaveBeenCalledWith("payment_succeeded", expect.any(Object), "user123")

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })

    it("should handle unknown event types", async () => {
      // Arrange
      mockRequest.body = {
        type: "unknown.event",
        data: {
          object: {
            id: "test_123",
          },
        },
      }

      // Act
      await webhookController.handleStripeWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "webhook_received",
        expect.objectContaining({
          provider: "stripe",
          eventType: "unknown.event",
        }),
        undefined,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })
  })

  describe("handlePayPalWebhook", () => {
    it("should handle PAYMENT.CAPTURE.COMPLETED event", async () => {
      // Arrange
      mockRequest.body = {
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "capture_123",
          custom_id: "user123_creator123_plan123",
          amount: {
            value: "10.00",
          },
        },
      }

      // Act
      await webhookController.handlePayPalWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(analyticsService.trackEvent).toHaveBeenCalledWith("payment_succeeded", expect.any(Object), "user123")

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })

    it("should handle unknown event types", async () => {
      // Arrange
      mockRequest.body = {
        event_type: "UNKNOWN.EVENT",
        resource: {
          id: "test_123",
        },
      }

      // Act
      await webhookController.handlePayPalWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "webhook_received",
        expect.objectContaining({
          provider: "paypal",
          eventType: "UNKNOWN.EVENT",
        }),
        undefined,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })
  })

  describe("handleMailchimpWebhook", () => {
    it("should handle subscribe event", async () => {
      // Arrange
      mockRequest.body = {
        type: "subscribe",
        data: {
          email: "user@example.com",
          list_id: "list123",
          merges: {
            USERID: "user123",
          },
        },
      }

      // Act
      await webhookController.handleMailchimpWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(analyticsService.trackEvent).toHaveBeenCalledWith("newsletter_subscribe", expect.any(Object), "user123")

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })
  })

  describe("handleTwilioWebhook", () => {
    it("should handle SMS delivered event", async () => {
      // Arrange
      mockRequest.body = {
        MessageStatus: "delivered",
        MessageSid: "SM123",
        To: "+1234567890",
        From: "+0987654321",
      }

      // Act
      await webhookController.handleTwilioWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(analyticsService.trackEvent).toHaveBeenCalledWith("sms_delivered", expect.any(Object), undefined)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })
  })

  describe("handleCloudinaryWebhook", () => {
    it("should handle upload event", async () => {
      // Arrange
      mockRequest.body = {
        notification_type: "upload",
        public_id: "image123",
        secure_url: "https://example.com/image123.jpg",
        metadata: {
          userId: "user123",
        },
      }

      // Act
      await webhookController.handleCloudinaryWebhook(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(analyticsService.trackEvent).toHaveBeenCalledWith("media_uploaded", expect.any(Object), "user123")

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Webhook received",
      })
    })
  })
})

