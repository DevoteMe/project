import { UserService } from "../user.service"
import { PrismaClient, UserType } from "@prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { paymentService } from "../payment.service"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("../payment.service", () => ({
  paymentService: {
    createCustomer: jest.fn().mockResolvedValue("cus_test123"),
  },
}))

const prisma = new PrismaClient()
const userService = new UserService()

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      // Mock Prisma responses
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
        userType: UserType.USER,
      })

      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        userType: UserType.USER,
      }

      const result = await userService.createUser(userData)

      // Assertions
      expect(prisma.user.findFirst).toHaveBeenCalled()
      expect(prisma.user.create).toHaveBeenCalled()
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10)
      expect(paymentService.createCustomer).toHaveBeenCalled()
      expect(result).toEqual({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
        userType: UserType.USER,
      })
    })

    it("should throw an error if user already exists", async () => {
      // Mock Prisma response for existing user
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
      })

      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        userType: UserType.USER,
      }

      // Assertions
      await expect(userService.createUser(userData)).rejects.toThrow("User already exists")
      expect(prisma.user.findFirst).toHaveBeenCalled()
      expect(prisma.user.create).not.toHaveBeenCalled()
    })
  })

  describe("authenticateUser", () => {
    it("should authenticate a user successfully", async () => {
      // Mock Prisma response
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
        passwordHash: "hashed_password",
        userType: UserType.USER,
      })

      // Mock bcrypt compare
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await userService.authenticateUser("test@example.com", "password123")

      // Assertions
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed_password")
      expect(prisma.user.update).toHaveBeenCalled() // For updating lastSeen
      expect(jwt.sign).toHaveBeenCalledTimes(2) // For access and refresh tokens
      expect(result).toHaveProperty("user")
      expect(result).toHaveProperty("accessToken")
      expect(result).toHaveProperty("refreshToken")
    })

    it("should throw an error for invalid credentials", async () => {
      // Mock Prisma response
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
        passwordHash: "hashed_password",
        userType: UserType.USER,
      })

      // Mock bcrypt compare to return false
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Assertions
      await expect(userService.authenticateUser("test@example.com", "wrong_password")).rejects.toThrow(
        "Invalid credentials",
      )
      expect(prisma.user.findUnique).toHaveBeenCalled()
      expect(bcrypt.compare).toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })

  // Add more tests for other methods...
})

