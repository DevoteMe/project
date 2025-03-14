"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "@/lib/axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Camera, Save } from "lucide-react"

const profileSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  profileText: z.string().optional(),
  country: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type SecurityFormValues = z.infer<typeof securitySchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profilePicture || null)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      profileText: user?.profileText || "",
      country: user?.country || "",
    },
  })

  const {
    register: registerSecurity,
    handleSubmit: handleSubmitSecurity,
    formState: { errors: securityErrors },
    reset: resetSecurity,
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
  })

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true)
    try {
      // Update profile data
      await axios.put("/users/profile", data)

      // Upload profile image if changed
      if (profileImage) {
        const formData = new FormData()
        formData.append("profilePicture", profileImage)
        await axios.post("/users/profile/picture", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onSubmitSecurity = async (data: SecurityFormValues) => {
    setIsUpdatingSecurity(true)
    try {
      // This would be a real API endpoint in a production app
      await axios.put("/users/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      })

      resetSecurity()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingSecurity(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" {...registerProfile("username")} />
                    {profileErrors.username && (
                      <p className="text-sm text-destructive">{profileErrors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profileText">Bio</Label>
                    <Textarea
                      id="profileText"
                      placeholder="Tell us about yourself"
                      className="min-h-32"
                      {...registerProfile("profileText")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Your country" {...registerProfile("country")} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      <>
                        <span className="mr-2">Saving...</span>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Update your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={profileImagePreview || ""} alt={user.username} />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor="profilePicture"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Camera className="h-4 w-4" />
                    </Label>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Click the camera icon to upload a new profile picture</p>
                </CardContent>
              </Card>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitSecurity(onSubmitSecurity)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...registerSecurity("currentPassword")} />
                  {securityErrors.currentPassword && (
                    <p className="text-sm text-destructive">{securityErrors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...registerSecurity("newPassword")} />
                  {securityErrors.newPassword && (
                    <p className="text-sm text-destructive">{securityErrors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" {...registerSecurity("confirmPassword")} />
                  {securityErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{securityErrors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isUpdatingSecurity}>
                  {isUpdatingSecurity ? (
                    <>
                      <span className="mr-2">Updating...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">New Comments</h3>
                    <p className="text-sm text-muted-foreground">Get notified when someone comments on your content</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="comments-email" className="text-sm">
                      Email
                    </Label>
                    <Input type="checkbox" id="comments-email" className="h-4 w-4" />
                    <Label htmlFor="comments-push" className="text-sm">
                      Push
                    </Label>
                    <Input type="checkbox" id="comments-push" className="h-4 w-4" defaultChecked />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">New Likes</h3>
                    <p className="text-sm text-muted-foreground">Get notified when someone likes your content</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="likes-email" className="text-sm">
                      Email
                    </Label>
                    <Input type="checkbox" id="likes-email" className="h-4 w-4" />
                    <Label htmlFor="likes-push" className="text-sm">
                      Push
                    </Label>
                    <Input type="checkbox" id="likes-push" className="h-4 w-4" defaultChecked />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">New Devotees</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone subscribes to your content
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="devotees-email" className="text-sm">
                      Email
                    </Label>
                    <Input type="checkbox" id="devotees-email" className="h-4 w-4" defaultChecked />
                    <Label htmlFor="devotees-push" className="text-sm">
                      Push
                    </Label>
                    <Input type="checkbox" id="devotees-push" className="h-4 w-4" defaultChecked />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Tips</h3>
                    <p className="text-sm text-muted-foreground">Get notified when someone sends you a tip</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="tips-email" className="text-sm">
                      Email
                    </Label>
                    <Input type="checkbox" id="tips-email" className="h-4 w-4" defaultChecked />
                    <Label htmlFor="tips-push" className="text-sm">
                      Push
                    </Label>
                    <Input type="checkbox" id="tips-push" className="h-4 w-4" defaultChecked />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Messages</h3>
                    <p className="text-sm text-muted-foreground">Get notified when you receive a new message</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="messages-email" className="text-sm">
                      Email
                    </Label>
                    <Input type="checkbox" id="messages-email" className="h-4 w-4" defaultChecked />
                    <Label htmlFor="messages-push" className="text-sm">
                      Push
                    </Label>
                    <Input type="checkbox" id="messages-push" className="h-4 w-4" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

