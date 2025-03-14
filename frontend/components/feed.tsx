"use client"

import { useState, useCallback, useTransition } from "react"
import { useInfiniteData } from "@/lib/use-data"
import { VirtualizedList } from "@/components/virtualized-list"
import PostCard from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Post } from "@/types"

interface FeedProps {
  initialPosts?: Post[]
  endpoint: string
  pageSize?: number
  emptyMessage?: string
}

export default function Feed({
  initialPosts = [],
  endpoint,
  pageSize = 10,
  emptyMessage = "No posts to display",
}: FeedProps) {
  const [isPending, startTransition] = useTransition()
  const [manuallyLoading, setManuallyLoading] = useState(false)

  const getKey = (pageIndex: number, previousPageData: { posts: Post[] } | null) => {
    // Reached the end
    if (previousPageData && !previousPageData.posts.length) return null

    // First page, we don't have `previousPageData`
    if (pageIndex === 0) return `${endpoint}?page=1&limit=${pageSize}`

    // Add the cursor to the API endpoint
    return `${endpoint}?page=${pageIndex + 1}&limit=${pageSize}`
  }

  const { data, error, size, setSize, isValidating, isLoading } = useInfiniteData<{
    posts: Post[]
    totalPages: number
  }>(getKey, {
    fallbackData: initialPosts.length ? [{ posts: initialPosts, totalPages: 1 }] : undefined,
  })

  const loading = isLoading || isValidating || isPending || manuallyLoading
  const posts = data ? data.flatMap((page) => page.posts) : []
  const isReachingEnd = data && data[data.length - 1]?.posts.length < pageSize
  const totalPages = data?.[0]?.totalPages || 1

  const loadMore = useCallback(() => {
    if (loading || isReachingEnd || size >= totalPages) return

    setManuallyLoading(true)
    startTransition(() => {
      setSize(size + 1).then(() => {
        setManuallyLoading(false)
      })
    })
  }, [loading, isReachingEnd, size, setSize, totalPages])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Failed to load posts</p>
        <Button onClick={() => setSize(1)}>Retry</Button>
      </div>
    )
  }

  if (!loading && posts.length === 0) {
    return <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="space-y-6">
      <VirtualizedList
        items={posts}
        renderItem={(post) => (
          <div className="py-3">
            <PostCard post={post} />
          </div>
        )}
        itemHeight={400} // Approximate height of a post card
        className="pb-6"
        onEndReached={loadMore}
        loading={loading}
        loadingComponent={
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }
        emptyComponent={
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">{emptyMessage}</div>
        }
        keyExtractor={(post) => post.id}
      />

      {!isReachingEnd && size < totalPages && (
        <div className="flex justify-center pb-8">
          <Button onClick={loadMore} disabled={loading} className="flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

