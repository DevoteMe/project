import type { User } from "./user"

export type MessageAttachment = {
  id: string
  type: "image" | "video" | "file"
  url: string
  thumbnailUrl?: string
  name: string
  size: number
  mimeType: string
  width?: number
  height?: number
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  sender?: User
  content: string
  attachments: MessageAttachment[]
  createdAt: string
  updatedAt: string
  readBy: string[]
  isDeleted: boolean
}

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "error"

export type MessageWithStatus = Message & {
  status: MessageStatus
  tempId?: string // Used for optimistic updates
}

export type ConversationType = "direct" | "group"

export type ConversationMember = {
  userId: string
  user?: User
  role: "admin" | "member"
  joinedAt: string
}

export type Conversation = {
  id: string
  type: ConversationType
  name?: string // For group conversations
  avatar?: string // For group conversations
  members: ConversationMember[]
  lastMessage?: Message
  createdAt: string
  updatedAt: string
  unreadCount: number
  isArchived: boolean
}

