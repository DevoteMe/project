import request from "supertest"
import express from "express"
import userRoutes from "../user.routes"
import { userService } from "../../services/user.service"

// Mock dependencies
jest.mock("../../services/user.service", () => ({
  userService: {
    createUser: jest.fn(),
    authenticateUser: jest.fn(),
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    setUserAsContentCreator: jest.fn(),
    setDevotionalPrice: jest.fn(),
    getUserByUsername: jest.fn(),
    getReferralLink: jest.fn(),
    verifyToken: jest.fn(),
  },
}))

jest.mock("../../services/bunny-cdn.service", () => ({
  bunnyCDNService: {
    uploadFile: jest.fn(),
  },
}))

jest.mock("../../middleware/auth.middleware", () => ({
  authenticateJWT: (req: any, res: any, next: any) => {
    req.user = { userId: "user123" }
    next()
  },
}))

// Setup express app
const app = express()
app.use(express.json())
app.use("/api/users", userRoutes)

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST /register", () => {
    it("should register a new user", async () => {
      // Mock service response
      ;(userService.createUser as jest.Mock).mockResolvedValue({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
      })

      // Execute request
      const response = await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        userType: "USER",
      })

      // Assert
      expect(response.status).toBe(201)
      expect(userService.createUser).toHaveBeenCalled()
      expect(response.body).toHaveProperty("id", "user123")
    })

    it("should return 400 on validation error", async () => {
      // Mock service to throw error
      ;(userService.createUser as jest.Mock).mockRejectedValue(new Error("User already exists"))

      // Execute request
      const response = await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("error", "User already exists")
    })
  })

  describe("POST /login", () => {
    it("should authenticate a user", async () => {
      // Mock service response
      ;(userService.authenticateUser as jest.Mock).mockResolvedValue({
        user: {
          id: "user123",
          username: "testuser",
        },
        accessToken: "access_token",
        refreshToken: "refresh_token",
      })

      // Execute request
      const response = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "password123",
      })

      // Assert
      expect(response.status).toBe(200)
      expect(userService.authenticateUser).toHaveBeenCalledWith("test@example.com", "password123")
      expect(response.body).toHaveProperty("accessToken", "access_token")
    })

    it("should return 401 on authentication failure", async () => {
      // Mock service to throw error
      ;(userService.authenticateUser as jest.Mock).mockRejectedValue(new Error("Invalid credentials"))

      // Execute request
      const response = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "wrong_password",
      })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error", "Invalid credentials")
    })
  })

  // Add more tests for other routes...
})

