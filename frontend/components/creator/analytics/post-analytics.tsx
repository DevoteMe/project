"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/date-picker-range"
import { format } from "date-fns"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PostAnalyticsComponent() {
  const { postAnalytics, loadingAnalytics, fetchPostAnalytics } = useCreatorTools()
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })

  useEffect(() => {
    fetchPostAnalytics({
      start: dateRange.from,
      end: dateRange.to,
    })
  }, [fetchPostAnalytics, dateRange])

  const handleExportCSV = () => {
    if (!postAnalytics.length) return

    // Create CSV content
    const headers = [
      "Post Title",
      "Publish Date",
      "Views",
      "Unique Views",
      "Likes",
      "Comments",
      "Shares",
      "Bookmarks",
      "Avg. Read Time (s)",
      "Bounce Rate (%)",
      "Clickthrough Rate (%)",
    ].join(",")

    const rows = postAnalytics.map((post) =>
      [
        `"${post.title.replace(/"/g, '""')}"`,
        format(new Date(post.publishDate), "yyyy-MM-dd"),
        post.views,
        post.uniqueViews,
        post.likes,
        post.comments,
        post.shares,
        post.bookmarks,
        post.averageReadTime.toFixed(1),
        post.bounceRate.toFixed(1),
        post.clickthroughRate.toFixed(1),
      ].join(","),
    )

    const csvContent = [headers, ...rows].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `post-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loadingAnalytics) {
    return <PostAnalyticsSkeleton />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Post Analytics</CardTitle>
          <CardDescription>
            Performance metrics for your posts from {format(dateRange.from, "MMM d, yyyy")} to{" "}
            {format(dateRange.to, "MMM d, yyyy")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!postAnalytics.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="engagement">
          <TabsList className="mb-4">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="views">Views</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement">
            <div className="h-[400px]">
              {postAnalytics.length > 0 ? (
                <ChartContainer
                  config={{
                    likes: {
                      label: "Likes",
                      color: "hsl(var(--chart-1))",
                    },
                    comments: {
                      label: "Comments",
                      color: "hsl(var(--chart-2))",
                    },
                    shares: {
                      label: "Shares",
                      color: "hsl(var(--chart-3))",
                    },
                    bookmarks: {
                      label: "Bookmarks",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={postAnalytics.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="likes" name="Likes" fill="var(--color-likes)" />
                      <Bar dataKey="comments" name="Comments" fill="var(--color-comments)" />
                      <Bar dataKey="shares" name="Shares" fill="var(--color-shares)" />
                      <Bar dataKey="bookmarks" name="Bookmarks" fill="var(--color-bookmarks)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="views">
            <div className="h-[400px]">
              {postAnalytics.length > 0 ? (
                <ChartContainer
                  config={{
                    views: {
                      label: "Total Views",
                      color: "hsl(var(--chart-1))",
                    },
                    uniqueViews: {
                      label: "Unique Views",
                      color: "hsl(var(--chart-2))",
                    },
                    averageReadTime: {
                      label: "Avg. Read Time (s)",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={postAnalytics.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="views"
                        name="Total Views"
                        stroke="var(--color-views)"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="uniqueViews"
                        name="Unique Views"
                        stroke="var(--color-uniqueViews)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="averageReadTime"
                        name="Avg. Read Time (s)"
                        stroke="var(--color-averageReadTime)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="table">
            {postAnalytics.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post Title</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Likes</TableHead>
                      <TableHead className="text-right">Comments</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">CTR (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postAnalytics.map((post) => (
                      <TableRow key={post.postId}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{format(new Date(post.publishDate), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">{post.views}</TableCell>
                        <TableCell className="text-right">{post.likes}</TableCell>
                        <TableCell className="text-right">{post.comments}</TableCell>
                        <TableCell className="text-right">{post.shares}</TableCell>
                        <TableCell className="text-right">{post.clickthroughRate.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-md border">
                <p className="text-muted-foreground">No data available for the selected period</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function PostAnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  )
}

