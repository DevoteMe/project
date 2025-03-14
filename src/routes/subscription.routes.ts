import express from "express"
import { subscriptionService } from "../services/subscription.service"
import { authenticateJWT } from "../middleware/auth.middleware"

const router = express.Router()

// Subscribe to a content creator
router.post("/:creatorId", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const { creatorId } = req.params

    const subscription = await subscriptionService.subscribe(userId, creatorId)
    res.status(201).json(subscription)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Cancel subscription
router.delete("/:subscriptionId", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const { subscriptionId } = req.params

    await subscriptionService.cancelSubscription(userId, subscriptionId)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get user's subscriptions
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const subscriptions = await subscriptionService.getUserSubscriptions(userId)
    res.json(subscriptions)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get content creator's subscribers
router.get("/subscribers", authenticateJWT, async (req, res) => {
  try {
    const creatorId = req.user.userId
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20

    const subscribers = await subscriptionService.getCreatorSubscribers(creatorId, page, limit)
    res.json(subscribers)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router

