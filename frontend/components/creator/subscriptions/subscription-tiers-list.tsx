"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle, Edit, Trash2, EyeOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { SubscriptionTier } from "@/types/subscription"
import { toast } from "@/hooks/use-toast"

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

export function SubscriptionTiersList() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>(mockTiers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")

  const handleOpenDialog = (tier?: SubscriptionTier) => {
    if (tier) {
      setCurrentTier(tier)
      setFeatures(tier.features)
    } else {
      setCurrentTier(null)
      setFeatures([])
    }
    setIsDialogOpen(true)
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault()

    // Form validation would go here

    // Mock save functionality
    toast({
      title: currentTier ? "Tier updated" : "Tier created",
      description: `Successfully ${currentTier ? "updated" : "created"} subscription tier.`,
    })

    setIsDialogOpen(false)
  }

  const handleToggleVisibility = (tierId: string) => {
    setTiers(tiers.map((tier) => (tier.id === tierId ? { ...tier, isPublic: !tier.isPublic } : tier)))

    toast({
      title: "Visibility updated",
      description: "Subscription tier visibility has been updated.",
    })
  }

  const handleDeleteTier = (tierId: string) => {
    // In a real app, you'd confirm before deleting
    setTiers(tiers.filter((tier) => tier.id !== tierId))

    toast({
      title: "Tier deleted",
      description: "Subscription tier has been deleted.",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Subscription Tiers</h2>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Tier
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.id} className="overflow-hidden border-t-4" style={{ borderTopColor: tier.color || "#000" }}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </div>
                <div className="flex space-x-1">
                  {tier.isDefault && (
                    <Badge variant="outline" className="ml-2">
                      Default
                    </Badge>
                  )}
                  {!tier.isPublic && (
                    <Badge variant="outline" className="ml-2">
                      Hidden
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">{formatCurrency(tier.price)}</span>
                <span className="text-muted-foreground">/{tier.billingPeriod}</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="space-y-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current subscribers:</span>
                  <span className="font-medium">{tier.currentSubscribers}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
              <Button variant="ghost" size="sm" onClick={() => handleToggleVisibility(tier.id)}>
                {tier.isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {tier.isPublic ? "Hide" : "Show"}
              </Button>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(tier)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteTier(tier.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentTier ? "Edit Subscription Tier" : "Create Subscription Tier"}</DialogTitle>
            <DialogDescription>
              {currentTier
                ? "Update the details of your subscription tier."
                : "Create a new subscription tier for your followers."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTier} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tier Name</Label>
                <Input id="name" defaultValue={currentTier?.name || ""} placeholder="e.g., Bronze Supporter" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color (Hex)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="color"
                    defaultValue={currentTier?.color || "#000000"}
                    placeholder="#000000"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: currentTier?.color || "#000000" }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={currentTier?.description || ""}
                placeholder="Describe what subscribers get with this tier"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0.99"
                  step="0.01"
                  defaultValue={currentTier?.price || 4.99}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingPeriod">Billing Period</Label>
                <Select defaultValue={currentTier?.billingPeriod || "monthly"}>
                  <SelectTrigger id="billingPeriod">
                    <SelectValue placeholder="Select billing period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input value={feature} readOnly className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFeature(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddFeature}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isDefault" defaultChecked={currentTier?.isDefault || false} />
              <Label htmlFor="isDefault">Set as default tier</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isPublic" defaultChecked={currentTier?.isPublic !== false} />
              <Label htmlFor="isPublic">Make tier public</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{currentTier ? "Update Tier" : "Create Tier"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

