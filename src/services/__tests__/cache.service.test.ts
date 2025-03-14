import { cacheService } from "../cache.service"
import NodeCache from "node-cache"
import { describe, beforeEach, it, jest, expect } from "@jest/globals"

// Mock NodeCache
jest.mock("node-cache")

describe("Cache Service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe("get", () => {
    it("should retrieve a value from the cache", async () => {
      // Arrange
      const key = "test-key"
      const expectedValue = { id: 1, name: "Test" }

      // Mock the get method of NodeCache
      ;(NodeCache.prototype.get as jest.Mock).mockReturnValue(expectedValue)

      // Act
      const result = await cacheService.get(key)

      // Assert
      expect(NodeCache.prototype.get).toHaveBeenCalledWith(key)
      expect(result).toEqual(expectedValue)
    })

    it("should return null for non-existent keys", async () => {
      // Arrange
      const key = "non-existent-key"

      // Mock the get method of NodeCache to return undefined
      ;(NodeCache.prototype.get as jest.Mock).mockReturnValue(undefined)

      // Act
      const result = await cacheService.get(key)

      // Assert
      expect(NodeCache.prototype.get).toHaveBeenCalledWith(key)
      expect(result).toBeNull()
    })
  })

  describe("set", () => {
    it("should set a value in the cache with TTL", async () => {
      // Arrange
      const key = "test-key"
      const value = { id: 1, name: "Test" }
      const ttl = 60 // 60 seconds

      // Mock the set method of NodeCache
      ;(NodeCache.prototype.set as jest.Mock).mockReturnValue(true)

      // Act
      await cacheService.set(key, value, ttl)

      // Assert
      expect(NodeCache.prototype.set).toHaveBeenCalledWith(key, value, ttl)
    })

    it("should set a value in the cache with default TTL", async () => {
      // Arrange
      const key = "test-key"
      const value = { id: 1, name: "Test" }

      // Mock the set method of NodeCache
      ;(NodeCache.prototype.set as jest.Mock).mockReturnValue(true)

      // Act
      await cacheService.set(key, value)

      // Assert
      expect(NodeCache.prototype.set).toHaveBeenCalledWith(key, value, 3600) // Default TTL is 3600 seconds
    })
  })

  describe("delete", () => {
    it("should delete a value from the cache", async () => {
      // Arrange
      const key = "test-key"

      // Mock the del method of NodeCache
      ;(NodeCache.prototype.del as jest.Mock).mockReturnValue(1)

      // Act
      await cacheService.delete(key)

      // Assert
      expect(NodeCache.prototype.del).toHaveBeenCalledWith(key)
    })
  })

  describe("flush", () => {
    it("should flush the entire cache", async () => {
      // Arrange
      // Mock the flushAll method of NodeCache
      ;(NodeCache.prototype.flushAll as jest.Mock).mockReturnValue(true)

      // Act
      await cacheService.flush()

      // Assert
      expect(NodeCache.prototype.flushAll).toHaveBeenCalled()
    })
  })

  describe("getOrSet", () => {
    it("should return cached value if it exists", async () => {
      // Arrange
      const key = "test-key"
      const expectedValue = { id: 1, name: "Test" }
      const fetchFunction = jest.fn().mockResolvedValue({ id: 2, name: "New Test" })

      // Mock the get method of NodeCache to return a value
      ;(NodeCache.prototype.get as jest.Mock).mockReturnValue(expectedValue)

      // Act
      const result = await cacheService.getOrSet(key, fetchFunction)

      // Assert
      expect(NodeCache.prototype.get).toHaveBeenCalledWith(key)
      expect(fetchFunction).not.toHaveBeenCalled()
      expect(result).toEqual(expectedValue)
    })

    it("should fetch and cache value if it does not exist", async () => {
      // Arrange
      const key = "test-key"
      const expectedValue = { id: 2, name: "New Test" }
      const fetchFunction = jest.fn().mockResolvedValue(expectedValue)

      // Mock the get method of NodeCache to return undefined
      ;(NodeCache.prototype.get as jest.Mock).mockReturnValue(undefined)

      // Mock the set method of NodeCache
      ;(NodeCache.prototype.set as jest.Mock).mockReturnValue(true)

      // Act
      const result = await cacheService.getOrSet(key, fetchFunction)

      // Assert
      expect(NodeCache.prototype.get).toHaveBeenCalledWith(key)
      expect(fetchFunction).toHaveBeenCalled()
      expect(NodeCache.prototype.set).toHaveBeenCalledWith(key, expectedValue, 3600)
      expect(result).toEqual(expectedValue)
    })

    it("should handle errors in fetch function", async () => {
      // Arrange
      const key = "test-key"
      const error = new Error("Fetch error")
      const fetchFunction = jest.fn().mockRejectedValue(error)

      // Mock the get method of NodeCache to return undefined
      ;(NodeCache.prototype.get as jest.Mock).mockReturnValue(undefined)

      // Act & Assert
      await expect(cacheService.getOrSet(key, fetchFunction)).rejects.toThrow("Fetch error")
      expect(NodeCache.prototype.get).toHaveBeenCalledWith(key)
      expect(fetchFunction).toHaveBeenCalled()
      expect(NodeCache.prototype.set).not.toHaveBeenCalled()
    })
  })

  describe("invalidatePattern", () => {
    it("should delete all keys matching a pattern", async () => {
      // Arrange
      const pattern = "user:*"
      const keys = ["user:1", "user:2", "post:1"]

      // Mock the keys method of NodeCache
      ;(NodeCache.prototype.keys as jest.Mock).mockReturnValue(keys)

      // Mock the del method of NodeCache
      ;(NodeCache.prototype.del as jest.Mock).mockReturnValue(2)

      // Act
      await cacheService.invalidatePattern(pattern)

      // Assert
      expect(NodeCache.prototype.keys).toHaveBeenCalled()
      expect(NodeCache.prototype.del).toHaveBeenCalledWith(["user:1", "user:2"])
    })

    it("should handle no matching keys", async () => {
      // Arrange
      const pattern = "user:*"
      const keys = ["post:1", "post:2"]

      // Mock the keys method of NodeCache
      ;(NodeCache.prototype.keys as jest.Mock).mockReturnValue(keys)

      // Act
      await cacheService.invalidatePattern(pattern)

      // Assert
      expect(NodeCache.prototype.keys).toHaveBeenCalled()
      expect(NodeCache.prototype.del).not.toHaveBeenCalled()
    })
  })
})

