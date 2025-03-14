import request from "supertest"
import express from "express"
import analyticsRoutes from "../analytics-routes"
import { authenticate } from "../../middleware/auth.middleware"
import { authorize } from "../../middleware/authorization.middleware"
import { cacheMiddleware } from "../../middleware/cache.middleware"
import { analyticsController } from "../../controllers/analytics.controller"

// Mock dependencies
jest.mock("../../middleware/auth.middleware")
jest.mock("../../middleware/authorization.middleware")
jest.mock("../../middleware/cache.middleware")
jest.mock("../../controllers/analytics.controller")

describe("Analytics Routes", () => {
  let app: express.Application

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup express app
    app = express()
    app.use(express.json())

    // Mock middleware
    ;(authenticate as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: "user123", role: "creator" }
      next()
    })
    ;(authorize as jest.Mock).mockImplementation(() => (req, res, next) => {
      next()
    })
    ;(cacheMiddleware as jest.Mock).mockImplementation(() => (req, res, next) => {
      next()
    })

    // Setup routes
    app.use("/api/analytics", analyticsRoutes)
  })

  describe("GET /dashboard", () => {
    it("should return dashboard data", async () => {
      // Arrange
      ;(analyticsController.getDashboardData as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: "success",
          data: { users: { total: 1000 } },
        })
      })

      // Act
      const response = await request(app).get("/api/analytics/dashboard")

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: "success",
        data: { users: { total: 1000 } },
      })
      expect(authenticate).toHaveBeenCalled()
      expect(authorize).toHaveBeenCalledWith(["admin", "creator"])
      expect(cacheMiddleware).toHaveBeenCalled()
      expect(analyticsController.getDashboardData).toHaveBeenCalled()
    })

    it("should support period query parameter", async () => {
      // Arrange
      ;(analyticsController.getDashboardData as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: "success",
          data: { period: req.query.period },
        })
      })

      // Act
      const response = await request(app).get("/api/analytics/dashboard?period=month")

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: "success",
        data: { period: "month" },
      })
    })
  })

  describe("GET /content/:contentId", () => {
    it("should return content analytics", async () => {
      // Arrange
      ;(analyticsController.getContentAnalytics as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: "success",
          data: { views: { total: 1000 } },
        })
      })

      // Act
      const response = await request(app).get("/api/analytics/content/content123")

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: "success",
        data: { views: { total: 1000 } },
      })
      expect(authenticate).toHaveBeenCalled()
      expect(authorize).toHaveBeenCalledWith(["admin", "creator"])
      expect(cacheMiddleware).toHaveBeenCalled()
      expect(analyticsController.getContentAnalytics).toHaveBeenCalled()
    })
  })

  describe("GET /realtime", () => {
    it("should return real-time analytics", async () => {
      // Arrange
      ;(analyticsController.getRealTimeAnalytics as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: "success",
          data: { activeUsers: 50 },
        })
      })

      // Act
      const response = await request(app).get("/api/analytics/realtime")

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: "success",
        data: { activeUsers: 50 },
      })
      expect(authenticate).toHaveBeenCalled()
      expect(authorize).toHaveBeenCalledWith(["admin", "creator"])
      expect(analyticsController.getRealTimeAnalytics).toHaveBeenCalled()
    })
  })

  describe("GET /export", () => {
    it("should export analytics data", async () => {
      // Arrange
      ;(analyticsController.exportAnalyticsData as jest.Mock).mockImplementation((req, res) => {
        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=analytics-users-2023-01-01.csv")
        res.send("id,username,email\n1,user1,user1@example.com")
      })

      // Act
      const response = await request(app).get(
        "/api/analytics/export?type=users&startDate=2023-01-01&endDate=2023-01-31",
      )

      // Assert
      expect(response.status).toBe(200)
      expect(response.header["content-type"]).toBe("text/csv")
      expect(response.header["content-disposition"]).toContain("attachment; filename=analytics-users-")
      expect(response.text).toBe("id,username,email\n1,user1,user1@example.com")
      expect(authenticate).toHaveBeenCalled()
      expect(authorize).toHaveBeenCalledWith(["admin"])
      expect(analyticsController.exportAnalyticsData).toHaveBeenCalled()
    })
  })
})

