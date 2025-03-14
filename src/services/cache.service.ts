import NodeCache from "node-cache"
import Redis from "ioredis"
import { config } from "../config/app-config"
import { logger } from "../utils/logger"

// Cache TTL defaults (in seconds)
const DEFAULT_TTL = 60 * 5 // 5 minutes
const SHORT_TTL = 60 // 1 minute
const LONG_TTL = 60 * 60 * 24 // 24 hours

// Cache key prefixes
const KEY_PREFIXES = {
  USER: "user:",
  CONTENT: "content:",
  SUBSCRIPTION: "subscription:",
  CREATOR: "creator:",
  STATS: "stats:",
}

class CacheService {
  private nodeCache: NodeCache
  private redisClient: Redis | null = null
  private useRedis = false

  constructor() {
    // Initialize node-cache for in-memory caching
    this.nodeCache = new NodeCache({
      stdTTL: DEFAULT_TTL,
      checkperiod: 120,
      useClones: false,
    })

    // Initialize Redis if configured
    if (config.redis && config.redis.url) {
      try {
        this.redisClient = new Redis(config.redis.url, {
          enableOfflineQueue: false,
        })

        this.redisClient.on("error", (err) => {
          logger.error("Redis connection error:", err)
          this.useRedis = false
        })

        this.redisClient.on("connect", () => {
          logger.info("Redis connected successfully")
          this.useRedis = true
        })
      } catch (error) {
        logger.error("Failed to initialize Redis:", error)
        this.useRedis = false
      }
    }
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        const serializedValue = JSON.stringify(value)
        await this.redisClient.set(key, serializedValue, "EX", ttl)
      } else {
        this.nodeCache.set(key, value, ttl)
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error)
      // Fallback to node-cache if Redis fails
      this.nodeCache.set(key, value, ttl)
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key)
        if (!value) return null
        return JSON.parse(value) as T
      } else {
        const value = this.nodeCache.get<T>(key)
        return value || null
      }
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error)
      // Fallback to node-cache if Redis fails
      return this.nodeCache.get<T>(key) || null
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key)
      }
      this.nodeCache.del(key)
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error)
    }
  }

  /**
   * Delete multiple values by pattern (Redis only)
   * Falls back to no-op for node-cache
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.useRedis || !this.redisClient) {
      logger.warn("deleteByPattern is only supported with Redis")
      return
    }

    try {
      const keys = await this.redisClient.keys(pattern)
      if (keys.length > 0) {
        await this.redisClient.del(...keys)
      }
    } catch (error) {
      logger.error(`Cache deleteByPattern error for pattern ${pattern}:`, error)
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushdb()
      }
      this.nodeCache.flushAll()
    } catch (error) {
      logger.error("Cache clear error:", error)
    }
  }

  /**
   * Get or set cache value (with automatic generation if not found)
   */
  async getOrSet<T>(key: string, generator: () => Promise<T>, ttl: number = DEFAULT_TTL): Promise<T> {
    const cachedValue = await this.get<T>(key)

    if (cachedValue !== null) {
      return cachedValue
    }

    const generatedValue = await generator()
    await this.set(key, generatedValue, ttl)
    return generatedValue
  }

  /**
   * Helper methods for common cache operations
   */

  // User caching
  async getUserById(userId: string, generator: () => Promise<any>): Promise<any> {
    return this.getOrSet(`${KEY_PREFIXES.USER}${userId}`, generator, DEFAULT_TTL)
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.delete(`${KEY_PREFIXES.USER}${userId}`)
    // Also delete any patterns related to this user
    if (this.useRedis) {
      await this.deleteByPattern(`${KEY_PREFIXES.USER}${userId}:*`)
    }
  }

  // Content caching
  async getContentById(contentId: string, generator: () => Promise<any>): Promise<any> {
    return this.getOrSet(`${KEY_PREFIXES.CONTENT}${contentId}`, generator, DEFAULT_TTL)
  }

  async getContentList(listKey: string, generator: () => Promise<any[]>): Promise<any[]> {
    return this.getOrSet(`${KEY_PREFIXES.CONTENT}list:${listKey}`, generator, SHORT_TTL)
  }

  async invalidateContentCache(contentId: string): Promise<void> {
    await this.delete(`${KEY_PREFIXES.CONTENT}${contentId}`)
    // Also invalidate any content lists
    if (this.useRedis) {
      await this.deleteByPattern(`${KEY_PREFIXES.CONTENT}list:*`)
    }
  }

  // Creator caching
  async getCreatorProfile(creatorId: string, generator: () => Promise<any>): Promise<any> {
    return this.getOrSet(`${KEY_PREFIXES.CREATOR}${creatorId}`, generator, DEFAULT_TTL)
  }

  async getCreatorContent(creatorId: string, generator: () => Promise<any[]>): Promise<any[]> {
    return this.getOrSet(`${KEY_PREFIXES.CREATOR}${creatorId}:content`, generator, SHORT_TTL)
  }

  async invalidateCreatorCache(creatorId: string): Promise<void> {
    await this.delete(`${KEY_PREFIXES.CREATOR}${creatorId}`)
    if (this.useRedis) {
      await this.deleteByPattern(`${KEY_PREFIXES.CREATOR}${creatorId}:*`)
    }
  }

  // Statistics caching
  async getStats(statsKey: string, generator: () => Promise<any>): Promise<any> {
    return this.getOrSet(`${KEY_PREFIXES.STATS}${statsKey}`, generator, DEFAULT_TTL)
  }

  async invalidateStats(statsKey: string): Promise<void> {
    await this.delete(`${KEY_PREFIXES.STATS}${statsKey}`)
  }

  async invalidateAllStats(): Promise<void> {
    if (this.useRedis) {
      await this.deleteByPattern(`${KEY_PREFIXES.STATS}*`)
    }
  }
}

export const cacheService = new CacheService()

