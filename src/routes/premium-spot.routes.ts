import express from "express"
import { premiumSpotService } from "../services/premium-spot.service"
import { authenticateJWT, isContentCreator } from "../middleware/auth.middleware"

const router = express.Router()

// Get premium spot options
router.get("/options", async (req, res) => {
  try {
    const options = await premiumSpotService.getPremiumSpotOptions()
    res.json(options)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Purchase premium spot
router.post("/:categoryId", authenticateJWT, isContentCreator, async (req, res) => {
  try {
    const userId = req.user.userId
    const { categoryId } = req.params
    const { optionId } = req.body

    const result = await premiumSpotService.purchasePremiumSpot(userId, categoryId, optionId)
    res.status(201).json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get user's premium spots
router.get("/", authenticateJWT, isContentCreator, async (req, res) => {
  try {
    const userId = req.user.userId

    const spots = await premiumSpotService.getUserPremiumSpots(userId)
    res.json(spots)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router

