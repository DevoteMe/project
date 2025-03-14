import express from "express"
import { postService } from "../services/post.service"
import { authenticateJWT, isContentCreator } from "../middleware/auth.middleware"
import multer from "multer"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Create a new post
router.post(
  "/",
  authenticateJWT,
  isContentCreator,
  upload.fields([
    { name: "content", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.userId
      const postData = req.body

      // Get uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }

      if (!files.content || !files.thumbnail) {
        return res.status(400).json({ error: "Content and thumbnail files are required" })
      }

      const contentFile = files.content[0]
      const thumbnailFile = files.thumbnail[0]

      // Parse categories
      const categories = JSON.parse(postData.categories || "[]")

      const post = await postService.createPost(
        userId,
        {
          title: postData.title,
          visibilityType: postData.visibilityType,
          price: postData.price ? Number.parseFloat(postData.price) : undefined,
          freeForDevotees: postData.freeForDevotees === "true",
          isNsfw: postData.isNsfw === "true",
          categories,
          mainCategory: postData.mainCategory,
        },
        contentFile,
        thumbnailFile,
      )

      res.status(201).json(post)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
)

// Get discovery posts
router.get("/discovery", async (req, res) => {
  try {
    const categoryId = req.query.categoryId as string
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 12
    const userId = req.query.userId as string

    const posts = await postService.getDiscoveryPosts(categoryId, page, limit, userId)
    res.json(posts)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get premium creators for a category
router.get("/premium-creators/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params
    const creators = await postService.getPremiumCreators(categoryId)
    res.json(creators)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get feed posts
router.get("/feed", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    const posts = await postService.getFeedPosts(userId, page, limit)
    res.json(posts)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get post by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.query.userId as string

    const post = await postService.getPostById(id, userId)
    res.json(post)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Like a post
router.post("/:id/like", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const like = await postService.likePost(id, userId)
    res.json(like)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Unlike a post
router.delete("/:id/like", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    await postService.unlikePost(id, userId)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Add comment to a post
router.post("/:id/comments", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId
    const { content, parentId } = req.body

    const comment = await postService.addComment(id, userId, content, parentId)
    res.status(201).json(comment)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    const comments = await postService.getComments(id, page, limit)
    res.json(comments)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Purchase pay-per-view content
router.post("/:id/purchase", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const result = await postService.purchasePost(id, userId)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router

