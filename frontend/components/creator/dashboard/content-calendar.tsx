"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { CalendarIcon, PlusCircle } from "lucide-react"
import Link from "next/link"

export function ContentCalendar() {
  const { scheduledPosts, loadingScheduledPosts, fetchScheduledPosts } = useCreatorTools()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarDates, setCalendarDates] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchScheduledPosts()
  }, [fetchScheduledPosts])

  // Process scheduled posts for calendar view
  useEffect(() => {
    if (scheduledPosts) {
      const dates: Record<string, number> = {}

      scheduledPosts.forEach((post) => {
        const dateStr = format(new Date(post.scheduledFor), "yyyy-MM-dd")
        dates[dateStr] = (dates[dateStr] || 0) + 1
      })

      setCalendarDates(dates)
    }
  }, [scheduledPosts])

  // Get posts for selected date
  const getPostsForSelectedDate = () => {
    if (!selectedDate || !scheduledPosts) return []

    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return scheduledPosts.filter((post) => {
      const postDate = format(new Date(post.scheduledFor), "yyyy-MM-dd")
      return postDate === dateStr
    })
  }

  const selectedDatePosts = getPostsForSelectedDate()

  if (loadingScheduledPosts) {
    return <ContentCalendarSkeleton />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Content Calendar</CardTitle>
          <CardDescription>View and manage your scheduled content</CardDescription>
        </div>
        <Link href="/creator/schedule">
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule Post
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                booked: (date) => {
                  const dateStr = format(date, "yyyy-MM-dd")
                  return !!calendarDates[dateStr]
                },
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                },
              }}
              components={{
                DayContent: (props) => {
                  const dateStr = format(props.date, "yyyy-MM-dd")
                  const count = calendarDates[dateStr]

                  return (
                    <div className="relative h-full w-full p-2">
                      <div>{props.date.getDate()}</div>
                      {count && (
                        <Badge
                          variant="secondary"
                          className="absolute bottom-0 right-0 -mr-1 -mb-1 h-5 w-5 rounded-full p-0 text-[10px]"
                        >
                          {count}
                        </Badge>
                      )}
                    </div>
                  )
                },
              }}
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h3>
            {selectedDatePosts.length > 0 ? (
              <div className="space-y-3">
                {selectedDatePosts.map((post) => (
                  <div key={post.id} className="rounded-md border p-3">
                    <div className="font-medium">{post.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(new Date(post.scheduledFor), "h:mm a")}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={post.status === "scheduled" ? "outline" : "secondary"}>{post.status}</Badge>
                      <Link
                        href={`/creator/scheduled/${post.id}`}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 flex flex-col items-center justify-center text-center">
                <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No content scheduled for this date</p>
                <Link href="/creator/schedule" className="mt-2">
                  <Button variant="outline" size="sm">
                    Schedule Content
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ContentCalendarSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

