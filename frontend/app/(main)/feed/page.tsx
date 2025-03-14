"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import axios from "@/lib/axios"
import type { Post } from "@/types"
import PostCard from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { ref, inView } = useInView()

  const fetchPosts = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const { data } = await axios.get(`/posts/feed?page=${page}&limit=10`)

      if (data.posts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prev) => [...prev, ...data.posts])
        setPage((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error fetching feed posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (inView) {
      fetchPosts()
    }
  }, [inView])

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>

      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Your feed is empty</h2>
          <p className="text-muted-foreground mb-6">Subscribe to content creators to see their posts in your feed.</p>
          <Button asChild>
            <a href="/discover">Discover Creators</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {hasMore && (
            <div ref={ref} className="flex justify-center py-4">
              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more posts...</span>
                </div>
              )}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">You've reached the end of your feed.</div>
          )}
        </div>
      )}
    </div>
  )
}

