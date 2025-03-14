"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RevenueChartProps {
  data: {
    labels: string[]
    premium: number[]
    spots: number[]
    tips: number[]
  }
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    premium: data.premium[index],
    spots: data.spots[index],
    tips: data.tips[index],
    total: data.premium[index] + data.spots[index] + data.tips[index],
  }))

  return (
    <ChartContainer
      config={{
        premium: {
          label: "Premium Content",
          color: "hsl(var(--chart-1))",
        },
        spots: {
          label: "Premium Spots",
          color: "hsl(var(--chart-2))",
        },
        tips: {
          label: "Tips & Donations",
          color: "hsl(var(--chart-3))",
        },
      }}
      className="aspect-[16/9] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={10}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <ChartTooltip content={<ChartTooltipContent valueFormatter={(value) => `$${value.toFixed(2)}`} />} />
          <Bar
            dataKey="premium"
            stackId="a"
            fill="var(--color-premium)"
            radius={[0, 0, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            barSize={20}
          />
          <Bar
            dataKey="spots"
            stackId="a"
            fill="var(--color-spots)"
            radius={[0, 0, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            barSize={20}
          />
          <Bar
            dataKey="tips"
            stackId="a"
            fill="var(--color-tips)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

