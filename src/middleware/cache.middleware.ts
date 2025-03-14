import type { Request, Response, NextFunction } from "express"
import { cacheService } from "../services/cache.service"
import { logger } from "../utils/logger"

interface CacheOptions {
  ttl?: number
  keyFn?: (req: Request) => string
}

/**
 * Middleware to cache API responses
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300 } = options // Default TTL: 5 minutes

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next()
    }

    // Generate cache key
    const cacheKey = options.keyFn ? options.keyFn(req) : `${req.originalUrl || req.url}:${req.user?.id || "anonymous"}`

    try {
      // Try to get from cache
      const cachedResponse = await cacheService.get<{
        status: number
        data: any
        headers: Record<string, string>
      }>(cacheKey)

      if (cachedResponse) {
        // Set headers from cached response
        Object.entries(cachedResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value)
        })

        // Send cached response
        return res.status(cachedResponse.status).json(cachedResponse.data)
      }

      // Cache miss, capture the response
      const originalSend = res.send

      res.send = function (body: any): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const headers: Record<string, string> = {}

          // Capture relevant headers
          const headersToCache = ["content-type", "content-language", "cache-control"]
          headersToCache.forEach((header) => {
            const value = res.getHeader(header)
            if (value) {
              headers[header] = value.toString()
            }
          })

          // Store in cache
          const responseToCache = {
            status: res.statusCode,
            data: JSON.parse(body),
            headers,
          }

          cacheService.set(cacheKey, responseToCache, ttl).catch((err) => logger.error("Error caching response:", err))
        }

        return originalSend.call(this, body)
      }

      next()
    } catch (error) {
      logger.error("Cache middleware error:", error)
      next()
    }
  }
}

/**
 * Middleware to invalidate cache for specific resources
 */
export const invalidateCacheMiddleware = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only apply to mutation operations
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const resourceId = req.params.id

      // Capture the original end method
      const originalEnd = res.end

      res.end = function (chunk?: any, encoding?: BufferEncoding): Response {
        // Only invalidate on successful operations
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            switch (resourceType) {
              case "user":
                cacheService.invalidateUserCache(resourceId)
                break
              case "content":
                cacheService.invalidateContentCache(resourceId)
                break
              case "creator":
                cacheService.invalidateCreatorCache(resourceId)
                break
              case "stats":
                cacheService.invalidateStats(resourceId)
                break
              default:
                // For other resources, just invalidate the specific URL
                cacheService.delete(req.originalUrl || req.url)
            }
          } catch (error) {
            logger.error("Error invalidating cache:", error)
          }
        }

        return originalEnd.call(this, chunk, encoding)
      }
    }

    next()
  }
}

