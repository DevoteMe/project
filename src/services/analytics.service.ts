import { v4 as uuidv4 } from "uuid"
import { config } from "../config/app-config"
import { logger } from "../utils/logger"
import { cacheService } from "./cache.service"

// Define event types
type EventType =
  | "user_registered"
  | "user_login"
  | "content_viewed"
  | "content_created"
  | "subscription_created"
  | "subscription_cancelled"
  | "payment_succeeded"
  | "payment_failed"
  | "gift_sent"
  | "gift_redeemed"
  | "webhook_received"
  | "newsletter_subscribe"
  | "newsletter_unsubscribe"
  | "newsletter_campaign"
  | "sms_delivered"
  | "sms_failed"
  | "media_uploaded"
  | "media_deleted"
  | "content_moderated"
  | "search_performed"
  | "page_viewed"
  | "feature_used"
  | "error_occurred"
  | string // Allow custom event types

// Define event data structure
interface EventData {
  [key: string]: any
}

// Define analytics event
interface AnalyticsEvent {
  id: string
  timestamp: number
  type: EventType
  userId?: string
  sessionId?: string
  data: EventData
}

class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private isProcessing = false
  private batchSize = 100
  private analyticsEnabled = true

  constructor() {
    // Initialize analytics service
    this.analyticsEnabled = config.analytics?.enabled !== false

    if (this.analyticsEnabled) {
      // Set up automatic flushing of events
      const flushIntervalMs = config.analytics?.flushIntervalMs || 30000 // Default: 30 seconds
      this.flushInterval = setInterval(() => this.flush(), flushIntervalMs)

      // Set batch size
      this.batchSize = config.analytics?.batchSize || 100

      logger.info("Analytics service initialized")
    } else {
      logger.info("Analytics service disabled")
    }
  }

  /**
   * Track an event
   */
  async trackEvent(type: EventType, data: EventData = {}, userId?: string, sessionId?: string): Promise<string> {
    if (!this.analyticsEnabled) {
      return uuidv4() // Return a dummy ID if analytics is disabled
    }

    const event: AnalyticsEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      type,
      userId,
      sessionId,
      data,
    }

    this.events.push(event)

    // Auto-flush if we've reached the batch size
    if (this.events.length >= this.batchSize) {
      this.flush().catch((err) => logger.error("Error flushing events:", err))
    }

    return event.id
  }

  /**
   * Flush events to storage/analytics provider
   */
  async flush(): Promise<void> {
    if (!this.analyticsEnabled || this.events.length === 0 || this.isProcessing) {
      return
    }

    this.isProcessing = true

    try {
      // Get events to process
      const eventsToProcess = [...this.events]
      this.events = []

      // Process events based on configured provider
      const provider = config.analytics?.provider || "internal"

      switch (provider) {
        case "segment":
          await this.sendToSegment(eventsToProcess)
          break
        case "mixpanel":
          await this.sendToMixpanel(eventsToProcess)
          break
        case "google":
          await this.sendToGoogleAnalytics(eventsToProcess)
          break
        case "internal":
        default:
          await this.storeInternally(eventsToProcess)
      }

      logger.debug(`Flushed ${eventsToProcess.length} analytics events`)
    } catch (error) {
      logger.error("Error flushing analytics events:", error)
      // Put events back in the queue if processing failed
      this.events = [...this.events, ...this.events]
      // Trim if we have too many events to prevent memory issues
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Store events internally (database or file)
   */
  private async storeInternally(events: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would store events in a database
    // For now, we'll just log them
    logger.debug(`Stored ${events.length} events internally`)

    // Update real-time stats in cache
    await this.updateRealTimeStats(events)
  }

  /**
   * Send events to Segment
   */
  private async sendToSegment(events: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would use the Segment API
    logger.debug(`Sent ${events.length} events to Segment`)
  }

  /**
   * Send events to Mixpanel
   */
  private async sendToMixpanel(events: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would use the Mixpanel API
    logger.debug(`Sent ${events.length} events to Mixpanel`)
  }

  /**
   * Send events to Google Analytics
   */
  private async sendToGoogleAnalytics(events: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would use the Google Analytics API
    logger.debug(`Sent ${events.length} events to Google Analytics`)
  }

  /**
   * Update real-time stats in cache
   */
  private async updateRealTimeStats(events: AnalyticsEvent[]): Promise<void> {
    try {
      // Group events by type
      const eventsByType: Record<string, number> = {}
      events.forEach((event) => {
        eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      })

      // Update event counts in cache
      const statsKey = "realtime:event_counts"
      const currentStats = (await cacheService.get<Record<string, number>>(statsKey)) || {}

      Object.entries(eventsByType).forEach(([type, count]) => {
        currentStats[type] = (currentStats[type] || 0) + count
      })

      await cacheService.set(statsKey, currentStats, 3600) // 1 hour TTL

      // Update active users
      const activeUsers = new Set<string>()
      events
        .filter((event) => event.userId)
        .forEach((event) => {
          if (event.userId) {
            activeUsers.add(event.userId)
          }
        })

      if (activeUsers.size > 0) {
        const activeUsersKey = "realtime:active_users"
        const currentActiveUsers = (await cacheService.get<string[]>(activeUsersKey)) || []
        const updatedActiveUsers = [...new Set([...currentActiveUsers, ...Array.from(activeUsers)])]

        await cacheService.set(activeUsersKey, updatedActiveUsers, 3600) // 1 hour TTL
      }
    } catch (error) {
      logger.error("Error updating real-time stats:", error)
    }
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeStats(): Promise<any> {
    if (!this.analyticsEnabled) {
      return {
        eventCounts: {},
        activeUsers: 0,
      }
    }

    try {
      const eventCounts = (await cacheService.get<Record<string, number>>("realtime:event_counts")) || {}
      const activeUsers = (await cacheService.get<string[]>("realtime:active_users")) || []

      return {
        eventCounts,
        activeUsers: activeUsers.length,
      }
    } catch (error) {
      logger.error("Error getting real-time stats:", error)
      return {
        eventCounts: {},
        activeUsers: 0,
      }
    }
  }

  /**
   * Track page view
   */
  async trackPageView(userId: string | undefined, sessionId: string, path: string, referrer?: string): Promise<string> {
    return this.trackEvent(
      "page_viewed",
      {
        path,
        referrer,
        userAgent: "server-side",
      },
      userId,
      sessionId,
    )
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsed(
    userId: string | undefined,
    featureName: string,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    return this.trackEvent(
      "feature_used",
      {
        feature: featureName,
        ...metadata,
      },
      userId,
    )
  }

  /**
   * Track error
   */
  async trackError(
    userId: string | undefined,
    errorType: string,
    errorMessage: string,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    return this.trackEvent(
      "error_occurred",
      {
        errorType,
        errorMessage,
        ...metadata,
      },
      userId,
    )
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }

    // Flush any remaining events
    if (this.events.length > 0) {
      this.flush().catch((err) => logger.error("Error flushing events during cleanup:", err))
    }
  }
}

export const analyticsService = new AnalyticsService()

// Ensure cleanup on process exit
process.on("beforeExit", () => {
  analyticsService.cleanup()
})

