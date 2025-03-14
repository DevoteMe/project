"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Post, User } from "@/types"
import { SearchIcon, UserIcon, FileText, Loader2, X } from "lucide-react"
import EmptyState from "@/components/empty-state"
import PostCard from "@/components/post-card"
import CreatorCard from "@/components/creator-card"

export default function SearchPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialTab = searchParams.get("tab") || "all"

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    posts: Post[]
    creators: User[]
  }>({
    posts: [],
    creators: [],
  })

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults({ posts: [], creators: [] })
      return
    }

    setIsSearching(true)
    try {
      const { data } = await axios.get(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchResults(data)

      // Update URL with search query and tab
      const params = new URLSearchParams()
      params.set("q", searchQuery)
      params.set("tab", activeTab)
      router.push(`/search?${params.toString()}`)
    } catch (error) {
      console.error("Error searching:", error)
      toast({
        title: "Error",
        description: "Failed to search. Please try again.",
        variant: "destructive",
      })

      // Generate mock data for demonstration
      const mockPosts: Post[] = Array.from({ length: 3 }).map((_, i) => ({
        id: `post-${i}`,
        creatorId: `creator-${i}`,
        title: `Post containing "${searchQuery}" - ${i + 1}`,
        contentUrl: "",
        thumbnailUrl: "",
        visibilityType: "PUBLIC",
        freeForDevotees: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isNsfw: false,
        creator: {
          id: `creator-${i}`,
          username: `user${i}`,
          profilePicture: null,
          isOnline: Math.random() > 0.5,
          lastSeen: new Date().toISOString(),
          contentCreator: {
            devotionalPrice: 9.99,
          },
        },
        categories: [
          {
            category: {
              id: "category1",
              name: `Category ${i + 1}`,
            },
            isMainCategory: true,
          },
        ],
        _count: {
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
        },
      }))

      const mockCreators: User[] = Array.from({ length: 2 }).map((_, i) => ({
        id: `creator-${i}`,
        username: `user_${searchQuery}_${i}`,
        email: `user${i}@example.com`,
        userType: "CONTENT_CREATOR",
        profilePicture: null,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isOnline: Math.random() > 0.5,
        contentCreator: {
          id: `cc-${i}`,
          userId: `creator-${i}`,
          activityScore: 4,
          isNsfw: false,
          totalPosts: Math.floor(Math.random() * 50),
          totalComments: Math.floor(Math.random() * 100),
          totalLikes: Math.floor(Math.random() * 500),
          totalViews: Math.floor(Math.random() * 1000),
          totalDevotees: Math.floor(Math.random() * 50),
        },
      }))

      setSearchResults({
        posts: mockPosts,
        creators: mockCreators,
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update URL with search query and tab
    if (query) {
      const params = new URLSearchParams()
      params.set("q", query)
      params.set("tab", value)
      router.push(`/search?${params.toString()}`)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      handleSearch(initialQuery)
    }
  }, [])

  const hasResults = searchResults.posts.length > 0 || searchResults.creators.length > 0
  const hasPosts = searchResults.posts.length > 0
  const hasCreators = searchResults.creators.length > 0

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for creators or posts..."
                className="pl-9 pr-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit" disabled={isSearching || !query.trim()}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {query ? (
        isSearching ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Searching for "{query}"...</p>
            </div>
          </div>
        ) : hasResults ? (
          <>
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">
                  All Results {searchResults.posts.length + searchResults.creators.length}
                </TabsTrigger>
                <TabsTrigger value="creators">Creators {searchResults.creators.length}</TabsTrigger>
                <TabsTrigger value="posts">Posts {searchResults.posts.length}</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {hasCreators && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Creators</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {searchResults.creators.slice(0, 4).map((creator) => (
                        <CreatorCard key={creator.id} creator={creator} />
                      ))}
                    </div>
                    {searchResults.creators.length > 4 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={() => handleTabChange("creators")}>
                          View all {searchResults.creators.length} creators
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {hasPosts && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.posts.slice(0, 6).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                    {searchResults.posts.length > 6 && (
                      <div className="mt-6 text-center">
                        <Button variant="outline" onClick={() => handleTabChange("posts")}>
                          View all {searchResults.posts.length} posts
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="creators">
                {hasCreators ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {searchResults.creators.map((creator) => (
                      <CreatorCard key={creator.id} creator={creator} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<UserIcon className="h-12 w-12" />}
                    title="No creators found"
                    description={`No creators match "${query}". Try a different search term.`}
                  />
                )}
              </TabsContent>

              <TabsContent value="posts">
                {hasPosts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText className="h-12 w-12" />}
                    title="No posts found"
                    description={`No posts match "${query}". Try a different search term.`}
                  />
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <EmptyState
            icon={<SearchIcon className="h-12 w-12" />}
            title="No results found"
            description={`No results found for "${query}". Try a different search term.`}
          />
        )
      ) : (
        <EmptyState
          icon={<SearchIcon className="h-12 w-12" />}
          title="Search for creators and posts"
          description="Enter a search term to find creators and posts."
        />
      )}
    </div>
  )
}

