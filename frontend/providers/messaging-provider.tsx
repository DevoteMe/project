"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { Conversation, Message, MessageWithStatus } from "@/types/message"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"

type MessagingContextType = {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: MessageWithStatus[]
  isLoading: boolean
  isMessageSending: boolean
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, content: string, attachments?: File[]) => Promise<void>
  createConversation: (userIds: string[], name?: string) => Promise<Conversation | null>
  setActiveConversation: (conversation: Conversation | null) => void
  markAsRead: (conversationId: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  archiveConversation: (conversationId: string) => Promise<void>
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<MessageWithStatus[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMessageSending, setIsMessageSending] = useState(false)

  // Fetch user conversations
  const fetchConversations = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/conversations")

      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }

      const data = await response.json()
      setConversations(data.conversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch messages for active conversation
  const fetchMessages = async (conversationId: string) => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()
      setMessages(
        data.messages.map((message: Message) => ({
          ...message,
          status: message.readBy.includes(user.id) ? "read" : "delivered",
        })),
      )

      // Mark messages as read when fetched
      markAsRead(conversationId)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Send a new message
  const sendMessage = async (conversationId: string, content: string, attachments: File[] = []) => {
    if (!user || !content.trim()) return

    // Create temporary message for optimistic UI update
    const tempId = `temp-${Date.now()}`
    const tempMessage: MessageWithStatus = {
      id: tempId,
      conversationId,
      senderId: user.id,
      sender: user,
      content,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readBy: [user.id],
      isDeleted: false,
      status: "sending",
      tempId,
    }

    // Add temp message to state
    setMessages((prev) => [tempMessage, ...prev])

    setIsMessageSending(true)
    try {
      // Upload attachments if any
      let uploadedAttachments = []

      if (attachments.length > 0) {
        // In a real app, implement file uploads here
        // For now, we'll just simulate it
        uploadedAttachments = attachments.map((file, index) => ({
          id: `attachment-${Date.now()}-${index}`,
          type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
          url: URL.createObjectURL(file),
          thumbnailUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          name: file.name,
          size: file.size,
          mimeType: file.type,
        }))
      }

      const messageData = {
        content,
        attachments: uploadedAttachments,
      }

      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Replace temp message with real one
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...data.message, status: "sent" as const } : msg)))

      // Update conversation list to show the latest message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, lastMessage: data.message, updatedAt: data.message.createdAt } : conv,
        ),
      )
    } catch (error) {
      console.error("Error sending message:", error)

      // Update temp message to show error
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "error" as const } : msg)))

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMessageSending(false)
    }
  }

  // Create a new conversation
  const createConversation = async (userIds: string[], name?: string): Promise<Conversation | null> => {
    if (!user) return null

    setIsLoading(true)
    try {
      const conversationData = {
        userIds: [...userIds, user.id],
        type: userIds.length > 1 ? "group" : "direct",
        name: name || undefined,
      }

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversationData),
      })

      if (!response.ok) {
        throw new Error("Failed to create conversation")
      }

      const data = await response.json()

      // Add new conversation to state
      setConversations((prev) => [data.conversation, ...prev])

      return data.conversation
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to mark conversation as read")
      }

      // Update conversations with new unread count
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)))

      // Update message status to read
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          status: msg.senderId !== user.id ? "read" : msg.status,
          readBy: msg.readBy.includes(user.id) ? msg.readBy : [...msg.readBy, user.id],
        })),
      )
    } catch (error) {
      console.error("Error marking conversation as read:", error)
    }
  }

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete message")
      }

      // Update message in state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isDeleted: true, content: "This message was deleted" } : msg,
        ),
      )
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Archive a conversation
  const archiveConversation = async (conversationId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}/archive`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to archive conversation")
      }

      // Update conversation in state
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, isArchived: true } : conv)),
      )

      // If the archived conversation is active, clear it
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null)
      }

      toast({
        title: "Conversation archived",
        description: "The conversation has been archived.",
      })
    } catch (error) {
      console.error("Error archiving conversation:", error)
      toast({
        title: "Error",
        description: "Failed to archive conversation. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch conversations on component mount
  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id)
    } else {
      setMessages([])
    }
  }, [activeConversation])

  const value = useMemo(
    () => ({
      conversations,
      activeConversation,
      messages,
      isLoading,
      isMessageSending,
      fetchConversations,
      fetchMessages,
      sendMessage,
      createConversation,
      setActiveConversation,
      markAsRead,
      deleteMessage,
      archiveConversation,
    }),
    [conversations, activeConversation, messages, isLoading, isMessageSending],
  )

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>
}

export const useMessaging = () => {
  const context = useContext(MessagingContext)

  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider")
  }

  return context
}

