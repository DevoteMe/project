import { Badge } from "@/components/ui/badge"
import type { AccessLevel } from "@/types/exclusive-content"
import { Lock, Users } from "lucide-react"

interface ExclusiveBadgeProps {
  accessLevel: AccessLevel
  tierNames?: string[]
  size?: "sm" | "default"
}

export function ExclusiveBadge({ accessLevel, tierNames, size = "default" }: ExclusiveBadgeProps) {
  if (accessLevel === "public") {
    return null
  }

  const sizeClasses = size === "sm" ? "text-xs py-0 px-1.5" : "text-xs py-0.5 px-2.5"

  if (accessLevel === "subscribers") {
    return (
      <Badge variant="secondary" className={sizeClasses}>
        <Users className="mr-1 h-3 w-3" />
        Subscribers Only
      </Badge>
    )
  }

  if (accessLevel === "tier-specific" && tierNames && tierNames.length > 0) {
    return (
      <Badge variant="secondary" className={sizeClasses}>
        <Lock className="mr-1 h-3 w-3" />
        {tierNames.length === 1 ? `${tierNames[0]} Tier` : `${tierNames.length} Tiers`}
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className={sizeClasses}>
      <Lock className="mr-1 h-3 w-3" />
      Exclusive
    </Badge>
  )
}

