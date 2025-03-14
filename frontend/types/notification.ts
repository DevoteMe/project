export type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "MENTION" | "SUBSCRIPTION" | "PAYMENT" | "SYSTEM"

export interface Notification {
  id: string
  type: NotificationType
  read: boolean
  createdAt: string
  data: {
    title: string
    body: string
    image?: string
    link?: string
    actionText?: string
    senderId?: string
    senderName?: string
    senderImage?: string
    contentId?: string
    contentType?: string
  }
}

export interface NotificationPreferences {
  email: {
    likes: boolean
    comments: boolean
    follows: boolean
    mentions: boolean
    subscriptions: boolean
    payments: boolean
    system: boolean
  }
  push: {
    likes: boolean
    comments: boolean
    follows: boolean
    mentions: boolean
    subscriptions: boolean
    payments: boolean
    system: boolean
  }
  inApp: {
    likes: boolean
    comments: boolean
    follows: boolean
    mentions: boolean
    subscriptions: boolean
    payments: boolean
    system: boolean
  }
}

