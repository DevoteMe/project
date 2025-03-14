"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"
import type { ModerationQueueItem, ModerationFilter, ModerationStats, ModerationAction } from "@/types/moderation"

interface ModerationContextType {
  queueItems: ModerationQueueItem[]
  isLoading: boolean
  error: string | null
  stats: ModerationStats
  filters: ModerationFilter
  setFilters: (filters: ModerationFilter) => void
  moderateContent: (itemId: string, action: ModerationAction, reason?: string) => Promise<void>
  refreshQueue: () => Promise<void>
}

const ModerationContext = createContext<ModerationContextType | undefined>(undefined)

export function ModerationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [queueItems, setQueueItems] = useState<ModerationQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ModerationStats>({
    pending: 0,
    approved: 0,
    denied: 0,
    quarantined: 0,
    total: 0,
    autoApproved: 0,
  })
  const [filters, setFilters] = useState<ModerationFilter>({
    status: "pending",
    contentType: "all",
    category: undefined,
    search: undefined,
  })
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now())

  // Function to fetch moderation queue
  const fetchModerationQueue = useCallback(async () => {
    if (!session?.user) return

    try {
      setIsLoading(true)

      // Build query string from filters
      const queryParams = new URLSearchParams()
      if (filters.status && filters.status !== "all") queryParams.append("status", filters.status)
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.contentType && filters.contentType !== "all") queryParams.append("contentType", filters.contentType)
      if (filters.search) queryParams.append("search", filters.search)
      if (filters.dateRange) {
        queryParams.append("startDate", filters.dateRange.start.toISOString())
        queryParams.append("endDate", filters.dateRange.end.toISOString())
      }
      queryParams.append("since", lastFetchTime.toString())

      const response = await fetch(`/api/moderation/queue?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch moderation queue")
      }

      const data = await response.json()
      setQueueItems((prevItems) => {
        // Merge new items with existing items, avoiding duplicates
        const existingIds = new Set(prevItems.map((item) => item.id))
        const newItems = data.items.filter((item: ModerationQueueItem) => !existingIds.has(item.id))

        // Update existing items with new data
        const updatedExistingItems = prevItems.map((item) => {
          const updatedItem = data.items.find((newItem: ModerationQueueItem) => newItem.id === item.id)
          return updatedItem || item
        })

        // Filter out items that are no longer in the queue
        const currentIds = new Set(data.items.map((item: ModerationQueueItem) => item.id))
        const filteredExistingItems = updatedExistingItems.filter((item) => currentIds.has(item.id))

        return [...filteredExistingItems, ...newItems]
      })

      setStats(data.stats)
      setLastFetchTime(Date.now())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to fetch moderation queue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [session, filters, lastFetchTime])

  // Function to moderate content
  const moderateContent = async (itemId: string, action: ModerationAction, reason?: string) => {
    if (!session?.user) return

    try {
      // Optimistically update UI
      setQueueItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: action === "approve" ? "approved" : action === "deny" ? "denied" : "quarantined",
                moderatedBy: session.user.id,
                moderatedAt: new Date().toISOString(),
                reason,
              }
            : item,
        ),
      )

      const response = await fetch(`/api/moderation/action/${itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, reason }),
      })

      if (!response.ok) {
        throw new Error("Failed to moderate content")
      }

      // Update stats after successful moderation
      await fetchModerationQueue()

      toast({
        title: "Success",
        description: `Content has been ${action === "approve" ? "approved" : action === "deny" ? "denied" : "quarantined"}`,
      })
    } catch (err) {
      // Revert optimistic update on error
      await fetchModerationQueue()

      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to moderate content",
        variant: "destructive",
      })
    }
  }

  // Function to refresh the queue
  const refreshQueue = async () => {
    await fetchModerationQueue()
  }

  // Initial fetch and polling setup
  useEffect(() => {
    if (session?.user) {
      fetchModerationQueue()

      // Set up polling for real-time updates
      const intervalId = setInterval(() => {
        fetchModerationQueue()
      }, 10000) // Poll every 10 seconds

      return () => clearInterval(intervalId)
    }
  }, [session, fetchModerationQueue])

  // Update countdown timers
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setQueueItems((prevItems) =>
        prevItems.map((item) => {
          if (item.status !== "pending") return item

          const expiresAt = new Date(item.expiresAt).getTime()
          const now = Date.now()

          // If expired, mark as auto-approved
          if (expiresAt <= now) {
            return {
              ...item,
              status: "approved",
              moderatedBy: "system",
              moderatedAt: new Date().toISOString(),
              reason: "Auto-approved due to timeout",
            }
          }

          return item
        }),
      )
    }, 1000) // Update every second

    return () => clearInterval(timerInterval)
  }, [])

  return (
    <ModerationContext.Provider
      value={{
        queueItems,
        isLoading,
        error,
        stats,
        filters,
        setFilters,
        moderateContent,
        refreshQueue,
      }}
    >
      {children}
    </ModerationContext.Provider>
  )
}

export function useModeration() {
  const context = useContext(ModerationContext)
  if (context === undefined) {
    throw new Error("useModeration must be used within a ModerationProvider")
  }
  return context
}

