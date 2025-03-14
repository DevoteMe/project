"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Clock, User, Shield, FileEdit, Key, LogOut, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { EmptyState } from "@/components/ui/empty-state"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"

interface UserActivity {
  id: string
  userId: string
  type: string
  ipAddress: string | null
  userAgent: string | null
  metadata: any
  createdAt: string
}

interface ActivityResponse {
  activities: UserActivity[]
  total: number
  pages: number
}

export default function ActivityHistoryPage() {
  const { data: session } = useSession()
  const [activityData, setActivityData] = useState<ActivityResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClearing, setIsClearing] = useState(false)
  const [page, setPage] = useState(1)
  const [activityType, setActivityType] = useState<string>("")
  const [loginHistory, setLoginHistory] = useState<UserActivity[]>([])
  const [isLoadingLoginHistory, setIsLoadingLoginHistory] = useState(true)

  useEffect(() => {
    fetchActivityHistory()
    fetchLoginHistory()
  }, [])

  useEffect(() => {
    fetchActivityHistory()
  }, [page, activityType])

  const fetchActivityHistory = async () => {
    setIsLoading(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/activity?page=${page}`
      if (activityType && activityType !== "all") {
        url += `&type=${activityType}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setActivityData(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch activity history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching activity history:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching activity history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLoginHistory = async () => {
    setIsLoadingLoginHistory(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity/login-history`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setLoginHistory(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch login history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching login history:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching login history",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLoginHistory(false)
    }
  }

  const handleClearHistory = async () => {
    setIsClearing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Activity history cleared successfully",
        })
        fetchActivityHistory()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to clear activity history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error clearing activity history:", error)
      toast({
        title: "Error",
        description: "An error occurred while clearing activity history",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "LOGIN":
        return <User className="h-4 w-4" />
      case "LOGOUT":
        return <LogOut className="h-4 w-4" />
      case "PROFILE_UPDATE":
        return <FileEdit className="h-4 w-4" />
      case "PASSWORD_CHANGE":
        return <Key className="h-4 w-4" />
      case "SECURITY_ALERT":
        return <Shield className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityDescription = (activity: UserActivity) => {
    switch (activity.type) {
      case "LOGIN":
        return "Logged in to your account"
      case "LOGOUT":
        return "Logged out of your account"
      case "PROFILE_UPDATE":
        return "Updated your profile information"
      case "PASSWORD_CHANGE":
        return "Changed your password"
      case "SECURITY_ALERT":
        return "Security alert triggered"
      case "EMAIL_CHANGE":
        return "Changed your email address"
      case "ACCOUNT_RECOVERY":
        return "Initiated account recovery"
      case "SUBSCRIPTION_CHANGE":
        return "Changed subscription status"
      default:
        return "Account activity"
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Account Activity</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Login Activity</CardTitle>
            <CardDescription>Recent devices that have logged into your account</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLoginHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : loginHistory.length === 0 ? (
              <EmptyState
                icon={<Clock className="h-12 w-12 text-muted-foreground" />}
                title="No Login History"
                description="Your recent login history will appear here"
              />
            ) : (
              <div className="space-y-4">
                {loginHistory.map((login) => (
                  <div key={login.id} className="flex items-start justify-between p-4 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-primary/10 mt-1">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Login</h4>
                        <p className="text-sm text-muted-foreground">{login.ipAddress && `IP: ${login.ipAddress}`}</p>
                        {login.userAgent && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">{login.userAgent}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{format(new Date(login.createdAt), "MMM d, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(login.createdAt), "h:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Your recent account activity</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Activities</SelectItem>
                  <SelectItem value="LOGIN">Logins</SelectItem>
                  <SelectItem value="LOGOUT">Logouts</SelectItem>
                  <SelectItem value="PROFILE_UPDATE">Profile Updates</SelectItem>
                  <SelectItem value="PASSWORD_CHANGE">Password Changes</SelectItem>
                  <SelectItem value="SECURITY_ALERT">Security Alerts</SelectItem>
                </SelectContent>
              </Select>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Activity History</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your activity history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearHistory}
                      disabled={isClearing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isClearing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !activityData || activityData.activities.length === 0 ? (
              <EmptyState
                icon={<Clock className="h-12 w-12 text-muted-foreground" />}
                title="No Activity History"
                description="Your account activity will appear here"
              />
            ) : (
              <div className="space-y-4">
                {activityData.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between p-4 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-primary/10 mt-1">{getActivityIcon(activity.type)}</div>
                      <div>
                        <h4 className="font-medium">{getActivityDescription(activity)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.ipAddress && `IP: ${activity.ipAddress}`}
                        </p>
                        {activity.metadata && (
                          <p className="text-xs text-muted-foreground mt-1">{JSON.stringify(activity.metadata)}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{format(new Date(activity.createdAt), "MMM d, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(activity.createdAt), "h:mm a")}</p>
                    </div>
                  </div>
                ))}

                {activityData.pages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination currentPage={page} totalPages={activityData.pages} onPageChange={setPage} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

