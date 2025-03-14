"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SubscriptionTier } from "@/types/subscription"
import { Lock } from "lucide-react"

// Mock data for demonstration
const mockTiers: SubscriptionTier[] = [
  {
    id: "1",
    creatorId: "creator1",
    name: "Bronze Supporter",
    description: "Basic support tier with access to exclusive posts",
    price: 4.99,
    billingPeriod: "monthly",
    features: ["Exclusive posts", "Creator updates", "Community access"],
    color: "#CD7F32",
    isDefault: true,
    isPublic: true,
    currentSubscribers: 124,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    creatorId: "creator1",
    name: "Silver Supporter",
    description: "Mid-tier support with additional perks",
    price: 9.99,
    billingPeriod: "monthly",
    features: ["All Bronze benefits", "Monthly Q&A sessions", "Early access to content"],
    color: "#C0C0C0",
    isDefault: false,
    isPublic: true,
    currentSubscribers: 76,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    creatorId: "creator1",
    name: "Gold Supporter",
    description: "Premium support tier with all benefits",
    price: 19.99,
    billingPeriod: "monthly",
    features: ["All Silver benefits", "Personal shoutouts", "Exclusive merchandise", "Direct messaging"],
    color: "#FFD700",
    isDefault: false,
    isPublic: true,
    currentSubscribers: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

interface ContentPreviewProps {
  creatorId: string
  creatorName: string
  previewContent: React.ReactNode
  previewPercentage?: number
  accessType: "subscribers" | "tier-specific"
  requiredTierIds?: string[]
}

export function ContentPreview({
  creatorId,
  creatorName,
  previewContent,
  previewPercentage = 20,
  accessType,
  requiredTierIds = [],
}: ContentPreviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const relevantTiers =
    accessType === "tier-specific" && requiredTierIds.length > 0
      ? mockTiers.filter((tier) => requiredTierIds.includes(tier.id))
      : mockTiers

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Preview content */}
        <div className="relative">
          {previewContent}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none"
            style={{ top: `${previewPercentage}%` }}
          />
        </div>

        {/* Subscription prompt */}
        <Card className="mt-4 border-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <Lock className="mx-auto h-10 w-10 text-primary" />
            <h3 className="text-xl font-bold">This content is exclusive to subscribers</h3>
            <p className="text-muted-foreground">
              {accessType === "subscribers"
                ? `Subscribe to ${creatorName} to unlock this content and get access to all exclusive posts.`
                : `This content is available to ${requiredTierIds.length > 1 ? "specific tiers" : "a specific tier"} of subscribers.`}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>Subscribe to Unlock</Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subscribe to {creatorName}</DialogTitle>
            <DialogDescription>Choose a subscription tier to unlock exclusive content</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
            {relevantTiers.map((tier) => (
              <Card
                key={tier.id}
                className="overflow-hidden border-t-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderTopColor: tier.color || "#000" }}
                onClick={() => {
                  // In a real app, this would redirect to checkout
                  setIsDialogOpen(false)
                }}
              >
                <CardContent className="p-4">
                  <h3 className="font-bold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{tier.description}</p>
                  <div className="mb-2">
                    <span className="text-xl font-bold">{formatCurrency(tier.price)}</span>
                    <span className="text-muted-foreground">/{tier.billingPeriod}</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    {tier.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tier.features.length > 3 && (
                      <li className="text-muted-foreground">+ {tier.features.length - 3} more</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

