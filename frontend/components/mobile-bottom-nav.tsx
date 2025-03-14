"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Heart, MessageSquare, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const isMobile = useMobile()

  if (!isMobile) return null

  const routes = [
    {
      href: "/feed",
      icon: <Home className="h-5 w-5" />,
      label: "Feed",
      active: pathname === "/feed",
    },
    {
      href: "/discover",
      icon: <Compass className="h-5 w-5" />,
      label: "Discover",
      active: pathname === "/discover",
    },
    {
      href: "/subscriptions",
      icon: <Heart className="h-5 w-5" />,
      label: "Subscriptions",
      active: pathname === "/subscriptions",
    },
    {
      href: "/messages",
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Messages",
      active: pathname === "/messages",
    },
    {
      href: "/menu",
      icon: <Menu className="h-5 w-5" />,
      label: "Menu",
      active: false,
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex items-center justify-around h-16">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            route.active ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {route.icon}
          <span className="text-xs mt-1">{route.label}</span>
        </Link>
      ))}
    </div>
  )
}

