"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SubscriptionTier } from "@/types/subscription"
import { toast } from "@/hooks/use-toast"
import { Check, CreditCard } from "lucide-react"

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

interface SubscriptionOptionsProps {
  creatorId: string
  creatorName: string
  onSubscribe?: () => void
}

export function SubscriptionOptions({ creatorId, creatorName, onSubscribe }: SubscriptionOptionsProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSelectedTier(tier)
    setIsCheckoutDialogOpen(true)
  }

  const handleSubscribe = async () => {
    if (!selectedTier) return

    setIsProcessing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsProcessing(false)
    setIsCheckoutDialogOpen(false)

    toast({
      title: "Subscription successful",
      description: `You are now subscribed to ${creatorName}'s ${selectedTier.name} tier!`,
    })

    if (onSubscribe) {
      onSubscribe()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscribe to {creatorName}</h2>
        <p className="text-muted-foreground">
          Choose a subscription tier to support {creatorName} and get access to exclusive content
        </p>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockTiers.map((tier) => (
              <SubscriptionTierCard key={tier.id} tier={tier} onSelect={() => handleSelectTier(tier)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quarterly" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Quarterly subscription options coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Yearly subscription options coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              Subscribe to {creatorName}'s {selectedTier?.name} tier
            </DialogDescription>
          </DialogHeader>

          {selectedTier && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{selectedTier.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTier.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(selectedTier.price)}</div>
                  <div className="text-sm text-muted-foreground">per {selectedTier.billingPeriod}</div>
                </div>
              </div>

              <div className="border-t border-b py-4 my-4">
                <h4 className="font-medium mb-2">What you'll get:</h4>
                <ul className="space-y-2">
                  {selectedTier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-1 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription
                  at any time.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} disabled={isProcessing}>
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface SubscriptionTierCardProps {
  tier: SubscriptionTier
  onSelect: () => void
}

function SubscriptionTierCard({ tier, onSelect }: SubscriptionTierCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card
      className="overflow-hidden border-t-4 hover:shadow-md transition-shadow"
      style={{ borderTopColor: tier.color || "#000" }}
    >
      <CardHeader>
        <CardTitle>{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="text-3xl font-bold">{formatCurrency(tier.price)}</span>
          <span className="text-muted-foreground">/{tier.billingPeriod}</span>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Features:</h4>
          <ul className="space-y-1">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-1 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onSelect}>
          Subscribe
        </Button>
      </CardFooter>
    </Card>
  )
}

