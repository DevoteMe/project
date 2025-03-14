import type React from "react"
import { Bell, Search, Users, FileText, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: "bell" | "search" | "users" | "content" | "error"
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case "bell":
        return <Bell className="h-12 w-12 text-muted-foreground" />
      case "search":
        return <Search className="h-12 w-12 text-muted-foreground" />
      case "users":
        return <Users className="h-12 w-12 text-muted-foreground" />
      case "content":
        return <FileText className="h-12 w-12 text-muted-foreground" />
      case "error":
        return <AlertCircle className="h-12 w-12 text-destructive" />
      default:
        return null
    }
  }

  return (
    <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      {icon && <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">{getIcon()}</div>}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

