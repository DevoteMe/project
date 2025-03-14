"use client"

import { useState } from "react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"
import type { Comment } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, Send } from 'lucide-react'
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { AccessibleAnnounce } from "@/components/accessible-announce"

interface CommentListProps {
  comments: Comment[]
  postId: string
}

export default function CommentList({ comments, postId }: CommentListProps) {
  const [announcement, setAnnouncement] = useState("")

  if (comments.length === 0) {
    return (
      <div 
        className="text-center py-8 text-muted-foreground" 
        aria-live="polite"
      >
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AccessibleAnnounce message={announcement} />
      <h3 className="sr-only">Comments</h3>
      {comments.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          postId={postId} 
          onAnnouncement={setAnnouncement}
        />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  postId: string
  onAnnouncement: (message: string) => void
}

function CommentItem({ comment, postId, onAnnouncement }: CommentItemProps) {
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment._count?.likes || 0)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [replies, setReplies] = useState<Comment[]>(comment.replies || [])
  const [showAllReplies, setShowAllReplies] = useState(false)

  const handleLike = async () => {
    try {
      // This would require a backend endpoint for liking comments
      // For now, we'll just toggle the state
      setIsLiked(!isLiked)
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
      onAnnouncement(isLiked ? "Comment unliked" : "Comment liked")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return

    setIsSubmittingReply(true)
    try {
      const { data } = await axios.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parentId: comment.id,
      })
      setReplies([...replies, data])
      setReplyContent("")
      setIsReplying(false)
      onAnnouncement("Reply posted successfully")
      toast({
        title: "Success",
        description: "Reply posted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const initials = comment.user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const visibleReplies = showAllReplies ? replies : replies.slice(0, 3)
  const hasMoreReplies = replies.length > 3 && !showAllReplies

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.profilePicture || ""} alt="" />
            <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/profile/${comment.user.username}`} 
                className="font-semibold hover:underline"
                aria-label={`View ${comment.user.username}'s profile`}
              >
                {comment.user.username}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="mt-1">{comment.content}</p>
            <div className="mt-2 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 h-auto py-1 px-2 ${isLiked ? "text-red-500" : ""}`}
                onClick={handleLike}
                aria-label={isLiked ? `Unlike comment. Currently ${likeCount} likes` : `Like comment. Currently ${likeCount} likes`}
                aria-pressed={isLiked}
              >
                <Heart className="h-3 w-3" fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
                <span className="text-xs">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 h-auto py-1 px-2"
                onClick={() => setIsReplying(!isReplying)}
                aria-expanded={isReplying}
                aria-controls={`reply-form-${comment.id}`}
              >
                <MessageSquare className="h-3 w-3" aria-hidden="true" />
                <span className="text-xs">Reply</span>
              </Button>
            </div>

            {isReplying && (
              <div className="mt-3" id={`reply-form-${comment.id}`}>
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="mb-2 text-sm"
                  aria-label="Reply to comment"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsReplying(false)}
                    aria-label="Cancel reply"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isSubmittingReply}
                    className="flex items-center gap-1"
                    aria-label={isSubmittingReply ? "Posting reply..." : "Post reply"}
                  >
                    {isSubmittingReply ? "Posting..." : "Reply"}
                    <Send className="h-3 w-3 ml-1" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}

            {replies.length > 0 && (
              <div 
                className="mt-4 pl-4 border-l-2 border-muted"
                aria-label={`${replies.length} replies to this comment`}
              >
                {visibleReplies.map((reply) => (
                  <div key={reply.id} className="mb-3">
                    <div className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={reply.user.profilePicture || ""} alt="" />
                        <AvatarFallback className="text-xs">
                          {reply.user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${reply.user.username}`}
                            className="text-sm font-semibold hover:underline"
                            aria-label={`View ${reply.user.username}'s profile`}
                          >
                            {reply.user.username}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {hasMoreReplies && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAllReplies(true)} 
                    className="text-xs"
                    aria-label={`Show all ${replies.length} replies`}
                    aria-expanded="false"
                  >
                    Show all {replies.length} replies
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

