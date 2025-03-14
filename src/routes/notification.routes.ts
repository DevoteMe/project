import express from "express"
import { notificationService } from "../services/notification.service"
import { authenticateJWT } from "../middleware/auth.middleware"

const router = express.Router()

// Get user notifications
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const type = req.query.type as string
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20

    const notifications = await notificationService.getUserNotifications(userId, type, page, limit)
    res.json(notifications)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Mark notification as read
router.put("/:id/read", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    await notificationService.markAsRead(userId, id)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Mark all notifications as read
router.put("/read-all", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const type = req.query.type as string

    await notificationService.markAllAsRead(userId, type)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Delete notification
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    await notificationService.deleteNotification(userId, id)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router

