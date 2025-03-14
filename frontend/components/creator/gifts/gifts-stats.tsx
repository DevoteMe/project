"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for demonstration
const revenueData = [
  { month: "Jan", amount: 120 },
  { month: "Feb", amount: 180 },
  { month: "Mar", amount: 150 },
  { month: "Apr", amount: 210 },
  { month: "May", amount: 240 },
  { month: "Jun", amount: 290 },
]

const popularGifts = [
  { name: "Heart", count: 42, imageUrl: "/placeholder.svg?height=40&width=40" },
  { name: "Star", count: 28, imageUrl: "/placeholder.svg?height=40&width=40" },
  { name: "Trophy", count: 15, imageUrl: "/placeholder.svg?height=40&width=40" },
]

export function GiftsStats() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gifts Received</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">187</div>
          <p className="text-xs text-muted-foreground">+24% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gift Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(1190)}</div>
          <p className="text-xs text-muted-foreground">+18% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Gift Senders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">73</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Gift Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(6.36)}</div>
          <p className="text-xs text-muted-foreground">+5% from last month</p>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Gift Revenue Over Time</CardTitle>
          <CardDescription>Monthly gift revenue</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{
              amount: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Most Popular Gifts</CardTitle>
          <CardDescription>Gifts received most frequently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularGifts.map((gift, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <img src={gift.imageUrl || "/placeholder.svg"} alt={gift.name} className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">{gift.name}</p>
                    <p className="text-sm text-muted-foreground">{gift.count} received</p>
                  </div>
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(gift.count / popularGifts[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

