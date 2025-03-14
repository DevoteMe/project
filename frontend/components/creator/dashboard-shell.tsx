"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart2,
  FileIcon as FileTemplate,
  Settings,
  PlusCircle,
} from "lucide-react"

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/creator",
      icon: LayoutDashboard,
    },
    {
      title: "Drafts",
      href: "/creator/drafts",
      icon: FileText,
    },
    {
      title: "Scheduled",
      href: "/creator/scheduled",
      icon: Calendar,
    },
    {
      title: "Templates",
      href: "/creator/templates",
      icon: FileTemplate,
    },
    {
      title: "Analytics",
      href: "/creator/analytics",
      icon: BarChart2,
    },
    {
      title: "Settings",
      href: "/creator/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-muted/40 lg:flex">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/creator" className="flex items-center gap-2 font-semibold">
              <span className="text-primary">Creator Dashboard</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">Content</h2>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary/50",
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </nav>
          <div className="mt-auto p-4">
            <Button className="w-full" asChild>
              <Link href="/creator/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Post
              </Link>
            </Button>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

