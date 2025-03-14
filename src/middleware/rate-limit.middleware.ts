import type { Request, Response, NextFunction } from "express"
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible"
import Redis from "ioredis"
import { config } from "../config/app-config"
import { logger } from "../utils/logger"

// Create Redis client if Redis is configured
let redisClient: Redis | null = null
if (config.redis && config.redis.url) {
  redisClient = new Redis(config.redis.url, {
    enableOfflineQueue: false,
  })

  redisClient.on("error", (err) => {
    logger.error("Redis error:", err)
  })
}

// Create rate limiters
const createLimiter = (points: number, duration: number, keyPrefix: string) => {
  const opts = {
    points,
    duration,
    keyPrefix,
  }

  return redisClient
    ? new RateLimiterRedis({
        ...opts,
        storeClient: redisClient,
      })
    : new RateLimiterMemory(opts)
}

// Default rate limiters
const standardLimiter = createLimiter(100, 60, "standard_rate_limit")
const authLimiter = createLimiter(20, 60, "auth_rate_limit")
const contentCreationLimiter = createLimiter(30, 60, "content_creation_rate_limit")
const webhookLimiter = createLimiter(200, 60, "webhook_rate_limit")

// Rate limit middleware factory
export const rateLimiter = (limiterType: "standard" | "auth" | "contentCreation" | "webhook" = "standard") => {
  let limiter: RateLimiterMemory | RateLimiterRedis

  switch (limiterType) {
    case "auth":
      limiter = authLimiter
      break
    case "contentCreation":
      limiter = contentCreationLimiter
      break
    case "webhook":
      limiter = webhookLimiter
      break
    default:
      limiter = standardLimiter
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get client IP or user ID if authenticated
      const key = req.user?.id || req.ip

      // Consume points
      await limiter.consume(key)
      next()
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`)
      }

      res.status(429).json({
        status: "error",
        message: "Too many requests, please try again later",
        code: 429,
      })
    }
  }
}

// Special rate limiter for sensitive operations
export const sensitiveRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get client IP
    const key = req.ip

    // Stricter limits for sensitive operations
    const limiter = createLimiter(5, 60, "sensitive_rate_limit")

    // Consume points
    await limiter.consume(key)
    next()
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Sensitive rate limit exceeded for ${req.ip} on ${req.path}`)
    }

    res.status(429).json({
      status: "error",
      message: "Too many attempts, please try again later",
      code: 429,
    })
  }
}

