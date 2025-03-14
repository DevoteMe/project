"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Gift, Users, CreditCard, Bell } from "lucide-react"

interface NotificationItemProps {
  id: string
  type:
    | "gift_received"
    | "new_subscriber"
    | "subscription_canceled"
    | "tier_milestone"
    | "payment_success"
    | "payment_failed"
  title: string
  message: string
  createdAt: string
  isRead: boolean
  data?: {
    senderId?: string
    senderName?: string
    senderAvatar?: string
    giftId?: string
    giftName?: string
    subscriberId?: string
    subscriberName?: string
    subscriberAvatar?: string
    tierId?: string
    tierName?: string
    amount?: number
  }
  onMarkAsRead: (id: string) => void
}

export function NotificationItem({
  id,
  type,
  title,
  message,
  createdAt,
  isRead,
  data,
  onMarkAsRead,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getIcon = () => {
    switch (type) {
      case "gift_received":
        return <Gift className="h-5 w-5 text-pink-500" />
      case "new_subscriber":
      case "subscription_canceled":
      case "tier_milestone":
        return <Users className="h-5 w-5 text-blue-500" />
      case "payment_success":
      case "payment_failed":
        return <CreditCard className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getAvatarInfo = () => {
    if (type === "gift_received" && data?.senderName) {
      return {
        name: data.senderName,
        avatar: data.senderAvatar,
      }
    }

    if ((type === "new_subscriber" || type === "subscription_canceled") && data?.subscriberName) {
      return {
        name: data.subscriberName,
        avatar: data.subscriberAvatar,
      }
    }

    return null
  }

  const avatarInfo = getAvatarInfo()

  const handleMarkAsRead = () => {
    if (!isRead) {
      onMarkAsRead(id)
    }
  }

  return (
    <div
      className={`flex items-start p-4 ${isRead ? "bg-background" : "bg-muted/30"} ${isHovered ? "bg-muted/50" : ""} rounded-lg transition-colors`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleMarkAsRead}
    >
      <div className="flex-shrink-0 mr-4">
        {avatarInfo ? (
          <Avatar>
            <AvatarImage src={avatarInfo.avatar} alt={avatarInfo.name} />
            <AvatarFallback>{avatarInfo.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">{getIcon()}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>

          {!isRead && isHovered && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-8 px-2"
              onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead(id)
              }}
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

