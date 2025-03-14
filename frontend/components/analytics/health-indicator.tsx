import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

type HealthStatus = "healthy" | "warning" | "error"

interface HealthIndicatorProps {
  title: string
  description?: string
  status: HealthStatus
  metric?: string
  className?: string
}

export function HealthIndicator({ title, description, status, metric, className }: HealthIndicatorProps) {
  return (
    <Card
      className={cn(
        "border-l-4",
        status === "healthy" ? "border-l-green-500" : status === "warning" ? "border-l-yellow-500" : "border-l-red-500",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {status === "healthy" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : status === "warning" ? (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {metric && (
        <CardContent>
          <div className="text-xl font-bold">{metric}</div>
        </CardContent>
      )}
    </Card>
  )
}

