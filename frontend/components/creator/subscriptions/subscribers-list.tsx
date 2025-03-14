"use client"

import { useState } from "react"
import type { UserSubscription } from "@/types/subscription"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Mail } from "lucide-react"

// Mock data for demonstration
const mockSubscribers: (UserSubscription & { user: { name: string; email: string; avatar?: string } })[] = [
  {
    id: "s1",
    userId: "u1",
    creatorId: "creator1",
    tierId: "1",
    tierName: "Bronze Supporter",
    startDate: "2023-01-15T00:00:00Z",
    endDate: "2023-02-15T00:00:00Z",
    autoRenew: true,
    status: "active",
    price: 4.99,
    billingPeriod: "monthly",
    user: {
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "s2",
    userId: "u2",
    creatorId: "creator1",
    tierId: "2",
    tierName: "Silver Supporter",
    startDate: "2023-02-10T00:00:00Z",
    endDate: "2023-03-10T00:00:00Z",
    autoRenew: true,
    status: "active",
    price: 9.99,
    billingPeriod: "monthly",
    user: {
      name: "Sarah Miller",
      email: "sarah@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "s3",
    userId: "u3",
    creatorId: "creator1",
    tierId: "3",
    tierName: "Gold Supporter",
    startDate: "2023-01-05T00:00:00Z",
    endDate: "2023-02-05T00:00:00Z",
    autoRenew: false,
    status: "canceled",
    price: 19.99,
    billingPeriod: "monthly",
    user: {
      name: "Michael Brown",
      email: "michael@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "s4",
    userId: "u4",
    creatorId: "creator1",
    tierId: "1",
    tierName: "Bronze Supporter",
    startDate: "2023-03-01T00:00:00Z",
    endDate: "2023-04-01T00:00:00Z",
    autoRenew: true,
    status: "active",
    price: 4.99,
    billingPeriod: "monthly",
    user: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "s5",
    userId: "u5",
    creatorId: "creator1",
    tierId: "2",
    tierName: "Silver Supporter",
    startDate: "2023-02-20T00:00:00Z",
    endDate: "2023-03-20T00:00:00Z",
    autoRenew: true,
    status: "active",
    price: 9.99,
    billingPeriod: "monthly",
    user: {
      name: "David Wilson",
      email: "david@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
]

export function SubscribersList() {
  const [subscribers, setSubscribers] = useState(mockSubscribers)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tierFilter, setTierFilter] = useState("all")

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    const matchesTier = tierFilter === "all" || sub.tierId === tierFilter

    return matchesSearch && matchesStatus && matchesTier
  })

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
        <CardTitle>Subscribers</CardTitle>
        <CardDescription>Manage your subscribers and their subscription details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="1">Bronze</SelectItem>
                <SelectItem value="2">Silver</SelectItem>
                <SelectItem value="3">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email All
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No subscribers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={subscriber.user.avatar} alt={subscriber.user.name} />
                            <AvatarFallback>{subscriber.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{subscriber.user.name}</div>
                            <div className="text-xs text-muted-foreground">{subscriber.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{subscriber.tierName}</TableCell>
                      <TableCell>{formatDate(subscriber.startDate)}</TableCell>
                      <TableCell>{formatDate(subscriber.endDate)}</TableCell>
                      <TableCell>
                        {formatCurrency(subscriber.price)}/{subscriber.billingPeriod}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(subscriber.status)}>
                          {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            Email
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

