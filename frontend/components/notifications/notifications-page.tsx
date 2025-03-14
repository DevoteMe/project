"use client"

import { useNotifications } from "@/providers/notification-provider"
import { NotificationItem } from "@/components/notifications/notification-item"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Loader2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export function NotificationsPage() {
  const { notifications, unreadCount, loading, error, markAllAsRead, refreshNotifications } = useNotifications()

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load notifications"
        description="We couldn't load your notifications. Please try again."
        action={<Button onClick={refreshNotifications}>Try Again</Button>}
      />
    )
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        description="When you receive likes, comments, or new followers, they'll appear here."
        icon="bell"
      />
    )
  }

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread" disabled={unreadNotifications.length === 0}>
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="read" disabled={readNotifications.length === 0}>
            Read
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </TabsContent>

        <TabsContent value="unread" className="mt-4 space-y-4">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">No unread notifications</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="read" className="mt-4 space-y-4">
          {readNotifications.length > 0 ? (
            readNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">No read notifications</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

