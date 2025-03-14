import type { Request, Response, NextFunction } from "express"
import { v4 as uuidv4 } from "uuid"
import { analyticsService } from "../services/analytics.service"
import { logger } from "../utils/logger"

/**
 * Middleware to track API requests
 */
export const analyticsMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip tracking for health checks and other internal endpoints
    if (req.path === "/health" || req.path.startsWith("/api-docs")) {
      return next()
    }

    try {
      // Get or create session ID from cookies or headers
      const sessionId = req.cookies?.sessionId || req.headers["x-session-id"] || uuidv4()

      // Set session ID cookie if not present
      if (!req.cookies?.sessionId) {
        res.cookie("sessionId", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })
      }

      // Track API request
      const userId = req.user?.id
      const path = req.originalUrl || req.url
      const method = req.method
      const referrer = req.headers.referer || req.headers.referrer

      // Capture response time
      const startTime = Date.now()

      // Track page view for GET requests
      if (method === "GET") {
        await analyticsService.trackPageView(userId, sessionId, path, referrer as string)
      } else {
        // Track API action for non-GET requests
        await analyticsService.trackEvent(
          "api_request",
          {
            path,
            method,
            referrer,
          },
          userId,
          sessionId,
        )
      }

      // Capture response status and time
      res.on("finish", () => {
        const duration = Date.now() - startTime
        const statusCode = res.statusCode

        // Track API response
        analyticsService
          .trackEvent(
            "api_response",
            {
              path,
              method,
              statusCode,
              duration,
            },
            userId,
            sessionId,
          )
          .catch((err) => logger.error("Error tracking API response:", err))

        // Track errors
        if (statusCode >= 400) {
          analyticsService
            .trackError(userId, "api_error", `API request failed with status ${statusCode}`, {
              path,
              method,
              statusCode,
              duration,
            })
            .catch((err) => logger.error("Error tracking API error:", err))
        }
      })

      next()
    } catch (error) {
      logger.error("Analytics middleware error:", error)
      next()
    }
  }
}

