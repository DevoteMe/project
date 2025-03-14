"use client"

import { useState, memo } from "react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"
import type { Post } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageSquare, Share2, Lock } from "lucide-react"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { AccessibleAnnounce } from "@/components/accessible-announce"
import { OptimizedImage } from "@/components/optimized-image"

interface PostCardProps {
  post: Post
}

function PostCardComponent({ post }: PostCardProps) {
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [announcement, setAnnouncement] = useState("")
  const isMobile = useMobile()

  const handleLike = async () => {
    try {
      if (isLiked) {
        await axios.delete(`/posts/${post.id}/like`)
        setIsLiked(false)
        setLikeCount((prev) => prev - 1)
        setAnnouncement(`Unliked post: ${post.title}`)
      } else {
        await axios.post(`/posts/${post.id}/like`)
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
        setAnnouncement(`Liked post: ${post.title}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isPayPerView = post.visibilityType === "PAY_PER_VIEW"
  const isDevotees = post.visibilityType === "DEVOTEES"

  const initials = post.creator.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <AccessibleAnnounce message={announcement} />
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={post.creator.profilePicture || ""}
                alt="" // Decorative image, real info is in the text
              />
              <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link
                  href={`/creator/${post.creator.username}`}
                  className="font-semibold hover:underline"
                  aria-label={`View ${post.creator.username}'s profile`}
                >
                  {post.creator.username}
                </Link>
                {post.creator.isOnline && (
                  <span className="h-2 w-2 rounded-full bg-green-500" aria-label="Online"></span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-video w-full overflow-hidden">
            <OptimizedImage
              src={post.thumbnailUrl || "/placeholder.svg"}
              alt={`Thumbnail for ${post.title}`}
              fill
              className={`object-cover ${isPayPerView || isDevotees ? "blur-sm" : ""}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
            />
            {(isPayPerView || isDevotees) && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30"
                aria-hidden="false"
                role="region"
                aria-label={isPayPerView ? "Pay-per-view content" : "Subscribers only content"}
              >
                <div className="flex flex-col items-center gap-2 text-white">
                  <Lock className="h-8 w-8" aria-hidden="true" />
                  <p className="text-lg font-semibold">{isPayPerView ? "Pay-per-view content" : "Subscribers only"}</p>
                  <Button
                    size="sm"
                    className="mt-2"
                    aria-label={isPayPerView ? `Unlock for $${post.price}` : "Subscribe to view content"}
                  >
                    {isPayPerView ? `Unlock for $${post.price}` : "Subscribe"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            <Link href={`/post/${post.id}`}>
              <h3 className="text-xl font-semibold hover:underline">{post.title}</h3>
            </Link>
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Categories">
              {post.categories.slice(0, isMobile ? 2 : post.categories.length).map(({ category, isMainCategory }) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isMainCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                  aria-label={`Category: ${category.name}${isMainCategory ? " (main category)" : ""}`}
                >
                  {category.name}
                </Link>
              ))}
              {isMobile && post.categories.length > 2 && (
                <span
                  className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs"
                  aria-label={`Plus ${post.categories.length - 2} more categories`}
                >
                  +{post.categories.length - 2} more
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
              onClick={handleLike}
              aria-label={
                isLiked ? `Unlike post. Currently ${likeCount} likes` : `Like post. Currently ${likeCount} likes`
              }
              aria-pressed={isLiked}
            >
              <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
              <span>{likeCount}</span>
            </Button>
            <Link href={`/post/${post.id}#comments`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                aria-label={`View ${post._count.comments} comments`}
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>{post._count.comments}</span>
              </Button>
            </Link>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-1" aria-label="Share post">
            <Share2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(PostCardComponent)

