"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings, Upload, BarChart2, Grid3X3, MessageSquare, DollarSign, Users, HelpCircle } from "lucide-react"

const routes = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/creator/dashboard",
    variant: "default",
  },
  {
    title: "Content",
    icon: Grid3X3,
    href: "/creator/content",
    variant: "ghost",
  },
  {
    title: "Upload",
    icon: Upload,
    href: "/creator/upload",
    variant: "ghost",
  },
  {
    title: "Analytics",
    icon: BarChart2,
    href: "/creator/analytics",
    variant: "ghost",
  },
  {
    title: "Comments",
    icon: MessageSquare,
    href: "/creator/comments",
    variant: "ghost",
  },
  {
    title: "Earnings",
    icon: DollarSign,
    href: "/creator/earnings",
    variant: "ghost",
  },
  {
    title: "Followers",
    icon: Users,
    href: "/creator/followers",
    variant: "ghost",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/creator/settings",
    variant: "ghost",
  },
  {
    title: "Help",
    icon: HelpCircle,
    href: "/creator/help",
    variant: "ghost",
  },
]

export function CreatorSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-xl font-semibold">Creator Studio</h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              size="sm"
              className={cn("w-full justify-start", pathname === route.href && "bg-muted")}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-4 w-4" />
                {route.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-sm font-semibold">Quick Links</h3>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/creator/settings/profile">Creator Profile</Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/creator/settings/subscription">Subscription Settings</Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/creator/settings/payments">Payment Methods</Link>
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

