"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
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
import { Loader2, Download, AlertTriangle, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { Separator } from "@/components/ui/separator"

export default function PrivacySettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isExporting, setIsExporting] = useState(false)
  const [isSchedulingDeletion, setIsSchedulingDeletion] = useState(false)
  const [isCancelingDeletion, setIsCancelingDeletion] = useState(false)
  const [gracePeriod, setGracePeriod] = useState(30)

  const user = session?.user
  const hasPendingDeletion = user?.status === "PENDING_DELETION"
  const scheduledDeletionDate = user?.scheduledDeletionDate
    ? new Date(user.scheduledDeletionDate).toLocaleDateString()
    : null

  const handleExportData = async () => {
    setIsExporting(true)

    try {
      // Create a hidden anchor element to trigger the download
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = `${process.env.NEXT_PUBLIC_API_URL}/gdpr/export`
      a.download = `devoteme_data_export_${Date.now()}.json`

      // Add authorization header via fetch
      const response = await fetch(a.href, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      // Get the blob from the response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      a.href = url

      // Append to body, click, and remove
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Your data has been exported successfully",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleScheduleDeletion = async () => {
    setIsSchedulingDeletion(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gdpr/delete/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ gracePeriod }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Account Deletion Scheduled",
          description: data.message,
        })

        // Force refresh session to update user status
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to schedule account deletion",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scheduling deletion:", error)
      toast({
        title: "Error",
        description: "An error occurred while scheduling account deletion",
        variant: "destructive",
      })
    } finally {
      setIsSchedulingDeletion(false)
    }
  }

  const handleCancelDeletion = async () => {
    setIsCancelingDeletion(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gdpr/delete/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Deletion Canceled",
          description: data.message,
        })

        // Force refresh session to update user status
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to cancel account deletion",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error canceling deletion:", error)
      toast({
        title: "Error",
        description: "An error occurred while canceling account deletion",
        variant: "destructive",
      })
    } finally {
      setIsCancelingDeletion(false)
    }
  }

  const handleImmediateDeletion = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gdpr/delete/immediate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        // Sign out the user
        router.push("/logout")
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting your account",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Privacy & Data Settings</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Export Your Data</CardTitle>
            <CardDescription>Download a copy of your personal data in JSON format</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This export includes your profile information, posts, comments, subscriptions, and other data associated
              with your account.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleExportData} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export My Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Deletion</CardTitle>
            <CardDescription>
              {hasPendingDeletion
                ? `Your account is scheduled for deletion on ${scheduledDeletionDate}`
                : "Permanently delete your account and all associated data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPendingDeletion ? (
              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Account Deletion Pending</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your account is scheduled to be permanently deleted on {scheduledDeletionDate}. You can cancel this
                    process if you change your mind.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleCancelDeletion}
                    disabled={isCancelingDeletion}
                  >
                    {isCancelingDeletion ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Canceling...
                      </>
                    ) : (
                      "Cancel Deletion"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  When you delete your account, all of your data will be permanently removed from our systems. This
                  action cannot be undone.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="gracePeriod"
                      type="number"
                      min="1"
                      max="90"
                      value={gracePeriod}
                      onChange={(e) => setGracePeriod(Number.parseInt(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Days until your account is permanently deleted
                    </span>
                  </div>
                </div>

                <Button variant="outline" onClick={handleScheduleDeletion} disabled={isSchedulingDeletion}>
                  {isSchedulingDeletion ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Account Deletion"
                  )}
                </Button>

                <Separator className="my-4" />

                <div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Delete Account Immediately
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Your account and all associated data will be permanently deleted
                          from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImmediateDeletion} className="bg-red-600 hover:bg-red-700">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

