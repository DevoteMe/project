"use client"

import { useModeration } from "@/providers/moderation-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for charts - in a real app, this would come from your API
const DAILY_STATS = [
  { name: "Mon", approved: 24, denied: 4, quarantined: 2, autoApproved: 18 },
  { name: "Tue", approved: 30, denied: 6, quarantined: 3, autoApproved: 22 },
  { name: "Wed", approved: 28, denied: 5, quarantined: 4, autoApproved: 20 },
  { name: "Thu", approved: 32, denied: 7, quarantined: 2, autoApproved: 24 },
  { name: "Fri", approved: 36, denied: 8, quarantined: 5, autoApproved: 26 },
  { name: "Sat", approved: 40, denied: 10, quarantined: 6, autoApproved: 30 },
  { name: "Sun", approved: 38, denied: 9, quarantined: 4, autoApproved: 28 },
]

const COLORS = ["#4ade80", "#f87171", "#fbbf24", "#60a5fa"]

export function ModerationStats() {
  const { stats } = useModeration()

  // Prepare data for pie chart
  const pieData = [
    { name: "Approved", value: stats.approved },
    { name: "Denied", value: stats.denied },
    { name: "Quarantined", value: stats.quarantined },
    { name: "Pending", value: stats.pending },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Content Status Distribution</h3>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      approved: {
                        label: "Approved",
                        color: "hsl(var(--chart-1))",
                      },
                      denied: {
                        label: "Denied",
                        color: "hsl(var(--chart-2))",
                      },
                      quarantined: {
                        label: "Quarantined",
                        color: "hsl(var(--chart-3))",
                      },
                      pending: {
                        label: "Pending",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">{stats.pending}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Pending Review</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">{stats.approved}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Approved</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">{stats.denied}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Denied</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">{stats.quarantined}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Quarantined</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="pt-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Daily Moderation Activity</h3>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    approved: {
                      label: "Approved",
                      color: "hsl(var(--chart-1))",
                    },
                    denied: {
                      label: "Denied",
                      color: "hsl(var(--chart-2))",
                    },
                    quarantined: {
                      label: "Quarantined",
                      color: "hsl(var(--chart-3))",
                    },
                    autoApproved: {
                      label: "Auto-Approved",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DAILY_STATS}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" />
                      <Bar dataKey="denied" stackId="a" fill="var(--color-denied)" />
                      <Bar dataKey="quarantined" stackId="a" fill="var(--color-quarantined)" />
                      <Bar dataKey="autoApproved" stackId="a" fill="var(--color-autoApproved)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

