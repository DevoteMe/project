"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RevenueData } from "@/services/analytics-service"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useState } from "react"

interface RevenueChartProps {
  data: RevenueData
  className?: string
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const [chartView, setChartView] = useState<"history" | "breakdown">("history")

  // Transform data for the breakdown chart
  const breakdownData = [
    { name: "Subscriptions", value: data.subscriptionRevenue },
    { name: "Spot Sales", value: data.spotSalesRevenue },
    { name: "Tips", value: data.tipsRevenue },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue</CardTitle>
          <Tabs defaultValue="history" value={chartView} onValueChange={(value) => setChartView(value as any)}>
            <TabsList>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>{chartView === "history" ? "Revenue over time" : "Revenue by source"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              amount: {
                label: "Amount ($)",
                color: "hsl(var(--chart-3))",
              },
              value: {
                label: "Amount ($)",
                color: "hsl(var(--chart-3))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "history" ? (
                <LineChart data={data.revenueHistory}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={breakdownData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

