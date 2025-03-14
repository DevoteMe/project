import { Router } from "express"
import { MfaService } from "../services/mfa.service"
import { authenticateJWT } from "../middleware/auth.middleware"
import { PrismaClient } from "@prisma/client"

const router = Router()
const mfaService = new MfaService()
const prisma = new PrismaClient()

/**
 * Generate MFA secret
 * @route POST /api/v1/mfa/generate
 * @access Private
 */
router.post("/generate", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const result = await mfaService.generateMfaSecret(userId)

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error generating MFA secret:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate MFA secret",
    })
  }
})

/**
 * Enable MFA
 * @route POST /api/v1/mfa/enable
 * @access Private
 */
router.post("/enable", authenticateJWT, async (req, res) => {
  try {
    const { secret, token } = req.body
    const userId = req.user.id

    if (!secret || !token) {
      return res.status(400).json({
        success: false,
        message: "Secret and token are required",
      })
    }

    const result = await mfaService.enableMfa(userId, secret, token)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      })
    }

    res.status(200).json({
      success: true,
      message: "MFA enabled successfully",
      backupCodes: result.backupCodes,
    })
  } catch (error) {
    console.error("Error enabling MFA:", error)
    res.status(500).json({
      success: false,
      message: "Failed to enable MFA",
    })
  }
})

/**
 * Disable MFA
 * @route POST /api/v1/mfa/disable
 * @access Private
 */
router.post("/disable", authenticateJWT, async (req, res) => {
  try {
    const { token } = req.body
    const userId = req.user.id

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      })
    }

    const result = await mfaService.disableMfa(userId, token)

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      })
    }

    res.status(200).json({
      success: true,
      message: "MFA disabled successfully",
    })
  } catch (error) {
    console.error("Error disabling MFA:", error)
    res.status(500).json({
      success: false,
      message: "Failed to disable MFA",
    })
  }
})

/**
 * Verify MFA token during login
 * @route POST /api/v1/mfa/verify
 * @access Public
 */
router.post("/verify", async (req, res) => {
  try {
    const { userId, token, isBackupCode } = req.body

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: "User ID and token are required",
      })
    }

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

    res.status(200).json({
      success: true,
      message: "Token verified successfully",
    })
  } catch (error) {
    console.error("Error verifying MFA token:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify token",
    })
  }
})

export default router

