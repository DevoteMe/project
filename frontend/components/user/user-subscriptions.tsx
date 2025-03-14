"use client"

import { useState } from "react"
import type { UserSubscription } from "@/types/subscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

// Mock data for demonstration
const mockSubscriptions: (UserSubscription & {
  creator: {
    id: string
    name: string
    avatar?: string
  }
})[] = [
  {
    id: "s1",
    userId: "currentUser",
    creatorId: "creator1",
    tierId: "1",
    tierName: "Bronze Supporter",
    startDate: "2023-05-15T00:00:00Z",
    endDate: "2023-06-15T00:00:00Z",
    autoRenew: true,
    status: "active",
    price: 4.99,
    billingPeriod: "monthly",
    creator: {
      id: "creator1",
      name: "Creative Minds",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "s2",
    userId: "currentUser",
    creatorId: "creator2",
    tierId: "2",
    tierName: "Silver Supporter",
    startDate: "2023-04-10T00:00:00Z",
    endDate: "2023-05-10T00:00:00Z",
    autoRenew: false,
    status: "canceled",
    price: 9.99,
    billingPeriod: "monthly",
    creator: {
      id: "creator2",
      name: "Art & Design",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "s3",
    userId: "currentUser",
    creatorId: "creator3",
    tierId: "3",
    tierName: "Gold Supporter",
    startDate: "2023-06-01T00:00:00Z",
    endDate: "2023-07-01T00:00:00Z",
    autoRenew: true,
    status: "active",
    price: 19.99,
    billingPeriod: "monthly",
    creator: {
      id: "creator3",
      name: "Tech Insights",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
]

export function UserSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions)
  const [selectedSubscription, setSelectedSubscription] = useState<(typeof mockSubscriptions)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCancelSubscription = () => {
    if (!selectedSubscription) return

    // In a real app, this would call an API to cancel the subscription
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === selectedSubscription.id ? { ...sub, status: "canceled", autoRenew: false } : sub)),
    )

    toast({
      title: "Subscription canceled",
      description: `Your subscription to ${selectedSubscription.creator.name} has been canceled.`,
    })

    setIsDialogOpen(false)
    setSelectedSubscription(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: UserSubscription["status"]) => {
    switch (status) {
      case "active":
        return "success"
      case "canceled":
        return "destructive"
      case "expired":
        return "outline"
      case "pending":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Subscriptions</CardTitle>
        <CardDescription>Manage your creator subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">You don't have any active subscriptions.</p>
              <Button className="mt-4">Discover Creators</Button>
            </div>
          ) : (
            subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={subscription.creator.avatar} alt={subscription.creator.name} />
                    <AvatarFallback>{subscription.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{subscription.creator.name}</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">{subscription.tierName}</p>
                      <Badge variant={getStatusBadgeVariant(subscription.status)}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div className="text-sm mb-4 sm:mb-0 sm:text-right">
                    <p>
                      {formatCurrency(subscription.price)}/{subscription.billingPeriod}
                    </p>
                    <p className="text-muted-foreground">
                      {subscription.status === "active"
                        ? `Renews on ${formatDate(subscription.endDate)}`
                        : `Expires on ${formatDate(subscription.endDate)}`}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/creator/${subscription.creator.id}`}>View</a>
                    </Button>
                    {subscription.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubscription(subscription)
                          setIsDialogOpen(true)
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription to {selectedSubscription?.creator.name}?
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="py-4">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedSubscription.creator.avatar} alt={selectedSubscription.creator.name} />
                  <AvatarFallback>{selectedSubscription.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedSubscription.creator.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSubscription.tierName}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p>Your subscription details:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    {formatCurrency(selectedSubscription.price)} per {selectedSubscription.billingPeriod}
                  </li>
                  <li>Started on {formatDate(selectedSubscription.startDate)}</li>
                  <li>You will have access until {formatDate(selectedSubscription.endDate)}</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

