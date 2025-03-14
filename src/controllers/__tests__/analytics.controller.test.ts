import type { Request, Response } from "express"
import { analyticsController } from "../analytics.controller"
import { analyticsService } from "../../services/analytics.service"
import { contentService } from "../../services/content.service"
import { logger } from "../../utils/logger"

// Mock dependencies
jest.mock("../../services/analytics.service")
jest.mock("../../services/content.service")
jest.mock("../../utils/logger")

describe("Analytics Controller", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseObject: any = {}

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock request and response
    mockRequest = {
      query: {},
      params: {},
      user: {
        id: "user123",
        role: "creator",
      },
    }

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    }

    mockResponse = responseObject
  })

  describe("getDashboardData", () => {
    it("should return platform analytics for admin users", async () => {
      // Arrange
      mockRequest.user = {
        id: "admin123",
        role: "admin",
      }

      // Mock the private method
      const mockPlatformData = { users: { total: 1000 } }
      jest.spyOn(analyticsController as any, "getPlatformAnalytics").mockResolvedValue(mockPlatformData)

      // Act
      await analyticsController.getDashboardData(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: mockPlatformData,
      })
    })

    it("should return creator analytics for creator users", async () => {
      // Arrange
      // Mock the private method
      const mockCreatorData = { subscribers: { total: 100 } }
      jest.spyOn(analyticsController as any, "getCreatorAnalytics").mockResolvedValue(mockCreatorData)

      // Act
      await analyticsController.getDashboardData(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: mockCreatorData,
      })
    })

    it("should handle errors", async () => {
      // Arrange
      jest.spyOn(analyticsController as any, "getCreatorAnalytics").mockRejectedValue(new Error("Analytics error"))

      // Act
      await analyticsController.getDashboardData(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(logger.error).toHaveBeenCalledWith("Error getting dashboard analytics:", expect.any(Error))
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to retrieve analytics data",
        code: 500,
      })
    })
  })

  describe("getContentAnalytics", () => {
    it("should return content analytics for the content creator", async () => {
      // Arrange
      mockRequest.params = { contentId: "content123" }
      ;(contentService.getContentById as jest.Mock).mockResolvedValue({
        id: "content123",
        creatorId: "user123",
        title: "Test Content",
      })

      // Mock the private method
      const mockContentData = { views: { total: 1000 } }
      jest.spyOn(analyticsController as any, "getContentAnalyticsData").mockResolvedValue(mockContentData)

      // Act
      await analyticsController.getContentAnalytics(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: mockContentData,
      })
    })

    it("should return content analytics for admin users", async () => {
      // Arrange
      mockRequest.params = { contentId: "content123" }
      mockRequest.user = {
        id: "admin123",
        role: "admin",
      }
      ;(contentService.getContentById as jest.Mock).mockResolvedValue({
        id: "content123",
        creatorId: "creator123",
        title: "Test Content",
      })

      // Mock the private method
      const mockContentData = { views: { total: 1000 } }
      jest.spyOn(analyticsController as any, "getContentAnalyticsData").mockResolvedValue(mockContentData)

      // Act
      await analyticsController.getContentAnalytics(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: mockContentData,
      })
    })

    it("should return 404 if content does not exist", async () => {
      // Arrange
      mockRequest.params = { contentId: "nonexistent" }
      ;(contentService.getContentById as jest.Mock).mockResolvedValue(null)

      // Act
      await analyticsController.getContentAnalytics(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Content not found",
        code: 404,
      })
    })

    it("should return 403 if user is not authorized", async () => {
      // Arrange
      mockRequest.params = { contentId: "content123" }
      mockRequest.user = {
        id: "user456",
        role: "creator",
      }
      ;(contentService.getContentById as jest.Mock).mockResolvedValue({
        id: "content123",
        creatorId: "creator123",
        title: "Test Content",
      })

      // Act
      await analyticsController.getContentAnalytics(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "You don't have permission to access this content's analytics",
        code: 403,
      })
    })

    it("should handle errors", async () => {
      // Arrange
      mockRequest.params = { contentId: "content123" }
      ;(contentService.getContentById as jest.Mock).mockRejectedValue(new Error("Content error"))

      // Act
      await analyticsController.getContentAnalytics(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(logger.error).toHaveBeenCalledWith("Error getting content analytics:", expect.any(Error))
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to retrieve content analytics",
        code: 500,
      })
    })
  })

  describe("getRealTimeAnalytics", () => {
    it("should return real-time analytics", async () => {
      // Arrange
      const mockRealTimeData = {
        eventCounts: { page_viewed: 100 },
        activeUsers: 50,
      }
      ;(analyticsService.getRealTimeStats as jest.Mock).mockResolvedValue(mockRealTimeData)

      // Act
      await analyticsController.getRealTimeAnalytics(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: mockRealTimeData,
      })
    })

    it("should filter data for non-admin users", async () => {
      // Arrange
      const mockRealTimeData = {
        eventCounts: { page_viewed: 100 },
        activeUsers: 50,
      }
      ;(analyticsService.getRealTimeStats as jest.Mock).mockResolvedValue(mockRealTimeData)

      // Act
      await analyticsController.getRealTimeAnalytics(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: expect.any(Object),
      })
    })

    it("should handle errors", async () => {
      // Arrange
      ;(analyticsService.getRealTimeStats as jest.Mock).mockRejectedValue(new Error("Analytics error"))

      // Act
      await analyticsController.getRealTimeAnalytics(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(logger.error).toHaveBeenCalledWith("Error getting real-time analytics:", expect.any(Error))
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to retrieve real-time analytics",
        code: 500,
      })
    })
  })

  describe("exportAnalyticsData", () => {
    it("should export users data as CSV", async () => {
      // Arrange
      mockRequest.query = {
        startDate: "2023-01-01",
        endDate: "2023-01-31",
        type: "users",
      }

      // Mock the private method
      const mockCsvData = "id,username,email\n1,user1,user1@example.com"
      jest.spyOn(analyticsController as any, "generateUsersCsv").mockResolvedValue(mockCsvData)

      // Act
      await analyticsController.exportAnalyticsData(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv")
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        expect.stringContaining("attachment; filename=analytics-users-"),
      )
      expect(mockResponse.send).toHaveBeenCalledWith(mockCsvData)
    })

    it("should validate date formats", async () => {
      // Arrange
      mockRequest.query = {
        startDate: "invalid-date",
        endDate: "2023-01-31",
        type: "users",
      }

      // Act
      await analyticsController.exportAnalyticsData(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid startDate format. Use YYYY-MM-DD",
        code: 400,
      })
    })

    it("should return 400 for invalid export type", async () => {
      // Arrange
      mockRequest.query = {
        startDate: "2023-01-01",
        endDate: "2023-01-31",
        type: "invalid",
      }

      // Act
      await analyticsController.exportAnalyticsData(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid export type",
        code: 400,
      })
    })

    it("should handle errors", async () => {
      // Arrange
      mockRequest.query = {
        startDate: "2023-01-01",
        endDate: "2023-01-31",
        type: "users",
      }

      jest.spyOn(analyticsController as any, "generateUsersCsv").mockRejectedValue(new Error("Export error"))

      // Act
      await analyticsController.exportAnalyticsData(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(logger.error).toHaveBeenCalledWith("Error exporting analytics data:", expect.any(Error))
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to export analytics data",
        code: 500,
      })
    })
  })
})

