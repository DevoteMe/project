export interface Gift {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  isAnimated: boolean
  isLimited: boolean
  availableUntil?: string
  createdAt: string
  updatedAt: string
}

export interface GiftPurchase {
  id: string
  giftId: string
  senderId: string
  recipientId: string
  contentId?: string
  message?: string
  price: number
  createdAt: string
}

export interface GiftStats {
  totalReceived: number
  totalRevenue: number
  popularGifts: {
    giftId: string
    giftName: string
    count: number
    imageUrl: string
  }[]
  revenueByPeriod: {
    period: string
    amount: number
  }[]
}

