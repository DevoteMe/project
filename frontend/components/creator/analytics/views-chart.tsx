"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ViewsChartProps {
  data: {
    labels: string[]
    data: number[]
  }
}

export function ViewsChart({ data }: ViewsChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    views: data.data[index],
  }))

  return (
    <ChartContainer
      config={{
        views: {
          label: "Views",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="aspect-[4/3] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="views"
            strokeWidth={2}
            activeDot={{ r: 6, style: { fill: "var(--color-views)", opacity: 0.8 } }}
            isAnimationActive={true}
            animationDuration={1000}
            stroke="var(--color-views)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// Helper function to format numbers in compact form (e.g., 1K, 1M)
function formatCompactNumber(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

