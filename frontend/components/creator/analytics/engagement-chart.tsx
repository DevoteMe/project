"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface EngagementChartProps {
  data: {
    labels: string[]
    likes: number[]
    comments: number[]
    shares: number[]
  }
}

export function EngagementChart({ data }: EngagementChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    likes: data.likes[index],
    comments: data.comments[index],
    shares: data.shares[index],
  }))

  return (
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
          <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="likes"
            strokeWidth={2}
            activeDot={{ r: 6, style: { fill: "var(--color-likes)", opacity: 0.8 } }}
            isAnimationActive={true}
            animationDuration={1000}
            stroke="var(--color-likes)"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="comments"
            strokeWidth={2}
            activeDot={{ r: 6, style: { fill: "var(--color-comments)", opacity: 0.8 } }}
            isAnimationActive={true}
            animationDuration={1000}
            stroke="var(--color-comments)"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="shares"
            strokeWidth={2}
            activeDot={{ r: 6, style: { fill: "var(--color-shares)", opacity: 0.8 } }}
            isAnimationActive={true}
            animationDuration={1000}
            stroke="var(--color-shares)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

