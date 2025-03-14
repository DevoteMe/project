import express from "express"
import { BlockService } from "../services/block.service"
import { authenticate } from "../middleware/auth.middleware"

const router = express.Router()
const blockService = new BlockService()

// Block a user
router.post("/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params

    const result = await blockService.blockUser(req.user.id, userId)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in block user route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Unblock a user
router.delete("/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params

    const result = await blockService.unblockUser(req.user.id, userId)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in unblock user route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Get list of blocked users
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await blockService.getBlockedUsers(req.user.id)

    return res.status(result.success ? 200 : 400).json(result)
  } catch (error) {
    console.error("Error in get blocked users route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

// Check if a user is blocked
router.get("/check/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params

    const isBlocked = await blockService.isUserBlocked(req.user.id, userId)

    return res.status(200).json({
      success: true,
      isBlocked,
    })
  } catch (error) {
    console.error("Error in check block status route:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    })
  }
})

export default router

