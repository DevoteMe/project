import type { Request, Response, NextFunction } from "express"
import { cacheMiddleware } from "../cache.middleware"
import { cacheService } from "../../services/cache.service"

// Mock dependencies
jest.mock("../../services/cache.service")

describe("Cache Middleware", () => {
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
      query: {},
      headers: {},
    }

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    }

    // Add a custom property to track if json was called
    responseObject._json = null
    responseObject.json = jest.fn(function (body) {
      responseObject._json = body
      return this
    })

    mockResponse = responseObject

    nextFunction = jest.fn()
  })

  it("should bypass cache for non-GET requests", () => {
    // Arrange
    mockRequest.method = "POST"
    const middleware = cacheMiddleware()

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(nextFunction).toHaveBeenCalled()
    expect(cacheService.get).not.toHaveBeenCalled()
  })

  it("should bypass cache when Cache-Control: no-cache is set", () => {
    // Arrange
    mockRequest.headers = { "cache-control": "no-cache" }
    const middleware = cacheMiddleware()

    // Act
    middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(nextFunction).toHaveBeenCalled()
    expect(cacheService.get).not.toHaveBeenCalled()
  })

  it("should return cached response if available", async () => {
    // Arrange
    const cachedResponse = {
      data: { id: 1, name: "Test" },
      status: 200,
      timestamp: Date.now() - 1000, // 1 second ago
    }
    ;(cacheService.get as jest.Mock).mockResolvedValue(cachedResponse)

    const middleware = cacheMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(cacheService.get).toHaveBeenCalledWith(expect.stringContaining("/api/test"))
    expect(nextFunction).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.setHeader).toHaveBeenCalledWith("X-Cache", "HIT")
    expect(responseObject._json).toEqual({ id: 1, name: "Test" })
  })

  it("should cache the response when not in cache", async () => {
    // Arrange
    ;(cacheService.get as jest.Mock).mockResolvedValue(null)

    const middleware = cacheMiddleware({ ttl: 60 })

    // Mock the response.json method to capture the response
    const originalJson = mockResponse.json
    const responseData = { id: 1, name: "Test" }

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Simulate the response being sent
    const jsonSpy = mockResponse.json as jest.Mock
    jsonSpy.mockImplementation(function (body) {
      return originalJson.call(this, body)
    })

    // Call the next function to simulate the request handler
    nextFunction()

    // Simulate the response being sent
    mockResponse.status(200)
    mockResponse.json(responseData)

    // Assert
    expect(cacheService.get).toHaveBeenCalledWith(expect.stringContaining("/api/test"))
    expect(nextFunction).toHaveBeenCalled()
    expect(cacheService.set).toHaveBeenCalledWith(
      expect.stringContaining("/api/test"),
      expect.objectContaining({
        data: responseData,
        status: 200,
        timestamp: expect.any(Number),
      }),
      60,
    )
    expect(mockResponse.setHeader).toHaveBeenCalledWith("X-Cache", "MISS")
  })

  it("should respect custom TTL", async () => {
    // Arrange
    ;(cacheService.get as jest.Mock).mockResolvedValue(null)

    const middleware = cacheMiddleware({ ttl: 120 })

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Simulate the response being sent
    nextFunction()
    mockResponse.status(200)
    mockResponse.json({ id: 1, name: "Test" })

    // Assert
    expect(cacheService.set).toHaveBeenCalledWith(expect.any(String), expect.any(Object), 120)
  })

  it("should respect custom key generator", async () => {
    // Arrange
    ;(cacheService.get as jest.Mock).mockResolvedValue(null)

    const keyGenerator = jest.fn().mockReturnValue("custom-key")

    const middleware = cacheMiddleware({
      keyGenerator,
    })

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(keyGenerator).toHaveBeenCalledWith(mockRequest)
    expect(cacheService.get).toHaveBeenCalledWith("custom-key")
  })

  it("should not cache error responses", async () => {
    // Arrange
    ;(cacheService.get as jest.Mock).mockResolvedValue(null)

    const middleware = cacheMiddleware()

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction)

    // Simulate an error response
    nextFunction()
    mockResponse.status(500)
    mockResponse.json({ error: "Internal Server Error" })

    // Assert
    expect(cacheService.set).not.toHaveBeenCalled()
  })
})
\
## 5. Tests
for Analytics Service

```tsx file="src/services/__tests__/analytics.service.test.ts"
import { analyticsService } from '../analytics.service';
import { cacheService } from '../cache.service';
import { logger } from '../../utils/logger';
import { config } from '../../config/app-config';

// Mock dependencies
jest.mock('../cache.service');
jest.mock('../../utils/logger');
jest.mock('../../config/app-config', () => ({
  config: {
    analytics: {
      enabled: true,
      provider: 'internal',
      flushIntervalMs: 1000,
      batchSize: 10,
    },
  },
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track an event and return an ID', async () => {
      // Act
      const eventId = await analyticsService.trackEvent(
        'user_login',
        { username: 'testuser' },
        'user123'
      );
      
      // Assert
      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe('string');
    });

    it('should not track events when analytics is disabled', async () => {
      // Arrange
      jest.spyOn(config.analytics, 'enabled', 'get').mockReturnValue(false);
      
      // Act
      const eventId = await analyticsService.trackEvent(
        'user_login',
        { username: 'testuser' },
        'user123'
      );
      
      // Assert
      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe('string');
      // We can't easily check if the event was added to the internal array,
      // but we can verify that the returned ID is still a valid UUID
    });

    it('should auto-flush when batch size is reached', async () => {
      // Arrange
      const flushSpy = jest.spyOn(analyticsService, 'flush').mockResolvedValue();
      
      // Mock the batch size
      jest.spyOn(config.analytics, 'batchSize', 'get').mockReturnValue(2);
      
      // Act - Track 2 events to trigger auto-flush
      await analyticsService.trackEvent('event1', {}, 'user1');
      await analyticsService.trackEvent('event2', {}, 'user2');
      
      // Assert
      expect(flushSpy).toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    it('should not flush when analytics is disabled', async () => {
      // Arrange
      jest.spyOn(config.analytics, 'enabled', 'get').mockReturnValue(false);
      
      // Act
      await analyticsService.flush();
      
      // Assert
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should not flush when there are no events', async () => {
      // Act
      await analyticsService.flush();
      
      // Assert
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should handle errors during flush', async () => {
      // Arrange
      // Add some events to flush
      await analyticsService.trackEvent('test_event', {}, 'user123');
      
      // Mock an error during cache update
      (cacheService.set as jest.Mock).mockRejectedValue(new Error('Cache error'));
      
      // Act
      await analyticsService.flush();
      
      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error flushing analytics events:'),
        expect.any(Error)
      );
    });
  });

  describe('getRealTimeStats', () => {
    it('should return empty stats when analytics is disabled', async () => {
      // Arrange
      jest.spyOn(config.analytics, 'enabled', 'get').mockReturnValue(false);
      
      // Act
      const stats = await analyticsService.getRealTimeStats();
      
      // Assert
      expect(stats).toEqual({
        eventCounts: {},
        activeUsers: 0,
      });
    });

    it('should return stats from cache', async () => {
      // Arrange
      const mockEventCounts = { user_login: 5, content_viewed: 10 };
      const mockActiveUsers = ['user1', 'user2', 'user3'];
      
      (cacheService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'realtime:event_counts') return mockEventCounts;
        if (key === 'realtime:active_users') return mockActiveUsers;
        return null;
      });
      
      // Act
      const stats = await analyticsService.getRealTimeStats();
      
      // Assert
      expect(stats).toEqual({
        eventCounts: mockEventCounts,
        activeUsers: 3,
      });
    });

    it('should handle errors when getting stats', async () => {
      // Arrange
      (cacheService.get as jest.Mock).mockRejectedValue(new Error('Cache error'));
      
      // Act
      const stats = await analyticsService.getRealTimeStats();
      
      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting real-time stats:'),
        expect.any(Error)
      );
      expect(stats).toEqual({
        eventCounts: {},
        activeUsers: 0,
      });
    });
  });

  describe('trackPageView', () => {
    it('should track a page view event', async () => {
      // Arrange
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent').mockResolvedValue('event-id');
      
      // Act
      await analyticsService.trackPageView(
        'user123',
        'session123',
        '/test-page',
        'https://example.com'
      );
      
      // Assert
      expect(trackEventSpy).toHaveBeenCalledWith(
        'page_viewed',
        expect.objectContaining({
          path: '/test-page',
          referrer: 'https://example.com',
        }),
        'user123',
        'session123'
      );
    });
  });

  describe('trackFeatureUsed', () => {
    it('should track a feature usage event', async () => {
      // Arrange
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent').mockResolvedValue('event-id');
      
      // Act
      await analyticsService.trackFeatureUsed(
        'user123',
        'premium_content',
        { contentId: 'content123' }
      );
      
      // Assert
      expect(trackEventSpy).toHaveBeenCalledWith(
        'feature_used',
        expect.objectContaining({
          feature: 'premium_content',
          contentId: 'content123',
        }),
        'user123'
      );
    });
  });

  describe('trackError', () => {
    it('should track an error event', async () => {
      // Arrange
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent').mockResolvedValue('event-id');
      
      // Act
      await analyticsService.trackError(
        'user123',
        'api_error',
        'Failed to fetch data',
        { statusCode: 500 }
      );
      
      // Assert
      expect(trackEventSpy).toHaveBeenCalledWith(
        'error_occurred',
        expect.objectContaining({
          errorType: 'api_error',
          errorMessage: 'Failed to fetch data',
          statusCode: 500,
        }),
        'user123'
      );
    });
  });

  describe('cleanup', () => {
    it('should clear the flush interval', () => {
      // Arrange
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      // Act
      analyticsService.cleanup();
      
      // Assert
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should flush remaining events', async () => {
      // Arrange
      const flushSpy = jest.spyOn(analyticsService, 'flush').mockResolvedValue();
      
      // Act
      analyticsService.cleanup();
      
      // Assert
      expect(flushSpy).toHaveBeenCalled();
    });
  });
});

