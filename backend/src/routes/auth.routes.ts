import express from "express"
import { authService } from "../services/auth.service"
import { mfaService } from "../services/mfa.service"
import { prisma } from "../utils/prisma"

const router = express.Router()

// Add to the existing auth routes

/**
 * Login with MFA
 * @route POST /api/v1/auth/login
 * @access Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    const result = await authService.loginWithMfa(email, password)

    if (result.requiresMfa) {
      return res.status(200).json({
        success: true,
        requiresMfa: true,
        userId: result.userId,
      })
    }

    res.status(200).json({
      success: true,
      requiresMfa: false,
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    console.error("Error during login:", error)
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }
})

/**
 * Complete MFA login
 * @route POST /api/v1/auth/mfa-login
 * @access Public
 */
router.post("/mfa-login", async (req, res) => {
  try {
    const { userId, token, isBackupCode } = req.body

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: "User ID and token are required",
      })
    }

    // Verify MFA token
    let isValid = false

    if (isBackupCode) {
      isValid = await mfaService.verifyBackupCode(userId, token)
    } else {
      // Get user's MFA secret
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { mfaSecret: true },
      })

      if (!user || !user.mfaSecret) {
        return res.status(400).json({
          success: false,
          message: "User not found or MFA not enabled",
        })
      }

      isValid = mfaService.verifyToken(user.mfaSecret, token)
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      })
    }

    // Complete login
    const result = await authService.completeMfaLogin(userId)

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    console.error("Error during MFA login:", error)
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    })
  }
})

export default router

