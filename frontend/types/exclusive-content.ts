export type AccessLevel = "public" | "subscribers" | "tier-specific"

export interface ContentAccess {
  id: string
  contentId: string
  accessLevel: AccessLevel
  allowedTierIds?: string[]
  previewEnabled: boolean
  previewPercentage?: number
  createdAt: string
  updatedAt: string
}

export interface ExclusiveContentStats {
  totalExclusiveContent: number
  contentByAccessLevel: {
    accessLevel: AccessLevel
    count: number
  }[]
  engagementRate: number
  conversionRate: number
}

