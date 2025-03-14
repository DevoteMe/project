import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { config } from "../config/app-config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Initialize Firebase Admin
const firebaseApp = initializeApp({
  credential: cert({
    projectId: config.firebase.projectId,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
})

const firestore = getFirestore(firebaseApp)

export class ChatService {
  /**
   * Create a new chat between two users
   * @param senderId Sender user ID
   * @param receiverId Receiver user ID
   */
  async createChat(senderId: string, receiverId: string): Promise<string> {
    try {
      // Check if chat already exists
      const existingChat = await this.getChatId(senderId, receiverId)

      if (existingChat) {
        return existingChat
      }

      // Create a new chat document
      const chatRef = firestore.collection("chats").doc()
      const chatId = chatRef.id

      await chatRef.set({
        participants: [senderId, receiverId],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessage: null,
      })

      return chatId
    } catch (error) {
      console.error("Error creating chat:", error)
      throw new Error("Failed to create chat")
    }
  }

  /**
   * Get chat ID between two users if it exists
   * @param userId1 First user ID
   * @param userId2 Second user ID
   */
  async getChatId(userId1: string, userId2: string): Promise<string | null> {
    try {
      const chatsSnapshot = await firestore.collection("chats").where("participants", "array-contains", userId1).get()

      for (const doc of chatsSnapshot.docs) {
        const chat = doc.data()
        if (chat.participants.includes(userId2)) {
          return doc.id
        }
      }

      return null
    } catch (error) {
      console.error("Error getting chat ID:", error)
      throw new Error("Failed to get chat ID")
    }
  }

  /**
   * Send a message in a chat
   * @param chatId Chat ID
   * @param senderId Sender user ID
   * @param content Message content
   * @param tipAmount Optional tip amount
   */
  async sendMessage(chatId: string, senderId: string, content: string, tipAmount?: number): Promise<string> {
    try {
      // Get chat document
      const chatDoc = await firestore.collection("chats").doc(chatId).get()

      if (!chatDoc.exists) {
        throw new Error("Chat not found")
      }

      const chat = chatDoc.data()

      if (!chat || !chat.participants.includes(senderId)) {
        throw new Error("User not in chat")
      }

      // Get receiver ID
      const receiverId = chat.participants.find((id: string) => id !== senderId)

      // Create message document
      const messageRef = firestore.collection("chats").doc(chatId).collection("messages").doc()
      const messageId = messageRef.id
      const now = new Date()

      await messageRef.set({
        id: messageId,
        senderId,
        content,
        tipAmount: tipAmount || null,
        createdAt: now,
        readAt: null,
      })

      // Update chat document with last message
      await firestore
        .collection("chats")
        .doc(chatId)
        .update({
          lastMessage: {
            content,
            senderId,
            createdAt: now,
          },
          updatedAt: now,
        })

      // Create message in database for analytics and backup
      await prisma.message.create({
        data: {
          id: messageId,
          senderId,
          receiverId,
          content,
          tipAmount: tipAmount || undefined,
          createdAt: now,
        },
      })

      // Create notification for receiver
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: "MESSAGE",
          content: tipAmount ? `You received a message with a $${tipAmount} tip` : "You received a new message",
          relatedUserId: senderId,
        },
      })

      return messageId
    } catch (error) {
      console.error("Error sending message:", error)
      throw new Error("Failed to send message")
    }
  }

  /**
   * Mark messages as read
   * @param chatId Chat ID
   * @param userId User ID marking messages as read
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const now = new Date()

      // Get unread messages
      const messagesSnapshot = await firestore
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .where("senderId", "!=", userId)
        .where("readAt", "==", null)
        .get()

      // Update each message
      const batch = firestore.batch()

      messagesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { readAt: now })
      })

      await batch.commit()

      // Update messages in database
      const messageIds = messagesSnapshot.docs.map((doc) => doc.id)

      if (messageIds.length > 0) {
        await prisma.message.updateMany({
          where: {
            id: { in: messageIds },
          },
          data: {
            readAt: now,
          },
        })
      }
    } catch (error) {
      console.error("Error marking messages as read:", error)
      throw new Error("Failed to mark messages as read")
    }
  }

  /**
   * Get chat messages
   * @param chatId Chat ID
   * @param limit Number of messages to retrieve
   * @param beforeId Message ID to retrieve messages before
   */
  async getChatMessages(chatId: string, limit = 20, beforeId?: string): Promise<any[]> {
    try {
      let query = firestore
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("createdAt", "desc")
        .limit(limit)

      if (beforeId) {
        const beforeDoc = await firestore.collection("chats").doc(chatId).collection("messages").doc(beforeId).get()

        if (beforeDoc.exists) {
          query = query.startAfter(beforeDoc)
        }
      }

      const messagesSnapshot = await query.get()

      return messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error getting chat messages:", error)
      throw new Error("Failed to get chat messages")
    }
  }

  /**
   * Get user chats
   * @param userId User ID
   */
  async getUserChats(userId: string): Promise<any[]> {
    try {
      const chatsSnapshot = await firestore
        .collection("chats")
        .where("participants", "array-contains", userId)
        .orderBy("updatedAt", "desc")
        .get()

      const chats = []

      for (const doc of chatsSnapshot.docs) {
        const chat = doc.data()
        const otherUserId = chat.participants.find((id: string) => id !== userId)

        // Get other user details
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            username: true,
            profilePicture: true,
            isOnline: true,
            lastSeen: true,
          },
        })

        // Get unread count
        const unreadCount = await firestore
          .collection("chats")
          .doc(doc.id)
          .collection("messages")
          .where("senderId", "==", otherUserId)
          .where("readAt", "==", null)
          .get()
          .then((snap) => snap.size)

        chats.push({
          id: doc.id,
          otherUser,
          lastMessage: chat.lastMessage,
          updatedAt: chat.updatedAt.toDate(),
          unreadCount,
        })
      }

      return chats
    } catch (error) {
      console.error("Error getting user chats:", error)
      throw new Error("Failed to get user chats")
    }
  }
}

export const chatService = new ChatService()

