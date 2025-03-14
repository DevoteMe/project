import express from "express"
import { userService } from "../services/user.service"
import { authenticateJWT } from "../middleware/auth.middleware"
import multer from "multer"
import { bunnyCDNService } from "../services/bunny-cdn.service"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, userType, country, googleId, facebookId } = req.body
    const user = await userService.createUser({
      username,
      email,
      password,
      userType,
      country,
      googleId,
      facebookId,
    })
    res.status(201).json(user)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await userService.authenticateUser(email, password)
    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

// Get user profile
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await userService.getUserProfile(userId)
    res.json(user)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Update user profile
router.put("/profile", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const profileData = req.body
    const user = await userService.updateUserProfile(userId, profileData)
    res.json(user)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Upload profile picture
router.post("/profile/picture", authenticateJWT, upload.single("profilePicture"), async (req, res) => {
  try {
    const userId = req.user.userId
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const filename = `profile-${Date.now()}-${file.originalname}`
    const profilePictureUrl = await bunnyCDNService.uploadFile(file.buffer, filename, `profiles/${userId}`)

    const user = await userService.updateUserProfile(userId, {
      profilePicture: profilePictureUrl,
    })

    res.json({ profilePicture: profilePictureUrl })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Become a content creator
router.post("/become-creator", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const { referralCode } = req.body
    const result = await userService.setUserAsContentCreator(userId, referralCode)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Set devotional price
router.post("/devotional-price", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const { price } = req.body
    const result = await userService.setDevotionalPrice(userId, price)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get user by username
router.get("/by-username/:username", async (req, res) => {
  try {
    const { username } = req.params
    const user = await userService.getUserByUsername(username)
    res.json(user)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get user's referral link
router.get("/referral-link", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const referralLink = await userService.getReferralLink(userId)
    res.json({ referralLink })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router

