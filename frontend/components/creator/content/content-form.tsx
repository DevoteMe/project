"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import type { SubscriptionTier } from "@/types/subscription"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

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

const formSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters.",
    })
    .max(100, {
      message: "Title must not exceed 100 characters.",
    }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  type: z.enum(["post", "image", "video", "audio", "poll"]),
  tags: z.string().optional(),
  accessLevel: z.enum(["public", "subscribers", "tier-specific"]),
  allowedTierIds: z.array(z.string()).optional(),
  previewEnabled: z.boolean().default(false),
  previewPercentage: z.number().min(5).max(50).optional(),
  publishNow: z.boolean().default(true),
  scheduledDate: z.date().optional(),
})

type ContentFormValues = z.infer<typeof formSchema>

interface ContentFormProps {
  initialData?: ContentFormValues
  isEditing?: boolean
}

export function ContentForm({ initialData, isEditing = false }: ContentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<ContentFormValues> = initialData || {
    title: "",
    content: "",
    type: "post",
    tags: "",
    accessLevel: "public",
    allowedTierIds: [],
    previewEnabled: false,
    previewPercentage: 20,
    publishNow: true,
  }

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const accessLevel = form.watch("accessLevel")
  const previewEnabled = form.watch("previewEnabled")
  const publishNow = form.watch("publishNow")

  const onSubmit = async (values: ContentFormValues) => {
    try {
      setIsSubmitting(true)

      // In a real app, this would call an API to save the content
      console.log("Form values:", values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: isEditing ? "Content updated" : "Content created",
        description: isEditing
          ? "Your content has been updated successfully."
          : publishNow
            ? "Your content has been published successfully."
            : "Your content has been scheduled successfully.",
      })

      router.push("/creator/content")
    } catch (error) {
      console.error("Error submitting content:", error)
      toast({
        title: "Error",
        description: "There was an error saving your content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Content" : "Create New Content"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update your existing content" : "Create and publish new content for your followers"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="post">Text Post</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="poll">Poll</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your content here..." className="min-h-[200px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tags separated by commas" {...field} />
                  </FormControl>
                  <FormDescription>Tags help your content get discovered</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Settings</CardTitle>
            <CardDescription>Control who can access this content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="accessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public (Everyone)</SelectItem>
                      <SelectItem value="subscribers">Subscribers Only</SelectItem>
                      <SelectItem value="tier-specific">Specific Subscription Tiers</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {accessLevel === "public" && "Anyone can view this content"}
                    {accessLevel === "subscribers" && "Only your subscribers can view this content"}
                    {accessLevel === "tier-specific" && "Only subscribers of specific tiers can view this content"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accessLevel === "tier-specific" && (
              <FormField
                control={form.control}
                name="allowedTierIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Allowed Subscription Tiers</FormLabel>
                      <FormDescription>Select which subscription tiers can access this content</FormDescription>
                    </div>
                    <div className="space-y-2">
                      {mockTiers.map((tier) => (
                        <div key={tier.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tier-${tier.id}`}
                            checked={field.value?.includes(tier.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), tier.id])
                              } else {
                                field.onChange(field.value?.filter((value) => value !== tier.id) || [])
                              }
                            }}
                          />
                          <label
                            htmlFor={`tier-${tier.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {tier.name} ({tier.currentSubscribers} subscribers)
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(accessLevel === "subscribers" || accessLevel === "tier-specific") && (
              <>
                <FormField
                  control={form.control}
                  name="previewEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Content Preview</FormLabel>
                        <FormDescription>Allow non-subscribers to preview a portion of your content</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {previewEnabled && (
                  <FormField
                    control={form.control}
                    name="previewPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preview Percentage</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min={5}
                              max={50}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <span>%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Percentage of content visible to non-subscribers (5-50%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
            <CardDescription>Choose when to publish your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="publishNow"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publish Immediately</FormLabel>
                    <FormDescription>Your content will be published as soon as you submit</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {!publishNow && (
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Schedule Publication</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Select when your content should be published</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Content" : publishNow ? "Publish Now" : "Schedule"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

