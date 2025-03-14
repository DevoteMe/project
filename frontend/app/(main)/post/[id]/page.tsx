"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import axios from "@/lib/axios"
import type { Post, Comment } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDateTime, formatPrice } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Heart, MessageSquare, Share2, Lock, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import CommentList from "@/components/comment-list"

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const fetchPost = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get(`/posts/${id}`, {
        params: { userId: user?.id },
      })
      setPost(data)
      setLikeCount(data._count.likes)
      setCommentCount(data._count.comments)
      // Check if user has liked the post - this would require a separate endpoint
      // For now, we'll just set it to false
      setIsLiked(false)
    } catch (error) {
      console.error("Error fetching post:", error)
      toast({
        title: "Error",
        description: "Failed to load post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data } = await axios.get(`/posts/${id}/comments`)
      setComments(data.comments)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleLike = async () => {
    try {
      if (isLiked) {
        await axios.delete(`/posts/${id}/like`)
        setIsLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        await axios.post(`/posts/${id}/like`)
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const { data } = await axios.post(`/posts/${id}/comments`, {
        content: newComment,
      })
      setComments((prev) => [data, ...prev])
      setNewComment("")
      setCommentCount((prev) => prev + 1)
      toast({
        title: "Success",
        description: "Comment posted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handlePurchase = async () => {
    if (!post) return

    setIsPurchasing(true)
    try {
      await axios.post(`/posts/${id}/purchase`)
      toast({
        title: "Success",
        description: "Purchase successful! You can now view this content.",
      })
      fetchPost() // Refresh post data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to purchase content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleSubscribe = async () => {
    if (!post) return

    try {
      await axios.post(`/subscriptions/${post.creatorId}`)
      toast({
        title: "Success",
        description: "Subscription successful! You are now a devotee.",
      })
      fetchPost() // Refresh post data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (id) {
      fetchPost()
      fetchComments()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Post not found</h2>
        <p className="text-muted-foreground mb-6">
          The post you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button asChild>
          <Link href="/feed">Back to Feed</Link>
        </Button>
      </div>
    )
  }

  const isPayPerView = post.visibilityType === "PAY_PER_VIEW"
  const isDevotees = post.visibilityType === "DEVOTEES"
  const canViewContent =
    post.visibilityType === "PUBLIC" ||
    user?.id === post.creatorId ||
    // In a real app, we would check if the user has purchased this content or is subscribed
    false

  const initials = post.creator.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="py-6">
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.creator.profilePicture || ""} alt={post.creator.username} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link href={`/creator/${post.creator.username}`} className="font-semibold hover:underline">
                  {post.creator.username}
                </Link>
                {post.creator.isOnline && <span className="h-2 w-2 rounded-full bg-green-500" title="Online"></span>}
              </div>
              <span className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <h1 className="px-4 py-2 text-2xl font-bold">{post.title}</h1>
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {post.categories.map(({ category, isMainCategory }) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isMainCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div className="relative aspect-video w-full overflow-hidden">
            {canViewContent ? (
              // This would be a video player or image depending on content type
              <Image src={post.contentUrl || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
            ) : (
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  // Use the blurred preview URL if available, otherwise use the thumbnail
                  src={post.blurredPreviewUrl || post.thumbnailUrl || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Lock className="h-8 w-8" />
                    <p className="text-lg font-semibold">
                      {isPayPerView ? "Pay-per-view content" : "Subscribers only"}
                    </p>
                    {isPayPerView && post.price && (
                      <Button size="lg" className="mt-2" onClick={handlePurchase} disabled={isPurchasing}>
                        {isPurchasing ? "Processing..." : `Unlock for ${formatPrice(post.price)}`}
                      </Button>
                    )}
                    {isDevotees && post.creator.contentCreator?.devotionalPrice && (
                      <Button size="lg" className="mt-2" onClick={handleSubscribe}>
                        Subscribe for {formatPrice(post.creator.contentCreator.devotionalPrice)}/month
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
              onClick={handleLike}
            >
              <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{commentCount}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8" id="comments">
        <h2 className="text-xl font-bold mb-4">Comments</h2>

        {user && (
          <div className="mb-6">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmittingComment}
              className="flex items-center gap-2"
            >
              {isSubmittingComment ? "Posting..." : "Post Comment"}
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        <CommentList comments={comments} postId={id as string} />
      </div>
    </div>
  )
}

