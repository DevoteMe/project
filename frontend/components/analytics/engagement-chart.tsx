"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EngagementData } from "@/services/analytics-service"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface EngagementChartProps {
  data: EngagementData
  className?: string
}

export function EngagementChart({ data, className }: EngagementChartProps) {
  // Transform data for the chart
  const chartData = [
    { name: "Likes", value: data.likes },
    { name: "Comments", value: data.comments },
    { name: "Shares", value: data.shares },
    { name: "Saves", value: data.saves },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Engagement</CardTitle>
        <CardDescription>Breakdown of user engagement with your content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              value: {
                label: "Count",
                color: "hsl(var(--chart-2))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

