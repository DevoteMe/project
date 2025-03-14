import express from "express"
import { chatService } from "../services/chat.service"
import { authenticateJWT } from "../middleware/auth.middleware"

const router = express.Router()

// Create a new chat
router.post("/:receiverId", authenticateJWT, async (req, res) => {
  try {
    const senderId = req.user.userId
    const { receiverId } = req.params

    const chatId = await chatService.createChat(senderId, receiverId)
    res.status(201).json({ chatId })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Send a message
router.post("/:chatId/messages", authenticateJWT, async (req, res) => {
  try {
    const senderId = req.user.userId
    const { chatId } = req.params
    const { content, tipAmount } = req.body

    const messageId = await chatService.sendMessage(chatId, senderId, content, tipAmount)
    res.status(201).json({ messageId })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get chat messages
router.get("/:chatId/messages", authenticateJWT, async (req, res) => {
  try {
    const { chatId } = req.params
    const limit = Number.parseInt(req.query.limit as string) || 20
    const beforeId = req.query.beforeId as string

    const messages = await chatService.getChatMessages(chatId, limit, beforeId)
    res.json(messages)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Mark messages as read
router.put("/:chatId/read", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId
    const { chatId } = req.params

    await chatService.markMessagesAsRead(chatId, userId)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get user chats
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId

    const chats = await chatService.getUserChats(userId)
    res.json(chats)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router

