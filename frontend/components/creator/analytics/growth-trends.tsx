"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-picker-range"
import { subMonths } from "date-fns"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

export function GrowthTrends() {
  const { growthTrends, loadingAnalytics, fetchGrowthTrends } = useCreatorTools()
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  })

  useEffect(() => {
    fetchGrowthTrends({
      start: dateRange.from,
      end: dateRange.to,
    })
  }, [fetchGrowthTrends, dateRange])

  if (loadingAnalytics) {
    return <GrowthTrendsSkeleton />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Growth Trends</CardTitle>
          <CardDescription>Track your audience growth and engagement over time</CardDescription>
        </div>
        <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {growthTrends && growthTrends.length > 0 ? (
            <ChartContainer
              config={{
                followers: {
                  label: "New Followers",
                  color: "hsl(var(--chart-1))",
                },
                engagement: {
                  label: "Engagement",
                  color: "hsl(var(--chart-2))",
                },
                revenue: {
                  label: "Revenue ($)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrends} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="followers"
                    name="New Followers"
                    stroke="var(--color-followers)"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="engagement"
                    name="Engagement"
                    stroke="var(--color-engagement)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke="var(--color-revenue)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No growth data available for the selected period</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function GrowthTrendsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-72" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  )
}

