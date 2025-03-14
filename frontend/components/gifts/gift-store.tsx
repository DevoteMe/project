"use client"

import { useState } from "react"
import type { Gift } from "@/types/gifts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Heart, GiftIcon, Star, Sparkles } from "lucide-react"

// Mock data for demonstration
const mockGifts: Gift[] = [
  {
    id: "g1",
    name: "Heart",
    description: "Show your love with a heart",
    price: 1.99,
    imageUrl: "/placeholder.svg?height=80&width=80",
    category: "basic",
    isAnimated: false,
    isLimited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "g2",
    name: "Star",
    description: "A shining star for amazing content",
    price: 2.99,
    imageUrl: "/placeholder.svg?height=80&width=80",
    category: "basic",
    isAnimated: false,
    isLimited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "g3",
    name: "Trophy",
    description: "Award exceptional content with a trophy",
    price: 4.99,
    imageUrl: "/placeholder.svg?height=80&width=80",
    category: "premium",
    isAnimated: true,
    isLimited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "g4",
    name: "Diamond",
    description: "The ultimate gift for the best content",
    price: 9.99,
    imageUrl: "/placeholder.svg?height=80&width=80",
    category: "premium",
    isAnimated: true,
    isLimited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "g5",
    name: "Birthday Cake",
    description: "Celebrate special occasions",
    price: 3.99,
    imageUrl: "/placeholder.svg?height=80&width=80",
    category: "special",
    isAnimated: true,
    isLimited: true,
    availableUntil: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

interface GiftStoreProps {
  creatorId: string
  contentId?: string
  onClose?: () => void
}

export function GiftStore({ creatorId, contentId, onClose }: GiftStoreProps) {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [message, setMessage] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const handleSelectGift = (gift: Gift) => {
    setSelectedGift(gift)
    setIsConfirmDialogOpen(true)
  }

  const handleSendGift = () => {
    if (!selectedGift) return

    // In a real app, this would call an API to process the gift purchase
    toast({
      title: "Gift sent!",
      description: `You sent a ${selectedGift.name} to the creator.`,
    })

    setSelectedGift(null)
    setMessage("")
    setIsConfirmDialogOpen(false)
    if (onClose) onClose()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "basic":
        return <Heart className="h-5 w-5" />
      case "premium":
        return <Star className="h-5 w-5" />
      case "special":
        return <Sparkles className="h-5 w-5" />
      default:
        return <GiftIcon className="h-5 w-5" />
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Gifts</TabsTrigger>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockGifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} onSelect={handleSelectGift} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="basic" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockGifts
              .filter((g) => g.category === "basic")
              .map((gift) => (
                <GiftCard key={gift.id} gift={gift} onSelect={handleSelectGift} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockGifts
              .filter((g) => g.category === "premium")
              .map((gift) => (
                <GiftCard key={gift.id} gift={gift} onSelect={handleSelectGift} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockGifts
              .filter((g) => g.category === "special")
              .map((gift) => (
                <GiftCard key={gift.id} gift={gift} onSelect={handleSelectGift} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Gift</DialogTitle>
            <DialogDescription>
              Send a {selectedGift?.name} to this creator to show your appreciation.
            </DialogDescription>
          </DialogHeader>

          {selectedGift && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                <img
                  src={selectedGift.imageUrl || "/placeholder.svg"}
                  alt={selectedGift.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="text-center">
                <h3 className="font-medium">{selectedGift.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedGift.description}</p>
                <p className="font-medium mt-2">{formatCurrency(selectedGift.price)}</p>
              </div>

              <Textarea
                placeholder="Add a personal message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendGift}>Send Gift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface GiftCardProps {
  gift: Gift
  onSelect: (gift: Gift) => void
}

function GiftCard({ gift, onSelect }: GiftCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm">{gift.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2 flex justify-center">
        <div className="w-16 h-16 flex items-center justify-center">
          <img
            src={gift.imageUrl || "/placeholder.svg"}
            alt={gift.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center">
        <span className="text-sm font-medium">{formatCurrency(gift.price)}</span>
        <Button size="sm" onClick={() => onSelect(gift)}>
          Send
        </Button>
      </CardFooter>
    </Card>
  )
}

