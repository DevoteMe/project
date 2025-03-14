import express from "express"
import { ActivityService } from "../services/activity.service"
import { authenticate } from "../middleware/auth.middleware"

const router = express.Router()
const activityService = new ActivityService()

// Get user activity history
router.get("/", authenticate, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const type = req.query.type as string

    const result = await activityService.getUserActivity(req.user.id, page, limit, type)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error in get user activity route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Get login history
router.get("/login-history", authenticate, async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit as string) || 5

    const loginHistory = await activityService.getLoginHistory(req.user.id, limit)

    return res.status(200).json({
      success: true,
      data: loginHistory,
    })
  } catch (error) {
    console.error("Error in get login history route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Clear activity history
router.delete("/", authenticate, async (req, res) => {
  try {
    const { olderThan } = req.query

    let olderThanDate: Date | undefined
    if (olderThan) {
      olderThanDate = new Date(olderThan as string)
    }

    const result = await activityService.clearActivityHistory(req.user.id, olderThanDate)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in clear activity history route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

export default router

