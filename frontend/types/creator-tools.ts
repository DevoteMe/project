// Draft types
export interface Draft {
  id: string
  title: string
  content: string
  categoryId: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Scheduled Post types
export interface ScheduledPost {
  id: string
  title: string
  content: string
  scheduledFor: string
  timezone: string
  status: "scheduled" | "published" | "failed"
  categoryId: string
  tags: string[]
  recurringPattern?: RecurringPattern
  createdAt: string
  updatedAt: string
}

export interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly"
  interval: number
  endDate?: string
  daysOfWeek?: number[] // 0-6, Sunday to Saturday
  dayOfMonth?: number // 1-31
}

// Template types
export interface Template {
  id: string
  name: string
  description: string
  content: string
  category: string
  isDefault: boolean
  isPublic: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Analytics types
export interface PostAnalytics {
  postId: string
  title: string
  publishDate: string
  views: number
  uniqueViews: number
  likes: number
  comments: number
  shares: number
  bookmarks: number
  averageReadTime: number // in seconds
  bounceRate: number // percentage
  clickthroughRate: number // percentage
}

export interface AudienceDemographics {
  ageGroups: { label: string; value: number }[]
  genders: { label: string; value: number }[]
  locations: { country: string; value: number }[]
  devices: { type: string; value: number }[]
}

export interface GrowthTrend {
  period: string
  followers: number
  engagement: number
  revenue: number
}

