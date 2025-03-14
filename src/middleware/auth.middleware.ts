import type { Request, Response, NextFunction } from "express"
import { userService } from "../services/user.service"
import { UserType } from "@prisma/client"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" })
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token missing" })
  }

  try {
    const decoded = userService.verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.user.userType !== UserType.ADMIN) {
    return res.status(403).json({ error: "Forbidden: Admin access required" })
  }

  next()
}

/**
 * Middleware to check if user is a content creator
 */
export const isContentCreator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.user.userType !== UserType.CONTENT_CREATOR && req.user.userType !== UserType.ADMIN) {
    return res.status(403).json({ error: "Forbidden: Content creator access required" })
  }

  next()
}

