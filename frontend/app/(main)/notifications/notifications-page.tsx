"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import type { Notification } from "@/types"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatRelativeTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Bell, Heart, MessageSquare, Users, Zap, Info } from "lucide-react"

export function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get("/notifications", {
        params: {
          type: activeTab !== "all" ? activeTab : undefined,
        },
      })
      setNotifications(data.notifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // For demo purposes, set some mock data
      const mockNotifications = Array.from({ length: 10 }, (_, i) => ({
        id: `notification-${i}`,
        type: ["COMMENT", "LIKE", "DEVOTEE", "TIP", "PROMOTION", "MESSAGE", "SYSTEM"][Math.floor(Math.random() * 7)],
        content: `This is notification ${i}`,
        isRead: Math.random() > 0.3,
        createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
        relatedUserId: Math.random() > 0.5 ? `user-${i}` : undefined,
        relatedPostId: Math.random() > 0.5 ? `post-${i}` : undefined,
        relatedCommentId: Math.random() > 0.5 ? `comment-${i}` : undefined,
      }))
      setNotifications(mockNotifications)
    } finally {
      setIsLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put("/notifications/read-all", {
        type: activeTab !== "all" ? activeTab : undefined,
      })
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      )
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      })
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`/notifications/${id}`)
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      toast({
        title: "Success",
        description: "Notification deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [activeTab])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "COMMENT":
        return <MessageSquare className="h-5 w-5" />
      case "LIKE":
        return <Heart className="h-5 w-5" />
      case "DEVOTEE":
        return <Users className="h-5 w-5" />
      case "TIP":
        return <Zap className="h-5 w-5" />
      case "MESSAGE":
        return <MessageSquare className="h-5 w-5" />
      case "PROMOTION":
        return <Zap className="h-5 w-5" />
      case "SYSTEM":
        return <Info className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "COMMENT":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
      case "LIKE":
        return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
      case "DEVOTEE":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
      case "TIP":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
      case "MESSAGE":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
      case "PROMOTION":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
      case "SYSTEM":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="COMMENT">Comments</TabsTrigger>
          <TabsTrigger value="LIKE">Likes</TabsTrigger>
          <TabsTrigger value="DEVOTEE">Devotees</TabsTrigger>
          <TabsTrigger value="TIP">Tips</TabsTrigger>
          <TabsTrigger value="MESSAGE">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No notifications</h2>
              <p className="text-muted-foreground">You don't have any notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    !notification.isRead ? "bg-muted/50" : ""
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="mb-1">{notification.content}</p>
                    <p className="text-sm text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

