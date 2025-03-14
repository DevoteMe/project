"use client"

import { useState } from "react"
import type { GiftPurchase } from "@/types/gifts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"

// Mock data for demonstration
const mockGiftHistory: (GiftPurchase & {
  gift: { name: string; imageUrl: string }
  sender: { name: string; avatar?: string }
  content?: { title: string; type: string }
})[] = [
  {
    id: "gp1",
    giftId: "g1",
    senderId: "u1",
    recipientId: "creator1",
    contentId: "c1",
    message: "Love your content!",
    price: 1.99,
    createdAt: "2023-06-10T14:30:00Z",
    gift: {
      name: "Heart",
      imageUrl: "/placeholder.svg?height=40&width=40",
    },
    sender: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: {
      title: "My Journey as a Creator",
      type: "post",
    },
  },
  {
    id: "gp2",
    giftId: "g3",
    senderId: "u2",
    recipientId: "creator1",
    contentId: "c2",
    price: 4.99,
    createdAt: "2023-06-09T10:15:00Z",
    gift: {
      name: "Trophy",
      imageUrl: "/placeholder.svg?height=40&width=40",
    },
    sender: {
      name: "Sarah Miller",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: {
      title: "Behind the Scenes",
      type: "video",
    },
  },
  {
    id: "gp3",
    giftId: "g2",
    senderId: "u3",
    recipientId: "creator1",
    message: "Keep up the great work!",
    price: 2.99,
    createdAt: "2023-06-08T18:45:00Z",
    gift: {
      name: "Star",
      imageUrl: "/placeholder.svg?height=40&width=40",
    },
    sender: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "gp4",
    giftId: "g4",
    senderId: "u4",
    recipientId: "creator1",
    contentId: "c3",
    price: 9.99,
    createdAt: "2023-06-07T09:20:00Z",
    gift: {
      name: "Diamond",
      imageUrl: "/placeholder.svg?height=40&width=40",
    },
    sender: {
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: {
      title: "Q&A Session",
      type: "livestream",
    },
  },
  {
    id: "gp5",
    giftId: "g1",
    senderId: "u5",
    recipientId: "creator1",
    contentId: "c4",
    message: "This really resonated with me",
    price: 1.99,
    createdAt: "2023-06-06T16:10:00Z",
    gift: {
      name: "Heart",
      imageUrl: "/placeholder.svg?height=40&width=40",
    },
    sender: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: {
      title: "My Creative Process",
      type: "post",
    },
  },
]

export function GiftsHistory() {
  const [giftHistory, setGiftHistory] = useState(mockGiftHistory)
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")

  const filteredHistory = giftHistory.filter((item) => {
    const matchesSearch =
      item.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      item.gift.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (timeFilter === "all") return matchesSearch

    const date = new Date(item.createdAt)
    const now = new Date()

    switch (timeFilter) {
      case "today":
        return matchesSearch && date.toDateString() === now.toDateString()
      case "week":
        const weekAgo = new Date()
        weekAgo.setDate(now.getDate() - 7)
        return matchesSearch && date >= weekAgo
      case "month":
        const monthAgo = new Date()
        monthAgo.setMonth(now.getMonth() - 1)
        return matchesSearch && date >= monthAgo
      default:
        return matchesSearch
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gift History</CardTitle>
        <CardDescription>View all gifts received from your followers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gifts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gift</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No gifts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <img
                              src={item.gift.imageUrl || "/placeholder.svg"}
                              alt={item.gift.name}
                              className="w-5 h-5"
                            />
                          </div>
                          <span>{item.gift.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.sender.avatar} alt={item.sender.name} />
                            <AvatarFallback>{item.sender.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{item.sender.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.content ? (
                          <div>
                            <div className="font-medium">{item.content.title}</div>
                            <div className="text-xs text-muted-foreground capitalize">{item.content.type}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Profile gift</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.message ? (
                          <span className="line-clamp-1">{item.message}</span>
                        ) : (
                          <span className="text-muted-foreground">No message</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
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

