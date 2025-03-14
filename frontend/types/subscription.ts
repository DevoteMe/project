export type SubscriptionBillingPeriod = "monthly" | "quarterly" | "yearly"

export interface SubscriptionTier {
  id: string
  creatorId: string
  name: string
  description: string
  price: number
  billingPeriod: SubscriptionBillingPeriod
  features: string[]
  color?: string
  isDefault?: boolean
  isPublic: boolean
  maxSubscribers?: number
  currentSubscribers: number
  createdAt: string
  updatedAt: string
}

export interface SubscriptionStats {
  totalSubscribers: number
  totalRevenue: number
  activeSubscriptions: number
  tierDistribution: {
    tierId: string
    tierName: string
    subscriberCount: number
    percentage: number
  }[]
  revenueByPeriod: {
    period: string
    amount: number
  }[]
  retentionRate: number
}

export interface UserSubscription {
  id: string
  userId: string
  creatorId: string
  tierId: string
  tierName: string
  startDate: string
  endDate: string
  autoRenew: boolean
  status: "active" | "canceled" | "expired" | "pending"
  price: number
  billingPeriod: SubscriptionBillingPeriod
}

