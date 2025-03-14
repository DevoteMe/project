import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnalyticsMetric } from "@/services/analytics-service"

interface MetricCardProps {
  metric: AnalyticsMetric
  prefix?: string
  suffix?: string
  className?: string
}

export function MetricCard({ metric, prefix = "", suffix = "", className }: MetricCardProps) {
  const isPositive = metric.change >= 0
  const formattedValue = metric.value.toLocaleString()
  const formattedChange = Math.abs(metric.change).toFixed(1)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {formattedValue}
          {suffix}
        </div>
        <div className="flex items-center mt-1">
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={cn("text-sm", isPositive ? "text-green-500" : "text-red-500")}>{formattedChange}%</span>
          <span className="text-xs text-muted-foreground ml-1">vs previous period</span>
        </div>
      </CardContent>
    </Card>
  )
}

