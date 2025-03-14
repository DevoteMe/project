import type { Request, Response, NextFunction } from "express"
import { analyticsMiddleware } from "../analytics.middleware"
import { analyticsService } from "../../services/analytics.service"
import { logger } from "../../utils/logger"

// Mock dependencies
jest.mock("../../services/analytics.service")
jest.mock("../../utils/logger")

describe("Analytics Middleware", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction
  let responseObject: any = {}

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock request and response
    mockRequest = {
      method: "GET",
      originalUrl: "/api/test",
      url: "/test",
      path: "/test",
      cookies: {},
      headers: {},
      user: { id: "user123" },
    }

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function (event, callback) {
        if (event === "finish") {
          this.finishCallback = callback
        }
        return this
      }),
      statusCode: 200,
      finishCallback: null,
    }

    mockResponse = responseObject

    nextFunction = jest.fn()
  })

  it("should skip tracking for health check endpoints", async () => {
    // Arrange
    mockRequest.path = "/health"
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(nextFunction).toHaveBeenCalled()
    expect(analyticsService.trackPageView).not.toHaveBeenCalled()
    expect(analyticsService.trackEvent).not.toHaveBeenCalled()
  })

  it("should skip tracking for API docs endpoints", async () => {
    // Arrange
    mockRequest.path = "/api-docs/swagger"
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(nextFunction).toHaveBeenCalled()
    expect(analyticsService.trackPageView).not.toHaveBeenCalled()
    expect(analyticsService.trackEvent).not.toHaveBeenCalled()
  })

  it("should create a session ID if not present", async () => {
    // Arrange
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      "sessionId",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        maxAge: expect.any(Number),
      }),
    )
  })

  it("should use existing session ID from cookies", async () => {
    // Arrange
    mockRequest.cookies = { sessionId: "existing-session" }
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(mockResponse.cookie).not.toHaveBeenCalled()
    expect(analyticsService.trackPageView).toHaveBeenCalledWith(
      "user123",
      "existing-session",
      expect.any(String),
      undefined,
    )
  })

  it("should track page view for GET requests", async () => {
    // Arrange
    mockRequest.method = "GET"
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(analyticsService.trackPageView).toHaveBeenCalledWith(
      "user123",
      expect.any(String),
      expect.any(String),
      undefined,
    )
  })

  it("should track API action for non-GET requests", async () => {
    // Arrange
    mockRequest.method = "POST"
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      "api_request",
      expect.objectContaining({
        method: "POST",
      }),
      "user123",
      expect.any(String),
    )
  })

  it("should track response on finish", async () => {
    // Arrange
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Simulate response finish
    responseObject.finishCallback()

    // Assert
    expect(mockResponse.on).toHaveBeenCalledWith("finish", expect.any(Function))
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      "api_response",
      expect.objectContaining({
        statusCode: 200,
      }),
      "user123",
      expect.any(String),
    )
  })

  it("should track errors for 4xx and 5xx responses", async () => {
    // Arrange
    responseObject.statusCode = 500
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Simulate response finish
    responseObject.finishCallback()

    // Assert
    expect(analyticsService.trackError).toHaveBeenCalledWith(
      "user123",
      "api_error",
      expect.stringContaining("API request failed with status 500"),
      expect.any(Object),
    )
  })

  it("should handle errors gracefully", async () => {
    // Arrange
    ;(analyticsService.trackPageView as jest.Mock).mockRejectedValue(new Error("Tracking error"))
    const middleware = analyticsMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(logger.error).toHaveBeenCalledWith("Analytics middleware error:", expect.any(Error))
    expect(nextFunction).toHaveBeenCalled()
  })
})

