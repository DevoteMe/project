"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import {
  Loader2,
  Bell,
  Mail,
  BellRing,
  MessageSquare,
  Heart,
  UserPlus,
  CreditCard,
  FileText,
  ShieldAlert,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NotificationPreference {
  id: string
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  newFollower: boolean
  newComment: boolean
  newLike: boolean
  newSubscriber: boolean
  newMessage: boolean
  contentUpdates: boolean
  accountAlerts: boolean
  marketingEmails: boolean
}

export default function NotificationPreferencesPage() {
  const { data: session } = useSession()
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notification-preferences`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setPreferences(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch notification preferences",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!preferences) return

    setIsSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notification-preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(preferences),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Notification preferences updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update notification preferences",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = (field: keyof NotificationPreference) => {
    if (!preferences) return

    setPreferences({
      ...preferences,
      [field]: !preferences[field],
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Failed to load notification preferences</p>
            <Button onClick={fetchPreferences} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>

      <Tabs defaultValue="channels">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
          <TabsTrigger value="types">Notification Types</TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">In-App Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications within the DevoteMe app</p>
                  </div>
                </div>
                <Switch checked={preferences.inAppEnabled} onCheckedChange={() => handleToggle("inAppEnabled")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                </div>
                <Switch checked={preferences.emailEnabled} onCheckedChange={() => handleToggle("emailEnabled")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BellRing className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                  </div>
                </div>
                <Switch checked={preferences.pushEnabled} onCheckedChange={() => handleToggle("pushEnabled")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Choose which types of notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">New Followers</h4>
                    <p className="text-sm text-muted-foreground">When someone follows you</p>
                  </div>
                </div>
                <Switch checked={preferences.newFollower} onCheckedChange={() => handleToggle("newFollower")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Comments</h4>
                    <p className="text-sm text-muted-foreground">When someone comments on your content</p>
                  </div>
                </div>
                <Switch checked={preferences.newComment} onCheckedChange={() => handleToggle("newComment")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Likes</h4>
                    <p className="text-sm text-muted-foreground">When someone likes your content</p>
                  </div>
                </div>
                <Switch checked={preferences.newLike} onCheckedChange={() => handleToggle("newLike")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">New Subscribers</h4>
                    <p className="text-sm text-muted-foreground">When someone subscribes to your content</p>
                  </div>
                </div>
                <Switch checked={preferences.newSubscriber} onCheckedChange={() => handleToggle("newSubscriber")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Messages</h4>
                    <p className="text-sm text-muted-foreground">When you receive a new message</p>
                  </div>
                </div>
                <Switch checked={preferences.newMessage} onCheckedChange={() => handleToggle("newMessage")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Content Updates</h4>
                    <p className="text-sm text-muted-foreground">Updates from creators you follow</p>
                  </div>
                </div>
                <Switch checked={preferences.contentUpdates} onCheckedChange={() => handleToggle("contentUpdates")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Account Alerts</h4>
                    <p className="text-sm text-muted-foreground">Security and account-related notifications</p>
                  </div>
                </div>
                <Switch checked={preferences.accountAlerts} onCheckedChange={() => handleToggle("accountAlerts")} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Marketing Emails</h4>
                    <p className="text-sm text-muted-foreground">Promotional emails and platform updates</p>
                  </div>
                </div>
                <Switch checked={preferences.marketingEmails} onCheckedChange={() => handleToggle("marketingEmails")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSavePreferences} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  )
}

