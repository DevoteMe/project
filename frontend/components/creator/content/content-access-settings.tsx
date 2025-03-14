"use client"

import { useState, useEffect } from "react"
import type { AccessLevel, ContentAccess } from "@/types/exclusive-content"
import type { SubscriptionTier } from "@/types/subscription"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Lock, Globe, Users } from "lucide-react"

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

interface ContentAccessSettingsProps {
  contentId: string
  initialAccess?: ContentAccess
  onSave?: (access: ContentAccess) => void
}

export function ContentAccessSettings({ contentId, initialAccess, onSave }: ContentAccessSettingsProps) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(initialAccess?.accessLevel || "public")
  const [allowedTierIds, setAllowedTierIds] = useState<string[]>(initialAccess?.allowedTierIds || [])
  const [previewEnabled, setPreviewEnabled] = useState<boolean>(initialAccess?.previewEnabled || false)
  const [previewPercentage, setPreviewPercentage] = useState<number>(initialAccess?.previewPercentage || 20)
  const [tiers, setTiers] = useState<SubscriptionTier[]>(mockTiers)

  useEffect(() => {
    if (accessLevel !== "tier-specific") {
      setAllowedTierIds([])
    }
  }, [accessLevel])

  const handleTierToggle = (tierId: string) => {
    setAllowedTierIds((prev) => (prev.includes(tierId) ? prev.filter((id) => id !== tierId) : [...prev, tierId]))
  }

  const handleSave = () => {
    const accessSettings: ContentAccess = {
      id: initialAccess?.id || `access-${contentId}`,
      contentId,
      accessLevel,
      allowedTierIds: accessLevel === "tier-specific" ? allowedTierIds : undefined,
      previewEnabled,
      previewPercentage: previewEnabled ? previewPercentage : undefined,
      createdAt: initialAccess?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real app, this would call an API to save the settings
    if (onSave) {
      onSave(accessSettings)
    }

    toast({
      title: "Access settings saved",
      description: "Your content access settings have been updated.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Access Settings</CardTitle>
        <CardDescription>Control who can access this content and how it's previewed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Who can view this content?</h3>

          <RadioGroup
            value={accessLevel}
            onValueChange={(value) => setAccessLevel(value as AccessLevel)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 rounded-md border p-3">
              <RadioGroupItem value="public" id="public" className="mt-1" />
              <div className="flex flex-1 flex-col">
                <Label htmlFor="public" className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Public
                </Label>
                <p className="text-sm text-muted-foreground">
                  Anyone can view this content, even if they're not subscribed to you.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-md border p-3">
              <RadioGroupItem value="subscribers" id="subscribers" className="mt-1" />
              <div className="flex flex-1 flex-col">
                <Label htmlFor="subscribers" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  All Subscribers
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only your subscribers can view this content, regardless of their tier.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-md border p-3">
              <RadioGroupItem value="tier-specific" id="tier-specific" className="mt-1" />
              <div className="flex flex-1 flex-col">
                <Label htmlFor="tier-specific" className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Specific Tiers
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only subscribers of specific tiers can view this content.
                </p>

                {accessLevel === "tier-specific" && (
                  <div className="mt-3 space-y-3 border-t pt-3">
                    <p className="text-sm font-medium">Select which tiers can access this content:</p>
                    {tiers.map((tier) => (
                      <div key={tier.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tier-${tier.id}`}
                          checked={allowedTierIds.includes(tier.id)}
                          onCheckedChange={() => handleTierToggle(tier.id)}
                        />
                        <Label htmlFor={`tier-${tier.id}`} className="flex items-center">
                          <div
                            className="mr-2 h-3 w-3 rounded-full"
                            style={{ backgroundColor: tier.color || "#000" }}
                          />
                          {tier.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>
        </div>

        {accessLevel !== "public" && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Enable Content Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Allow non-subscribers to preview a portion of this content
                </p>
              </div>
              <Checkbox
                id="preview-enabled"
                checked={previewEnabled}
                onCheckedChange={(checked) => setPreviewEnabled(!!checked)}
              />
            </div>

            {previewEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="preview-percentage">Preview Percentage</Label>
                  <span className="text-sm">{previewPercentage}%</span>
                </div>
                <Slider
                  id="preview-percentage"
                  min={10}
                  max={50}
                  step={5}
                  value={[previewPercentage]}
                  onValueChange={(value) => setPreviewPercentage(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Non-subscribers will be able to view {previewPercentage}% of your content before being prompted to
                  subscribe.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Access Settings</Button>
      </CardFooter>
    </Card>
  )
}

