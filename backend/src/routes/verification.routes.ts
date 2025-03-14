import express from "express"
import { VerificationService } from "../services/verification.service"
import { authenticate } from "../middleware/auth.middleware"
import { isAdmin } from "../middleware/role.middleware"
import { uploadMiddleware } from "../middleware/upload.middleware"

const router = express.Router()
const verificationService = new VerificationService()

// Request email verification
router.post("/email/send", authenticate, async (req, res) => {
  try {
    const result = await verificationService.sendEmailVerification(req.user.id)
    if (result) {
      return res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      })
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      })
    }
  } catch (error) {
    console.error("Error in email verification route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Verify email with token
router.get("/email/verify", async (req, res) => {
  try {
    const { token } = req.query

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      })
    }

    const result = await verificationService.verifyEmail(token)
    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in email verification route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Submit identity verification
router.post("/identity/submit", authenticate, uploadMiddleware.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document uploaded",
      })
    }

    const { documentType } = req.body
    const documentUrl = req.file.path // This would be the URL to the uploaded file

    const result = await verificationService.submitIdentityVerification(req.user.id, documentType, documentUrl)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in identity verification route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Admin: Review identity verification
router.post("/identity/review/:documentId", authenticate, isAdmin, async (req, res) => {
  try {
    const { documentId } = req.params
    const { approved, rejectionReason } = req.body

    const result = await verificationService.reviewIdentityVerification(documentId, approved, rejectionReason)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in identity verification review route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

export default router

