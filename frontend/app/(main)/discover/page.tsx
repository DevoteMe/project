"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import type { Category, Post } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInView } from "react-intersection-observer"
import PostCard from "@/components/post-card"
import CreatorCard from "@/components/creator-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function DiscoverPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [premiumCreators, setPremiumCreators] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const { ref, inView } = useInView()

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/admin/categories")
      setCategories(data)
      if (data.length > 0) {
        setSelectedCategory(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchPosts = async (reset = false) => {
    if (isLoading || (!hasMore && !reset)) return

    setIsLoading(true)
    try {
      const currentPage = reset ? 1 : page
      const { data } = await axios.get(`/posts/discovery`, {
        params: {
          categoryId: selectedCategory,
          page: currentPage,
          limit: 12,
        },
      })

      if (data.posts.length === 0) {
        setHasMore(false)
      } else {
        setPosts(reset ? data.posts : (prev) => [...prev, ...data.posts])
        setPage(reset ? 2 : (prev) => prev + 1)
        setHasMore(currentPage < data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching discovery posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPremiumCreators = async () => {
    if (!selectedCategory) return

    try {
      const { data } = await axios.get(`/posts/premium-creators/${selectedCategory}`)
      setPremiumCreators(data)
    } catch (error) {
      console.error("Error fetching premium creators:", error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      setPosts([])
      setPage(1)
      setHasMore(true)
      fetchPosts(true)
      fetchPremiumCreators()
    }
  }, [selectedCategory])

  useEffect(() => {
    if (inView && activeTab === "posts") {
      fetchPosts()
    }
  }, [inView, activeTab])

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Discover</h1>

      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {premiumCreators.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured Creators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {premiumCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="posts" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="creators">Creators</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {posts.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No posts found</h2>
              <p className="text-muted-foreground">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {hasMore && (
            <div ref={ref} className="flex justify-center py-8">
              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more posts...</span>
                </div>
              )}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">You've reached the end of the posts.</div>
          )}
        </TabsContent>

        <TabsContent value="creators">
          <CreatorsList categoryId={selectedCategory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CreatorsList({ categoryId }: { categoryId: string | null }) {
  const [creators, setCreators] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { ref, inView } = useInView()

  const fetchCreators = async (reset = false) => {
    if (isLoading || (!hasMore && !reset) || !categoryId) return

    setIsLoading(true)
    try {
      const currentPage = reset ? 1 : page
      // This is a placeholder API endpoint - you'll need to implement this on the backend
      const { data } = await axios.get(`/creators`, {
        params: {
          categoryId,
          page: currentPage,
          limit: 12,
        },
      })

      if (data.creators.length === 0) {
        setHasMore(false)
      } else {
        setCreators(reset ? data.creators : (prev) => [...prev, ...data.creators])
        setPage(reset ? 2 : (prev) => prev + 1)
        setHasMore(currentPage < data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching creators:", error)
      // For demo purposes, set some mock data
      const mockCreators = Array.from({ length: 12 }, (_, i) => ({
        id: `creator-${i}`,
        username: `creator${i}`,
        profilePicture: null,
        isOnline: Math.random() > 0.5,
        contentCreator: {
          devotionalPrice: 9.99,
          totalPosts: Math.floor(Math.random() * 100),
          totalDevotees: Math.floor(Math.random() * 1000),
        },
      }))
      setCreators(mockCreators)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (categoryId) {
      setCreators([])
      setPage(1)
      setHasMore(true)
      fetchCreators(true)
    }
  }, [categoryId])

  useEffect(() => {
    if (inView) {
      fetchCreators()
    }
  }, [inView])

  return (
    <>
      {creators.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No creators found</h2>
          <p className="text-muted-foreground">Try selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more creators...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && creators.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">You've reached the end of the creators list.</div>
      )}
    </>
  )
}

