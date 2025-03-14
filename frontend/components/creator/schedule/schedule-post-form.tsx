"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Editor } from "@/components/editor"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { TimeField } from "@/components/ui/time-field"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const scheduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  scheduledDate: z.date({
    required_error: "Please select a date",
  }),
  scheduledTime: z.date({
    required_error: "Please select a time",
  }),
  timezone: z.string().default("UTC"),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  recurringInterval: z.number().min(1).max(30).optional(),
  recurringEndDate: z.date().optional(),
})

export function SchedulePostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get("draftId")

  const { getDraft, schedulePost } = useCreatorTools()

  const [isLoading, setIsLoading] = useState(draftId ? true : false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewContent, setPreviewContent] = useState("")

  const form = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      tags: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isRecurring: false,
    },
  })

  const isRecurring = form.watch("isRecurring")
  const recurringFrequency = form.watch("recurringFrequency")

  // Fetch draft data if provided
  useEffect(() => {
    if (draftId) {
      const fetchDraft = async () => {
        try {
          const draft = await getDraft(draftId)

          // Set initial form values from draft
          const now = new Date()
          const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

          form.reset({
            title: draft.title,
            content: draft.content,
            categoryId: draft.categoryId,
            tags: draft.tags,
            scheduledDate: now,
            scheduledTime: oneHourLater,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isRecurring: false,
          })

          setPreviewContent(draft.content)
          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching draft:", error)
          toast({
            title: "Error",
            description: "Failed to load draft. Please try again.",
            variant: "destructive",
          })
          router.push("/creator/schedule")
        }
      }

      fetchDraft()
    } else {
      // Set default date/time values for new schedule
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

      form.setValue("scheduledDate", now)
      form.setValue("scheduledTime", oneHourLater)
    }
  }, [draftId, getDraft, form, router])

  const onSubmit = async (data: z.infer<typeof scheduleSchema>) => {
    setIsSubmitting(true)

    try {
      // Combine date and time into a single ISO string
      const scheduledDate = new Date(data.scheduledDate)
      const scheduledTime = new Date(data.scheduledTime)

      scheduledDate.setHours(scheduledTime.getHours(), scheduledTime.getMinutes(), 0, 0)

      // Build recurring pattern if needed
      const recurringPattern = data.isRecurring
        ? {
            frequency: data.recurringFrequency,
            interval: data.recurringInterval || 1,
            ...(data.recurringEndDate && {
              endDate: data.recurringEndDate.toISOString(),
            }),
          }
        : undefined

      // Schedule the post
      await schedulePost({
        title: data.title,
        content: data.content,
        scheduledFor: scheduledDate.toISOString(),
        timezone: data.timezone,
        categoryId: data.categoryId,
        tags: data.tags || [],
        recurringPattern,
      })

      toast({
        title: "Post scheduled",
        description: `Your post has been scheduled for ${format(scheduledDate, "PPPp")}`,
      })

      router.push("/creator/scheduled")
    } catch (error) {
      console.error("Error scheduling post:", error)
      toast({
        title: "Error",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContentChange = (value: string) => {
    form.setValue("content", value)
    setPreviewContent(value)
  }

  if (isLoading) {
    return <ScheduleFormSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedule Post</h1>
        <Button type="submit" form="schedule-form" disabled={isSubmitting}>
          {isSubmitting ? "Scheduling..." : "Schedule Post"}
        </Button>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Form {...form}>
            <form id="schedule-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                      <Editor
                        value={field.value}
                        onChange={handleContentChange}
                        placeholder="Write your post content here..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <TimeField value={field.value} onChange={field.onChange} aria-label="Schedule time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make this a recurring post</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This post will be published repeatedly according to the schedule
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {isRecurring && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="recurringFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurringInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {recurringFrequency === "daily"
                            ? "Every X days"
                            : recurringFrequency === "weekly"
                              ? "Every X weeks"
                              : "Every X months"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurringEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "PPP") : <span>No end date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date() || date < form.getValues("scheduledDate")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="p-6">
              <h1 className="mb-4 text-2xl font-bold">{form.watch("title") || "Untitled Post"}</h1>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ScheduleFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

