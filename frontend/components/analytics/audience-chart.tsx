"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AudienceData } from "@/services/analytics-service"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { useState } from "react"

interface AudienceChartProps {
  data: AudienceData
  className?: string
}

export function AudienceChart({ data, className }: AudienceChartProps) {
  const [chartType, setChartType] = useState<"age" | "gender" | "location">("age")

  // Prepare chart data based on selected type
  const getChartData = () => {
    switch (chartType) {
      case "age":
        return data.demographics.ageGroups
      case "gender":
        return data.demographics.genders
      case "location":
        return data.demographics.locations
          .map((loc) => ({
            label: loc.country,
            value: loc.count,
          }))
          .slice(0, 5) // Top 5 locations
    }
  }

  const chartData = getChartData()

  // Colors for the pie chart
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audience</CardTitle>
          <Tabs defaultValue="age" value={chartType} onValueChange={(value) => setChartType(value as any)}>
            <TabsList>
              <TabsTrigger value="age">Age</TabsTrigger>
              <TabsTrigger value="gender">Gender</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>
          {chartType === "age" && "Age distribution of your audience"}
          {chartType === "gender" && "Gender distribution of your audience"}
          {chartType === "location" && "Top locations of your audience"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="label"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

