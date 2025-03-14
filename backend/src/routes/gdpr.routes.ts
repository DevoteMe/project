import express from "express"
import { GDPRService } from "../services/gdpr.service"
import { authenticate } from "../middleware/auth.middleware"
import path from "path"

const router = express.Router()
const gdprService = new GDPRService()

// Export user data
router.get("/export", authenticate, async (req, res) => {
  try {
    const result = await gdprService.exportUserData(req.user.id)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to export data",
      })
    }

    if (!result.filePath) {
      return res.status(500).json({
        success: false,
        message: "Export file path not found",
      })
    }

    // Send file for download
    const filename = path.basename(result.filePath)
    res.download(result.filePath, `devoteme_data_export_${Date.now()}.json`, (err) => {
      if (err) {
        console.error("Error sending file:", err)
        return res.status(500).json({
          success: false,
          message: "Error sending file",
        })
      }

      // Delete the file after sending
      // This is optional, you might want to keep exports for a period of time
      // fs.unlinkSync(result.filePath);
    })
  } catch (error) {
    console.error("Error in data export route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Schedule account deletion
router.post("/delete/schedule", authenticate, async (req, res) => {
  try {
    const { gracePeriod } = req.body
    const daysGracePeriod = Number.parseInt(gracePeriod) || 30 // Default to 30 days

    const result = await gdprService.scheduleAccountDeletion(req.user.id, daysGracePeriod)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in schedule deletion route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Cancel scheduled account deletion
router.post("/delete/cancel", authenticate, async (req, res) => {
  try {
    const result = await gdprService.cancelScheduledDeletion(req.user.id)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in cancel deletion route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Immediate account deletion
router.post("/delete/immediate", authenticate, async (req, res) => {
  try {
    const result = await gdprService.deleteUserAccount(req.user.id)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in immediate deletion route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

export default router

