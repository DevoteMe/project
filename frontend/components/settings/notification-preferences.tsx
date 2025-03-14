"use client"

import { useNotifications } from "@/providers/notification-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { NotificationPreferences as Preferences } from "@/types/notification"

export function NotificationPreferences() {
  const { preferences, loading, updatePreferences } = useNotifications()
  const { toast } = useToast()

  if (loading || !preferences) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleToggle = async (channel: keyof Preferences, type: keyof Preferences["email"], value: boolean) => {
    try {
      const newPreferences = {
        ...preferences,
        [channel]: {
          ...preferences[channel],
          [type]: value,
        },
      }

      await updatePreferences(newPreferences)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      })
    }
  }

  const NotificationToggle = ({
    channel,
    type,
    label,
    description,
  }: {
    channel: keyof Preferences
    type: keyof Preferences["email"]
    label: string
    description: string
  }) => {
    const isEnabled = preferences[channel][type]

    return (
      <div className="flex items-start justify-between space-y-0 py-4">
        <div className="space-y-0.5">
          <div className="font-medium">{label}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => handleToggle(channel, type, checked)}
          aria-label={`${label} notifications ${isEnabled ? "enabled" : "disabled"}`}
        />
      </div>
    )
  }

  return (
    <Tabs defaultValue="inApp" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="inApp">In-App</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="push">Push</TabsTrigger>
      </TabsList>

      <TabsContent value="inApp">
        <Card>
          <CardHeader>
            <CardTitle>In-App Notifications</CardTitle>
            <CardDescription>Manage notifications that appear within the DevoteMe platform</CardDescription>
          </CardHeader>
          <CardContent className="border-t pt-6">
            <NotificationToggle
              channel="inApp"
              type="likes"
              label="Likes"
              description="When someone likes your content"
            />
            <NotificationToggle
              channel="inApp"
              type="comments"
              label="Comments"
              description="When someone comments on your content"
            />
            <NotificationToggle channel="inApp" type="follows" label="Follows" description="When someone follows you" />
            <NotificationToggle
              channel="inApp"
              type="mentions"
              label="Mentions"
              description="When someone mentions you in a comment or post"
            />
            <NotificationToggle
              channel="inApp"
              type="subscriptions"
              label="Subscriptions"
              description="When someone subscribes to your content"
            />
            <NotificationToggle
              channel="inApp"
              type="payments"
              label="Payments"
              description="Payment and transaction updates"
            />
            <NotificationToggle
              channel="inApp"
              type="system"
              label="System"
              description="Important updates about DevoteMe"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Manage notifications sent to your email address</CardDescription>
          </CardHeader>
          <CardContent className="border-t pt-6">
            <NotificationToggle
              channel="email"
              type="likes"
              label="Likes"
              description="When someone likes your content"
            />
            <NotificationToggle
              channel="email"
              type="comments"
              label="Comments"
              description="When someone comments on your content"
            />
            <NotificationToggle channel="email" type="follows" label="Follows" description="When someone follows you" />
            <NotificationToggle
              channel="email"
              type="mentions"
              label="Mentions"
              description="When someone mentions you in a comment or post"
            />
            <NotificationToggle
              channel="email"
              type="subscriptions"
              label="Subscriptions"
              description="When someone subscribes to your content"
            />
            <NotificationToggle
              channel="email"
              type="payments"
              label="Payments"
              description="Payment and transaction updates"
            />
            <NotificationToggle
              channel="email"
              type="system"
              label="System"
              description="Important updates about DevoteMe"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="push">
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>Manage notifications sent to your device</CardDescription>
          </CardHeader>
          <CardContent className="border-t pt-6">
            <NotificationToggle
              channel="push"
              type="likes"
              label="Likes"
              description="When someone likes your content"
            />
            <NotificationToggle
              channel="push"
              type="comments"
              label="Comments"
              description="When someone comments on your content"
            />
            <NotificationToggle channel="push" type="follows" label="Follows" description="When someone follows you" />
            <NotificationToggle
              channel="push"
              type="mentions"
              label="Mentions"
              description="When someone mentions you in a comment or post"
            />
            <NotificationToggle
              channel="push"
              type="subscriptions"
              label="Subscriptions"
              description="When someone subscribes to your content"
            />
            <NotificationToggle
              channel="push"
              type="payments"
              label="Payments"
              description="Payment and transaction updates"
            />
            <NotificationToggle
              channel="push"
              type="system"
              label="System"
              description="Important updates about DevoteMe"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

