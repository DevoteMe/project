import express from "express"
import { NotificationPreferenceService } from "../services/notification-preference.service"
import { authenticate } from "../middleware/auth.middleware"

const router = express.Router()
const notificationPreferenceService = new NotificationPreferenceService()

// Get notification preferences
router.get("/", authenticate, async (req, res) => {
  try {
    const preferences = await notificationPreferenceService.getPreferences(req.user.id)

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: "Notification preferences not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: preferences,
    })
  } catch (error) {
    console.error("Error in get notification preferences route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Update notification preferences
router.put("/", authenticate, async (req, res) => {
  try {
    const preferences = req.body

    const result = await notificationPreferenceService.updatePreferences(req.user.id, preferences)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in update notification preferences route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

export default router

