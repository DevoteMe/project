export type ModerationStatus = "pending" | "approved" | "denied" | "quarantined"

export type ModerationAction = "approve" | "deny" | "quarantine"

export interface ModerationQueueItem {
  id: string
  contentId: string
  contentType: "post" | "comment" | "message"
  creatorId: string
  creatorName: string
  creatorAvatar: string
  content: string
  mediaUrls?: string[]
  category?: string
  createdAt: string
  expiresAt: string // When auto-approval will happen
  status: ModerationStatus
  moderatedBy?: string
  moderatedAt?: string
  reason?: string
}

export interface ModerationFilter {
  status?: ModerationStatus | "all"
  category?: string
  contentType?: "post" | "comment" | "message" | "all"
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export interface ModerationStats {
  pending: number
  approved: number
  denied: number
  quarantined: number
  total: number
  autoApproved: number
}

