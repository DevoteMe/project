"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Calendar, BarChart, Settings, CreditCard, Gift, Lock, Users } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/creator",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
  },
  {
    title: "Content",
    href: "/creator/content",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
  {
    title: "Drafts",
    href: "/creator/drafts",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
  {
    title: "Scheduled",
    href: "/creator/scheduled",
    icon: <Calendar className="mr-2 h-4 w-4" />,
  },
  {
    title: "Templates",
    href: "/creator/templates",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
  {
    title: "Analytics",
    href: "/creator/analytics",
    icon: <BarChart className="mr-2 h-4 w-4" />,
  },
]

const monetizationItems: NavItem[] = [
  {
    title: "Subscriptions",
    href: "/creator/subscriptions",
    icon: <Users className="mr-2 h-4 w-4" />,
  },
  {
    title: "Exclusive Content",
    href: "/creator/exclusive",
    icon: <Lock className="mr-2 h-4 w-4" />,
  },
  {
    title: "Gifts & Tips",
    href: "/creator/gifts",
    icon: <Gift className="mr-2 h-4 w-4" />,
  },
  {
    title: "Premium Spots",
    href: "/creator/premium-spots",
    icon: <CreditCard className="mr-2 h-4 w-4" />,
  },
]

const settingsItems: NavItem[] = [
  {
    title: "Settings",
    href: "/creator/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn("w-full justify-start", pathname === item.href && "bg-muted font-medium")}
          >
            {item.icon}
            {item.title}
          </Button>
        </Link>
      ))}

      <div className="mt-6">
        <h4 className="px-4 py-2 text-sm font-semibold text-muted-foreground">Monetization</h4>
        {monetizationItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === item.href && "bg-muted font-medium")}
            >
              {item.icon}
              {item.title}
            </Button>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {settingsItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === item.href && "bg-muted font-medium")}
            >
              {item.icon}
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}

