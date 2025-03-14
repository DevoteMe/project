"use client"

import { useState } from "react"
import { NotificationItem } from "@/components/notifications/notification-item"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

// Mock data for demonstration
const mockNotifications = [
  {
    id: "n1",
    type: "gift_received" as const,
    title: "New Gift Received",
    message: 'Alex Johnson sent you a Heart: "Love your content!"',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isRead: false,
    data: {
      senderId: "u1",
      senderName: "Alex Johnson",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      giftId: "g1",
      giftName: "Heart",
    },
  },
  {
    id: "n2",
    type: "new_subscriber" as const,
    title: "New Subscriber",
    message: "Sarah Miller subscribed to your Silver Supporter tier!",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    isRead: true,
    data: {
      subscriberId: "u2",
      subscriberName: "Sarah Miller",
      subscriberAvatar: "/placeholder.svg?height=40&width=40",
      tierId: "2",
      tierName: "Silver Supporter",
    },
  },
  {
    id: "n3",
    type: "payment_success" as const,
    title: "Payment Received",
    message: "You received $19.99 from Michael Brown for Gold Supporter subscription",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    isRead: false,
    data: {
      subscriberId: "u3",
      subscriberName: "Michael Brown",
      amount: 19.99,
      tierId: "3",
      tierName: "Gold Supporter",
    },
  },
  {
    id: "n4",
    type: "subscription_canceled" as const,
    title: "Subscription Canceled",
    message: "Emily Davis canceled their Bronze Supporter subscription",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    data: {
      subscriberId: "u4",
      subscriberName: "Emily Davis",
      subscriberAvatar: "/placeholder.svg?height=40&width=40",
      tierId: "1",
      tierName: "Bronze Supporter",
    },
  },
  {
    id: "n5",
    type: "tier_milestone" as const,
    title: "Tier Milestone Reached",
    message: "Your Silver Supporter tier has reached 50 subscribers!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: false,
    data: {
      tierId: "2",
      tierName: "Silver Supporter",
    },
  },
]

export function MonetizationNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    if (activeTab === "subscriptions")
      return ["new_subscriber", "subscription_canceled", "tier_milestone"].includes(notification.type)
    if (activeTab === "gifts") return notification.type === "gift_received"
    if (activeTab === "payments") return ["payment_success", "payment_failed"].includes(notification.type)
    return true
  })

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))

    toast({
      title: "All notifications marked as read",
      description: `${unreadCount} notifications have been marked as read.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-2">{unreadCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="gifts">Gifts</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No notifications to display</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} {...notification} onMarkAsRead={handleMarkAsRead} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

