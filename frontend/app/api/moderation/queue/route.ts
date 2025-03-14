import { type NextRequest, NextResponse } from "next/server"
import type { ModerationQueueItem, ModerationStatus } from "@/types/moderation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock data for moderation queue
const mockQueueItems: ModerationQueueItem[] = Array.from({ length: 20 }, (_, i) => {
  const createdAt = new Date()
  createdAt.setMinutes(createdAt.getMinutes() - Math.floor(Math.random() * 60))

  const expiresAt = new Date(createdAt)
  expiresAt.setSeconds(expiresAt.getSeconds() + 60)

  const contentTypes = ["post", "comment", "message"] as const
  const statuses = ["pending", "approved", "denied", "quarantined"] as const
  const categories = [
    "Art",
    "Music",
    "Photography",
    "Writing",
    "Gaming",
    "Technology",
    "Fitness",
    "Cooking",
    "Fashion",
    "Travel",
  ]

  return {
    id: `item-${i + 1}`,
    contentId: `content-${i + 1}`,
    contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
    creatorId: `user-${Math.floor(Math.random() * 10) + 1}`,
    creatorName: `User ${Math.floor(Math.random() * 10) + 1}`,
    creatorAvatar: `/placeholder.svg?height=40&width=40`,
    content: `This is a sample ${contentTypes[Math.floor(Math.random() * contentTypes.length)]} content that needs moderation. It contains some text that might  * contentTypes.length)]} content that needs moderation. It contains some text that might be flagged for review by our automated system.`,
    mediaUrls:
      Math.random() > 0.7
        ? [`/placeholder.svg?height=300&width=400`, `/placeholder.svg?height=300&width=400`]
        : undefined,
    category: Math.random() > 0.3 ? categories[Math.floor(Math.random() * categories.length)] : undefined,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: i < 10 ? "pending" : statuses[Math.floor(Math.random() * statuses.length)],
    moderatedBy: i < 10 ? undefined : `moderator-${Math.floor(Math.random() * 3) + 1}`,
    moderatedAt: i < 10 ? undefined : new Date().toISOString(),
    reason: i < 10 ? undefined : Math.random() > 0.7 ? "This content violates our community guidelines." : undefined,
  }
})

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin or moderator role
  if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status") as ModerationStatus | "all" | null
  const category = searchParams.get("category")
  const contentType = searchParams.get("contentType")
  const search = searchParams.get("search")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  // Filter items based on query parameters
  let filteredItems = [...mockQueueItems]

  if (status && status !== "all") {
    filteredItems = filteredItems.filter((item) => item.status === status)
  }

  if (category) {
    filteredItems = filteredItems.filter((item) => item.category === category)
  }

  if (contentType && contentType !== "all") {
    filteredItems = filteredItems.filter((item) => item.contentType === contentType)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredItems = filteredItems.filter(
      (item) =>
        item.content.toLowerCase().includes(searchLower) || item.creatorName.toLowerCase().includes(searchLower),
    )
  }

  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    filteredItems = filteredItems.filter((item) => {
      const itemDate = new Date(item.createdAt)
      return itemDate >= start && itemDate <= end
    })
  }

  // Calculate stats
  const stats = {
    pending: mockQueueItems.filter((item) => item.status === "pending").length,
    approved: mockQueueItems.filter((item) => item.status === "approved").length,
    denied: mockQueueItems.filter((item) => item.status === "denied").length,
    quarantined: mockQueueItems.filter((item) => item.status === "quarantined").length,
    total: mockQueueItems.length,
    autoApproved: mockQueueItems.filter((item) => item.status === "approved" && item.moderatedBy === "system").length,
  }

  return NextResponse.json({
    items: filteredItems,
    stats,
  })
}

