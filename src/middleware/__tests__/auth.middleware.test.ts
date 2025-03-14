import { authenticateJWT, isAdmin, isContentCreator } from "../auth.middleware"
import { userService } from "../../services/user.service"
import { UserType } from "@prisma/client"

// Mock dependencies
jest.mock("../../services/user.service", () => ({
  userService: {
    verifyToken: jest.fn(),
  },
}))

describe("Auth Middleware", () => {
  let req: any
  let res: any
  let next: jest.Mock

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
    jest.clearAllMocks()
  })

  describe("authenticateJWT", () => {
    it("should call next() when token is valid", () => {
      // Setup
      req.headers.authorization = "Bearer valid_token"
      ;(userService.verifyToken as jest.Mock).mockReturnValue({ userId: "user123" })

      // Execute
      authenticateJWT(req, res, next)

      // Assert
      expect(userService.verifyToken).toHaveBeenCalledWith("valid_token")
      expect(req.user).toEqual({ userId: "user123" })
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it("should return 401 when authorization header is missing", () => {
      // Execute
      authenticateJWT(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: "Authorization header missing" })
      expect(next).not.toHaveBeenCalled()
    })

    it("should return 401 when token is missing", () => {
      // Setup
      req.headers.authorization = "Bearer "

      // Execute
      authenticateJWT(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: "Token missing" })
      expect(next).not.toHaveBeenCalled()
    })

    it("should return 401 when token is invalid", () => {
      // Setup
      req.headers.authorization = "Bearer invalid_token"
      ;(userService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token")
      })

      // Execute
      authenticateJWT(req, res, next)

      // Assert
      expect(userService.verifyToken).toHaveBeenCalledWith("invalid_token")
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe("isAdmin", () => {
    it("should call next() when user is admin", () => {
      // Setup
      req.user = { userType: UserType.ADMIN }

      // Execute
      isAdmin(req, res, next)

      // Assert
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it("should return 401 when user is not authenticated", () => {
      // Execute
      isAdmin(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" })
      expect(next).not.toHaveBeenCalled()
    })

    it("should return 403 when user is not admin", () => {
      // Setup
      req.user = { userType: UserType.USER }

      // Execute
      isAdmin(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden: Admin access required" })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe("isContentCreator", () => {
    it("should call next() when user is content creator", () => {
      // Setup
      req.user = { userType: UserType.CONTENT_CREATOR }

      // Execute
      isContentCreator(req, res, next)

      // Assert
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it("should call next() when user is admin", () => {
      // Setup
      req.user = { userType: UserType.ADMIN }

      // Execute
      isContentCreator(req, res, next)

      // Assert
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it("should return 401 when user is not authenticated", () => {
      // Execute
      isContentCreator(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" })
      expect(next).not.toHaveBeenCalled()
    })

    it("should return 403 when user is not content creator or admin", () => {
      // Setup
      req.user = { userType: UserType.USER }

      // Execute
      isContentCreator(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden: Content creator access required" })
      expect(next).not.toHaveBeenCalled()
    })
  })
})

