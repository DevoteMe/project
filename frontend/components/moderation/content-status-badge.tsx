import type { ModerationStatus } from "@/types/moderation"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ContentStatusBadgeProps {
  status: ModerationStatus
  className?: string
}

export function ContentStatusBadge({ status, className }: ContentStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className={`bg-yellow-50 text-yellow-700 border-yellow-200 ${className}`}>
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="outline" className={`bg-green-50 text-green-700 border-green-200 ${className}`}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      )
    case "denied":
      return (
        <Badge variant="outline" className={`bg-red-50 text-red-700 border-red-200 ${className}`}>
          <XCircle className="h-3 w-3 mr-1" />
          Denied
        </Badge>
      )
    case "quarantined":
      return (
        <Badge variant="outline" className={`bg-orange-50 text-orange-700 border-orange-200 ${className}`}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          Under Review
        </Badge>
      )
    default:
      return null
  }
}

