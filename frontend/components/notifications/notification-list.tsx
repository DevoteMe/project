"use client"

import { useNotifications } from "@/providers/notification-provider"
import { NotificationItem } from "@/components/notifications/notification-item"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationList() {
  const { notifications, unreadCount, loading, error, markAllAsRead } = useNotifications()

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
      <div className="flex h-[300px] flex-col items-center justify-center p-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">No notifications yet</p>
        <p className="text-xs text-muted-foreground">
          Notifications will appear here when you receive likes, comments, or new followers
        </p>
      </div>
    )
  }

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between px-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={handleMarkAllAsRead}>
            <Check className="h-3 w-3" />
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

        <ScrollArea className="h-[400px] px-4">
          <TabsContent value="all" className="mt-2">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </TabsContent>

          <TabsContent value="unread" className="mt-2">
            {unreadNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </TabsContent>

          <TabsContent value="read" className="mt-2">
            {readNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}

