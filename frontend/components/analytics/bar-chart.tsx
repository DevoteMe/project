"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"

interface DataPoint {
  name: string
  value: number
}

interface BarChartProps {
  title: string
  description?: string
  data: DataPoint[]
  className?: string
  height?: number
  color?: string
  valuePrefix?: string
  valueSuffix?: string
}

export function BarChart({
  title,
  description,
  data,
  className,
  height = 300,
  color = "hsl(var(--primary))",
  valuePrefix = "",
  valueSuffix = "",
}: BarChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-sm">
          <p className="text-sm font-medium">{label}</p>
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
            <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
              <XAxis dataKey="name" stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} />
              <YAxis
                stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                tickFormatter={(value) => `${valuePrefix}${value.toLocaleString()}${valueSuffix}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

