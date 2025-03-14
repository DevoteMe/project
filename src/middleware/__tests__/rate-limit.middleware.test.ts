import type { Request, Response, NextFunction } from "express"
import { rateLimitMiddleware } from "../rate-limit.middleware"
import { logger } from "../../utils/logger"

// Mock dependencies
jest.mock("../../utils/logger")

describe("Rate Limit Middleware", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction
  let responseObject: any = {}

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock request and response
    mockRequest = {
      ip: "127.0.0.1",
      path: "/api/test",
      method: "GET",
      headers: {},
    }

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    }

    mockResponse = responseObject

    nextFunction = jest.fn()
  })

  it("should allow requests within the rate limit", () => {
    // Arrange
    const middleware = rateLimitMiddleware({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    })

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(nextFunction).toHaveBeenCalled()
    expect(mockResponse.status).not.toHaveBeenCalled()
    expect(mockResponse.json).not.toHaveBeenCalled()
  })

  it("should set appropriate headers", () => {
    // Arrange
    const middleware = rateLimitMiddleware({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    })

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(mockResponse.set).toHaveBeenCalledWith("X-RateLimit-Limit", 100)
    expect(mockResponse.set).toHaveBeenCalledWith("X-RateLimit-Remaining", expect.any(Number))
    expect(mockResponse.set).toHaveBeenCalledWith("X-RateLimit-Reset", expect.any(Number))
  })

  it("should block requests that exceed the rate limit", () => {
    // Arrange
    const middleware = rateLimitMiddleware({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1, // limit each IP to 1 request per windowMs
    })

    // First request (allowed)
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Reset next function mock
    ;(nextFunction as jest.Mock).mockReset()

    // Act - Second request (should be blocked)
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(nextFunction).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(429)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: "Too many requests, please try again later.",
      code: 429,
    })
  })

  it("should use the keyGenerator function to identify clients", () => {
    // Arrange
    const keyGenerator = jest.fn().mockReturnValue("custom-key")

    const middleware = rateLimitMiddleware({
      windowMs: 15 * 60 * 1000,
      max: 100,
      keyGenerator,
    })

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(keyGenerator).toHaveBeenCalledWith(mockRequest)
    expect(nextFunction).toHaveBeenCalled()
  })

  it("should skip rate limiting for whitelisted IPs", () => {
    // Arrange
    mockRequest.ip = "192.168.1.1"

    const middleware = rateLimitMiddleware({
      windowMs: 15 * 60 * 1000,
      max: 1,
      skip: (req) => req.ip === "192.168.1.1",
    })

    // First request (allowed due to whitelist)
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Reset next function mock
    ;(nextFunction as jest.Mock).mockReset()

    // Act - Second request (should still be allowed due to whitelist)
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(nextFunction).toHaveBeenCalled()
    expect(mockResponse.status).not.toHaveBeenCalled()
    expect(mockResponse.json).not.toHaveBeenCalled()
  })

  it("should log rate limit exceeded events", () => {
    // Arrange
    const middleware = rateLimitMiddleware({
      windowMs: 15 * 60 * 1000,
      max: 1,
    })

    // First request (allowed)
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Reset next function mock
    ;(nextFunction as jest.Mock).mockReset()

    // Act - Second request (should be blocked)
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Rate limit exceeded"),
      expect.objectContaining({
        ip: "127.0.0.1",
        path: "/api/test",
        method: "GET",
      }),
    )
  })
})

