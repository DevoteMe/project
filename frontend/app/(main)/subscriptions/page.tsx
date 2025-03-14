"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "@/lib/axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { formatPrice, formatRelativeTime } from "@/lib/utils"
import type { Subscription } from "@/types"
import { Clock, CreditCard, ExternalLink, Heart, MoreHorizontal, RollerCoaster, ShieldCheck, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import EmptyState from "@/components/empty-state"

export default function SubscriptionsPage() {
  const { toast } = useToast()
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([])
  const [canceledSubscriptions, setCanceledSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const fetchSubscriptions = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get("/subscriptions")

      // Split subscriptions by status
      const active: Subscription[] = []
      const canceled: Subscription[] = []

      data.forEach((subscription: Subscription) => {
        if (subscription.status === "ACTIVE") {
          active.push(subscription)
        } else {
          canceled.push(subscription)
        }
      })

      setActiveSubscriptions(active)
      setCanceledSubscriptions(canceled)
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load your subscriptions. Please try again.",
        variant: "destructive",
      })

      // For demo purposes, set some mock data
      const mockActiveSubscriptions: Subscription[] = Array.from({ length: 3 }).map((_, i) => ({
        id: `sub-${i}`,
        userId: "user-id",
        creatorId: `creator-${i}`,
        price: 9.99,
        startDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE",
        creator: {
          id: `creator-${i}`,
          username: `creator${i}`,
          profilePicture: null,
          isOnline: Math.random() > 0.5,
          lastSeen: new Date().toISOString(),
          contentCreator: {
            devotionalPrice: 9.99,
          },
        },
      }))

      const mockCanceledSubscriptions: Subscription[] = Array.from({ length: 1 }).map((_, i) => ({
        id: `sub-canceled-${i}`,
        userId: "user-id",
        creatorId: `creator-canceled-${i}`,
        price: 9.99,
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "CANCELED",
        creator: {
          id: `creator-canceled-${i}`,
          username: `canceledCreator${i}`,
          profilePicture: null,
          isOnline: false,
          lastSeen: new Date().toISOString(),
          contentCreator: {
            devotionalPrice: 9.99,
          },
        },
      }))

      setActiveSubscriptions(mockActiveSubscriptions)
      setCanceledSubscriptions(mockCanceledSubscriptions)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    setCancelingId(subscriptionId)
    try {
      await axios.delete(`/subscriptions/${subscriptionId}`)

      // Update local state
      const subscription = activeSubscriptions.find((sub) => sub.id === subscriptionId)
      if (subscription) {
        const updatedSubscription = {
          ...subscription,
          status: "CANCELED" as const,
          endDate: new Date().toISOString(),
        }

        setActiveSubscriptions((prev) => prev.filter((sub) => sub.id !== subscriptionId))
        setCanceledSubscriptions((prev) => [updatedSubscription, ...prev])
      }

      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled successfully.",
      })
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCancelingId(null)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Your Subscriptions</h1>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Active
            {activeSubscriptions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeSubscriptions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="canceled">
            Canceled
            {canceledSubscriptions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {canceledSubscriptions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : activeSubscriptions.length === 0 ? (
            <EmptyState
              icon={<Heart className="h-12 w-12" />}
              title="No active subscriptions"
              description="You don't have any active subscriptions yet. Discover creators to subscribe to."
              action={
                <Button asChild>
                  <Link href="/discover">Discover Creators</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeSubscriptions.map((subscription) => {
                const initials = subscription.creator.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <Card key={subscription.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <Link href={`/creator/${subscription.creator.username}`} className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={subscription.creator.profilePicture || ""}
                              alt={subscription.creator.username}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{subscription.creator.username}</CardTitle>
                            <CardDescription>
                              {subscription.creator.isOnline ? (
                                <span className="flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-green-500" />
                                  Online
                                </span>
                              ) : (
                                <span>Last seen {formatRelativeTime(subscription.creator.lastSeen)}</span>
                              )}
                            </CardDescription>
                          </div>
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/creator/${subscription.creator.username}`} className="flex items-center">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Cancel Subscription
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel your subscription to{" "}
                                    <strong>{subscription.creator.username}</strong>? You'll lose access to
                                    subscriber-only content at the end of your billing period.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelSubscription(subscription.id)}
                                    disabled={cancelingId === subscription.id}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {cancelingId === subscription.id ? "Canceling..." : "Confirm"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <span className="font-medium">{formatPrice(subscription.price)}</span> per month
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Subscribed {formatRelativeTime(subscription.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          <span>Access to subscriber-only content</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full">
                        <Link href={`/creator/${subscription.creator.username}`}>View Content</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="canceled">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : canceledSubscriptions.length === 0 ? (
            <EmptyState
              icon={<RollerCoaster className="h-12 w-12" />}
              title="No canceled subscriptions"
              description="You don't have any canceled subscriptions."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {canceledSubscriptions.map((subscription) => {
                const initials = subscription.creator.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <Card key={subscription.id} className="overflow-hidden border-muted bg-muted/30">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <Link href={`/creator/${subscription.creator.username}`} className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={subscription.creator.profilePicture || ""}
                              alt={subscription.creator.username}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{subscription.creator.username}</CardTitle>
                            <CardDescription>
                              {subscription.creator.isOnline ? (
                                <span className="flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-green-500" />
                                  Online
                                </span>
                              ) : (
                                <span>Last seen {formatRelativeTime(subscription.creator.lastSeen)}</span>
                              )}
                            </CardDescription>
                          </div>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <span className="font-medium">{formatPrice(subscription.price)}</span> per month
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Ended {formatRelativeTime(subscription.endDate || "")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                            Subscription Ended
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/creator/${subscription.creator.username}`}>Resubscribe</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

