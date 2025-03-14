"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Home,
  Compass,
  Users,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  CreditCard,
  Upload,
  BarChart,
  Zap,
  User,
  Activity,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isCreator = user?.userType === "CONTENT_CREATOR"

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</h2>
          <div className="space-y-1">
            <Button variant={pathname === "/feed" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/feed">
                <Home className="mr-2 h-4 w-4" />
                Feed
              </Link>
            </Button>
            <Button variant={pathname === "/discover" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/discover">
                <Compass className="mr-2 h-4 w-4" />
                Discover
              </Link>
            </Button>
            <Button
              variant={pathname === "/subscriptions" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/subscriptions">
                <Heart className="mr-2 h-4 w-4" />
                Subscriptions
              </Link>
            </Button>
            <Button variant={pathname === "/messages" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <Button
              variant={pathname === "/notifications" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Link>
            </Button>
            <Button
              variant={pathname === "/admin/analytics" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/admin/analytics">
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button
              variant={pathname === "/admin/monitoring" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/admin/monitoring">
                <Activity className="mr-2 h-4 w-4" />
                Monitoring
              </Link>
            </Button>
          </div>
        </div>

        {isCreator && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Creator</h2>
            <div className="space-y-1">
              <Button variant={pathname === "/studio" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                <Link href="/studio">
                  <BarChart className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant={pathname === "/studio/upload" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/studio/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Link>
              </Button>
              <Button
                variant={pathname === "/studio/subscribers" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/studio/subscribers">
                  <Users className="mr-2 h-4 w-4" />
                  Subscribers
                </Link>
              </Button>
              <Button
                variant={pathname === "/studio/premium-spots" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/studio/premium-spots">
                  <Zap className="mr-2 h-4 w-4" />
                  Premium Spots
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Account</h2>
          <div className="space-y-1">
            <Button variant={pathname === "/profile" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button variant={pathname === "/billing" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </Button>
            <Button variant={pathname === "/settings" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

