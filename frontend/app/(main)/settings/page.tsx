"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import { Bell, Eye, Lock, Delete, Shield, LogOut } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const notificationSchema = z.object({
  payment: z.boolean().default(true),
  systemInfo: z.boolean().default(true),
  newTip: z.boolean().default(true),
  newDevotee: z.boolean().default(true),
  creatorAnnouncements: z.boolean().default(true),
  creatorPromotion: z.boolean().default(true),
  creatorPosts: z.boolean().default(true),
  newLikes: z.boolean().default(true),
  newComments: z.boolean().default(true),
})

type NotificationFormValues = z.infer<typeof notificationSchema>

const privacySchema = z.object({
  showOnlineStatus: z.boolean().default(true),
  allowMessages: z.string().default("all"),
  showNsfw: z.boolean().default(false),
  blurNsfw: z.boolean().default(true),
})

type PrivacyFormValues = z.infer<typeof privacySchema>

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false)
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)

  const {
    register: registerNotifications,
    handleSubmit: handleSubmitNotifications,
    watch: watchNotifications,
    setValue: setNotificationValue,
    formState: { errors: notificationErrors },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      payment: true,
      systemInfo: true,
      newTip: true,
      newDevotee: true,
      creatorAnnouncements: true,
      creatorPromotion: true,
      creatorPosts: true,
      newLikes: true,
      newComments: true,
    },
  })

  const {
    register: registerPrivacy,
    handleSubmit: handleSubmitPrivacy,
    watch: watchPrivacy,
    setValue: setPrivacyValue,
    formState: { errors: privacyErrors },
  } = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      showOnlineStatus: true,
      allowMessages: "all",
      showNsfw: false,
      blurNsfw: true,
    },
  })

  const onSubmitNotifications = async (data: NotificationFormValues) => {
    setIsUpdatingNotifications(true)
    try {
      // In a real implementation, this would call an API endpoint
      await axios.put("/users/profile", {
        notificationSettings: data,
      })

      toast({
        title: "Notification settings updated",
        description: "Your notification settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingNotifications(false)
    }
  }

  const onSubmitPrivacy = async (data: PrivacyFormValues) => {
    setIsUpdatingPrivacy(true)
    try {
      // In a real implementation, this would call an API endpoint
      await axios.put("/users/profile", {
        nsfwSettings: {
          showNsfw: data.showNsfw,
          blurNsfw: data.blurNsfw,
        },
        privacySettings: {
          showOnlineStatus: data.showOnlineStatus,
          allowMessages: data.allowMessages,
        },
      })

      toast({
        title: "Privacy settings updated",
        description: "Your privacy settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPrivacy(false)
    }
  }

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true)
    try {
      // In a real implementation, this would call an API endpoint
      await axios.delete("/users/account")

      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated successfully.",
      })

      // Log out the user
      logout()
    } catch (error) {
      console.error("Error deactivating account:", error)
      toast({
        title: "Error",
        description: "Failed to deactivate account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeactivating(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications from DevoteMe</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitNotifications(onSubmitNotifications)}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">General Notifications</h3>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="payment" className="flex-1">
                      Payment notifications
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about payments and transactions
                      </p>
                    </Label>
                    <Switch
                      id="payment"
                      checked={watchNotifications("payment")}
                      onCheckedChange={(checked) => setNotificationValue("payment", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="systemInfo" className="flex-1">
                      System notifications
                      <p className="text-sm text-muted-foreground">Receive system-wide announcements and updates</p>
                    </Label>
                    <Switch
                      id="systemInfo"
                      checked={watchNotifications("systemInfo")}
                      onCheckedChange={(checked) => setNotificationValue("systemInfo", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Creator Notifications</h3>

                  {user.userType === "CONTENT_CREATOR" && (
                    <>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="newTip" className="flex-1">
                          New tips
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when someone sends you a tip
                          </p>
                        </Label>
                        <Switch
                          id="newTip"
                          checked={watchNotifications("newTip")}
                          onCheckedChange={(checked) => setNotificationValue("newTip", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="newDevotee" className="flex-1">
                          New devotees
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when someone subscribes to you
                          </p>
                        </Label>
                        <Switch
                          id="newDevotee"
                          checked={watchNotifications("newDevotee")}
                          onCheckedChange={(checked) => setNotificationValue("newDevotee", checked)}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="creatorAnnouncements" className="flex-1">
                      Creator announcements
                      <p className="text-sm text-muted-foreground">Receive announcements from creators you follow</p>
                    </Label>
                    <Switch
                      id="creatorAnnouncements"
                      checked={watchNotifications("creatorAnnouncements")}
                      onCheckedChange={(checked) => setNotificationValue("creatorAnnouncements", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="creatorPromotion" className="flex-1">
                      Creator promotions
                      <p className="text-sm text-muted-foreground">
                        Receive promotional content from creators you follow
                      </p>
                    </Label>
                    <Switch
                      id="creatorPromotion"
                      checked={watchNotifications("creatorPromotion")}
                      onCheckedChange={(checked) => setNotificationValue("creatorPromotion", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="creatorPosts" className="flex-1">
                      New posts
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when creators you follow post new content
                      </p>
                    </Label>
                    <Switch
                      id="creatorPosts"
                      checked={watchNotifications("creatorPosts")}
                      onCheckedChange={(checked) => setNotificationValue("creatorPosts", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Interaction Notifications</h3>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="newLikes" className="flex-1">
                      Likes
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone likes your content
                      </p>
                    </Label>
                    <Switch
                      id="newLikes"
                      checked={watchNotifications("newLikes")}
                      onCheckedChange={(checked) => setNotificationValue("newLikes", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="newComments" className="flex-1">
                      Comments
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone comments on your content
                      </p>
                    </Label>
                    <Switch
                      id="newComments"
                      checked={watchNotifications("newComments")}
                      onCheckedChange={(checked) => setNotificationValue("newComments", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdatingNotifications}>
                  {isUpdatingNotifications ? "Saving..." : "Save Notification Settings"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy and content preferences</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitPrivacy(onSubmitPrivacy)}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Privacy</h3>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="showOnlineStatus" className="flex-1">
                      Show online status
                      <p className="text-sm text-muted-foreground">Allow others to see when you're online</p>
                    </Label>
                    <Switch
                      id="showOnlineStatus"
                      checked={watchPrivacy("showOnlineStatus")}
                      onCheckedChange={(checked) => setPrivacyValue("showOnlineStatus", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Who can message you</Label>
                    <RadioGroup
                      onValueChange={(value) => setPrivacyValue("allowMessages", value)}
                      defaultValue={watchPrivacy("allowMessages")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">Everyone</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="subscribed" id="subscribed" />
                        <Label htmlFor="subscribed">Only creators I'm subscribed to</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none">No one</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Content Preferences</h3>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="showNsfw" className="flex-1">
                      Show NSFW content
                      <p className="text-sm text-muted-foreground">Show content marked as Not Safe For Work</p>
                    </Label>
                    <Switch
                      id="showNsfw"
                      checked={watchPrivacy("showNsfw")}
                      onCheckedChange={(checked) => setPrivacyValue("showNsfw", checked)}
                    />
                  </div>

                  {watchPrivacy("showNsfw") && (
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="blurNsfw" className="flex-1">
                        Blur NSFW content
                        <p className="text-sm text-muted-foreground">Blur NSFW content until clicked</p>
                      </Label>
                      <Switch
                        id="blurNsfw"
                        checked={watchPrivacy("blurNsfw")}
                        onCheckedChange={(checked) => setPrivacyValue("blurNsfw", checked)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdatingPrivacy}>
                  {isUpdatingPrivacy ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security</h3>

                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <a href="/reset-password">
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </a>
                  </Button>

                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <a href="/profile">
                      <Shield className="mr-2 h-4 w-4" />
                      Update Profile Information
                    </a>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button variant="outline" onClick={logout} className="w-full sm:w-auto">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Delete className="mr-2 h-4 w-4" />
                      Deactivate Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to deactivate your account? This action is permanent and will delete all
                        your data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeactivateAccount}
                        disabled={isDeactivating}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeactivating ? "Deactivating..." : "Deactivate"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

