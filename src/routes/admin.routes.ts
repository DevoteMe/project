import express from "express"
import { adminService } from "../services/admin.service"
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware"

const router = express.Router()

// Apply authentication middleware to all admin routes
router.use(authenticateJWT)
router.use(isAdmin)

// Get admin settings
router.get("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params
    const value = await adminService.getSetting(key)
    res.json({ key, value })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Update admin settings
router.put("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params
    const { value } = req.body
    const setting = await adminService.updateSetting(key, value)
    res.json(setting)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await adminService.getAllCategories()
    res.json(categories)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Create a new category
router.post("/categories", async (req, res) => {
  try {
    const { name, isFixed } = req.body
    const category = await adminService.createCategory(name, isFixed)
    res.status(201).json(category)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Update a category
router.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const category = await adminService.updateCategory(id, name)
    res.json(category)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Delete a category
router.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params
    await adminService.deleteCategory(id)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get moderation queue
router.get("/moderation", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const queue = await adminService.getModerationQueue(page, limit)
    res.json(queue)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Moderate a post
router.post("/moderation/:postId", async (req, res) => {
  try {
    const { postId } = req.params
    const { approved, rejectionReason } = req.body
    const post = await adminService.moderatePost(postId, approved, rejectionReason)
    res.json(post)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get platform statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await adminService.getPlatformStats()
    res.json(stats)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router

