export interface User {
  id: string
  username: string
  email: string
  userType: "USER" | "CONTENT_CREATOR" | "ADMIN"
  profilePicture?: string
  profileText?: string
  country?: string
  createdAt: string
  lastSeen: string
  isOnline: boolean
  contentCreator?: ContentCreator
}

export interface ContentCreator {
  id: string
  userId: string
  devotionalPrice?: number
  activityScore: number
  isNsfw: boolean
  totalPosts: number
  totalComments: number
  totalLikes: number
  totalViews: number
  totalDevotees: number
}

export interface Post {
  id: string
  creatorId: string
  title: string
  contentUrl: string
  thumbnailUrl: string
  blurredPreviewUrl?: string // Add this line
  visibilityType: "PUBLIC" | "FOLLOWERS" | "DEVOTEES" | "PAY_PER_VIEW"
  price?: number
  freeForDevotees: boolean
  createdAt: string
  updatedAt: string
  isNsfw: boolean
  creator: {
    id: string
    username: string
    profilePicture?: string
    isOnline: boolean
    lastSeen: string
    contentCreator?: {
      devotionalPrice?: number
    }
  }
  categories: {
    category: {
      id: string
      name: string
    }
    isMainCategory: boolean
  }[]
  _count: {
    likes: number
    comments: number
  }
}

export interface Category {
  id: string
  name: string
  isFixed: boolean
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    profilePicture?: string
  }
  replies?: Comment[]
  _count?: {
    replies: number
    likes: number
  }
}

export interface Subscription {
  id: string
  userId: string
  creatorId: string
  price: number
  startDate: string
  endDate?: string
  status: "ACTIVE" | "CANCELED" | "EXPIRED"
  creator: {
    id: string
    username: string
    profilePicture?: string
    isOnline: boolean
    lastSeen: string
    contentCreator?: {
      devotionalPrice?: number
    }
  }
}

export interface Notification {
  id: string
  userId: string
  type: "COMMENT" | "LIKE" | "DEVOTEE" | "TIP" | "PROMOTION" | "MESSAGE" | "SYSTEM"
  content: string
  isRead: boolean
  createdAt: string
  relatedUserId?: string
  relatedPostId?: string
  relatedCommentId?: string
}

export interface Chat {
  id: string
  otherUser: {
    id: string
    username: string
    profilePicture?: string
    isOnline: boolean
    lastSeen: string
  }
  lastMessage: {
    content: string
    senderId: string
    createdAt: string
  }
  updatedAt: string
  unreadCount: number
}

export interface Message {
  id: string
  senderId: string
  content: string
  createdAt: string
  readAt?: string
  tipAmount?: number
}

export interface PremiumSpot {
  id: string
  creatorId: string
  categoryId: string
  startTime: string
  endTime: string
  price: number
  category: Category
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

