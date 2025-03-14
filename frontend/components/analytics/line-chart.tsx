"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsDataPoint } from "@/services/analytics-service"
import { useTheme } from "next-themes"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import { format } from "date-fns"

interface LineChartProps {
  title: string
  description?: string
  data: AnalyticsDataPoint[]
  className?: string
  height?: number
  color?: string
  valuePrefix?: string
  valueSuffix?: string
}

export function LineChart({
  title,
  description,
  data,
  className,
  height = 300,
  color = "hsl(var(--primary))",
  valuePrefix = "",
  valueSuffix = "",
}: LineChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const formattedData = data.map((point) => ({
    ...point,
    date: new Date(point.timestamp),
  }))

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-sm">
          <p className="text-sm font-medium">{format(new Date(label), "MMM d, yyyy HH:mm")}</p>
          <p className="text-sm text-primary">
            {valuePrefix}
            {payload[0].value?.toLocaleString()}
            {valueSuffix}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "MMM d")}
                stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              />
              <YAxis
                stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                tickFormatter={(value) => `${valuePrefix}${value.toLocaleString()}${valueSuffix}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

