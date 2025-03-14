"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { GiftButton } from "@/components/gifts/gift-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SubscriptionOptions } from "@/components/creator/public-profile/subscription-options"
import { CheckCircle2, MessageCircle, Share2, Flag } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CreatorProfileProps {
  creator: {
    id: string
    username: string
    name: string
    bio: string
    avatar: string
    coverImage: string
    subscriberCount: number
    contentCount: number
    isVerified: boolean
  }
}

export function CreatorProfile({ creator }: CreatorProfileProps) {
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollow = () => {
    setIsFollowing(!isFollowing)

    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing
        ? `You are no longer following ${creator.name}`
        : `You are now following ${creator.name}`,
    })
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(`https://devoteme.com/creator/${creator.username}`)

    toast({
      title: "Link copied",
      description: "Creator profile link copied to clipboard",
    })
  }

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for your report. We will review it shortly.",
    })
  }

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-lg">
        <img
          src={creator.coverImage || "/placeholder.svg"}
          alt={`${creator.name}'s cover`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="relative -mt-16 md:-mt-20">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{creator.name}</h1>
              {creator.isVerified && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
            </div>

            <div className="text-muted-foreground">@{creator.username}</div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-medium">{creator.subscriberCount.toLocaleString()}</span> subscribers
              </div>
              <div>
                <span className="font-medium">{creator.contentCount.toLocaleString()}</span> posts
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleFollow}>
            {isFollowing ? "Following" : "Follow"}
          </Button>

          <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Subscribe</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Subscribe to {creator.name}</DialogTitle>
                <DialogDescription>Choose a subscription tier to unlock exclusive content</DialogDescription>
              </DialogHeader>
              <SubscriptionOptions
                creatorId={creator.id}
                creatorName={creator.name}
                onSubscribe={() => setIsSubscribeDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <GiftButton creatorId={creator.id} />

          <Button variant="ghost" size="icon" asChild>
            <Link href={`/messages/${creator.id}`}>
              <MessageCircle className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleReport}>
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bio */}
      <p className="text-muted-foreground">{creator.bio}</p>
    </div>
  )
}

