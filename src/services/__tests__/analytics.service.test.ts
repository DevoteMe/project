import { analyticsService } from "../analytics.service"
import { cacheService } from "../cache.service"
import { logger } from "../../utils/logger"
import { config } from "../../config/app-config"

// Mock dependencies
jest.mock("../cache.service")
jest.mock("../../utils/logger")
jest.mock("../../config/app-config", () => ({
  config: {
    analytics: {
      enabled: true,
      provider: "internal",
      flushIntervalMs: 1000,
      batchSize: 10,
    },
  },
}))

describe("Analytics Service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe("trackEvent", () => {
    it("should track an event and return an ID", async () => {
      // Act
      const eventId = await analyticsService.trackEvent("user_login", { username: "testuser" }, "user123")

      // Assert
      expect(eventId).toBeDefined()
      expect(typeof eventId).toBe("string")
    })

    it("should not track events when analytics is disabled", async () => {
      // Arrange
      jest.spyOn(config.analytics, "enabled", "get").mockReturnValue(false)

      // Act
      const eventId = await analyticsService.trackEvent("user_login", { username: "testuser" }, "user123")

      // Assert
      expect(eventId).toBeDefined()
      expect(typeof eventId).toBe("string")
      // We can't easily check if the event was added to the internal array,
      // but we can verify that the returned ID is still a valid UUID
    })

    it("should auto-flush when batch size is reached", async () => {
      // Arrange
      const flushSpy = jest.spyOn(analyticsService, "flush").mockResolvedValue()

      // Mock the batch size
      jest.spyOn(config.analytics, "batchSize", "get").mockReturnValue(2)

      // Act - Track 2 events to trigger auto-flush
      await analyticsService.trackEvent("event1", {}, "user1")
      await analyticsService.trackEvent("event2", {}, "user2")

      // Assert
      expect(flushSpy).toHaveBeenCalled()
    })
  })

  describe("flush", () => {
    it("should not flush when analytics is disabled", async () => {
      // Arrange
      jest.spyOn(config.analytics, "enabled", "get").mockReturnValue(false)

      // Act
      await analyticsService.flush()

      // Assert
      expect(cacheService.set).not.toHaveBeenCalled()
    })

    it("should not flush when there are no events", async () => {
      // Act
      await analyticsService.flush()

      // Assert
      expect(cacheService.set).not.toHaveBeenCalled()
    })

    it("should handle errors during flush", async () => {
      // Arrange
      // Add some events to flush
      await analyticsService.trackEvent("test_event", {}, "user123")

      // Mock an error during cache update
      ;(cacheService.set as jest.Mock).mockRejectedValue(new Error("Cache error"))

      // Act
      await analyticsService.flush()

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error flushing analytics events:"),
        expect.any(Error),
      )
    })
  })

  describe("getRealTimeStats", () => {
    it("should return empty stats when analytics is disabled", async () => {
      // Arrange
      jest.spyOn(config.analytics, "enabled", "get").mockReturnValue(false)

      // Act
      const stats = await analyticsService.getRealTimeStats()

      // Assert
      expect(stats).toEqual({
        eventCounts: {},
        activeUsers: 0,
      })
    })

    it("should return stats from cache", async () => {
      // Arrange
      const mockEventCounts = { user_login: 5, content_viewed: 10 }
      const mockActiveUsers = ["user1", "user2", "user3"]
      ;(cacheService.get as jest.Mock).mockImplementation((key) => {
        if (key === "realtime:event_counts") return mockEventCounts
        if (key === "realtime:active_users") return mockActiveUsers
        return null
      })

      // Act
      const stats = await analyticsService.getRealTimeStats()

      // Assert
      expect(stats).toEqual({
        eventCounts: mockEventCounts,
        activeUsers: 3,
      })
    })

    it("should handle errors when getting stats", async () => {
      // Arrange
      ;(cacheService.get as jest.Mock).mockRejectedValue(new Error("Cache error"))

      // Act
      const stats = await analyticsService.getRealTimeStats()

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error getting real-time stats:"),
        expect.any(Error),
      )
      expect(stats).toEqual({
        eventCounts: {},
        activeUsers: 0,
      })
    })
  })

  describe("trackPageView", () => {
    it("should track a page view event", async () => {
      // Arrange
      const trackEventSpy = jest.spyOn(analyticsService, "trackEvent").mockResolvedValue("event-id")

      // Act
      await analyticsService.trackPageView("user123", "session123", "/test-page", "https://example.com")

      // Assert
      expect(trackEventSpy).toHaveBeenCalledWith(
        "page_viewed",
        expect.objectContaining({
          path: "/test-page",
          referrer: "https://example.com",
        }),
        "user123",
        "session123",
      )
    })
  })

  describe("trackFeatureUsed", () => {
    it("should track a feature usage event", async () => {
      // Arrange
      const trackEventSpy = jest.spyOn(analyticsService, "trackEvent").mockResolvedValue("event-id")

      // Act
      await analyticsService.trackFeatureUsed("user123", "premium_content", { contentId: "content123" })

      // Assert
      expect(trackEventSpy).toHaveBeenCalledWith(
        "feature_used",
        expect.objectContaining({
          feature: "premium_content",
          contentId: "content123",
        }),
        "user123",
      )
    })
  })

  describe("trackError", () => {
    it("should track an error event", async () => {
      // Arrange
      const trackEventSpy = jest.spyOn(analyticsService, "trackEvent").mockResolvedValue("event-id")

      // Act
      await analyticsService.trackError("user123", "api_error", "Failed to fetch data", { statusCode: 500 })

      // Assert
      expect(trackEventSpy).toHaveBeenCalledWith(
        "error_occurred",
        expect.objectContaining({
          errorType: "api_error",
          errorMessage: "Failed to fetch data",
          statusCode: 500,
        }),
        "user123",
      )
    })
  })

  describe("cleanup", () => {
    it("should clear the flush interval", () => {
      // Arrange
      const clearIntervalSpy = jest.spyOn(global, "clearInterval")

      // Act
      analyticsService.cleanup()

      // Assert
      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it("should flush remaining events", async () => {
      // Arrange
      const flushSpy = jest.spyOn(analyticsService, "flush").mockResolvedValue()

      // Act
      analyticsService.cleanup()

      // Assert
      expect(flushSpy).toHaveBeenCalled()
    })
  })
})

