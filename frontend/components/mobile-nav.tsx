"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
  Menu,
  LogOut,
} from "lucide-react"

export default function MobileNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const isCreator = user?.userType === "CONTENT_CREATOR"

  const routes = [
    {
      title: "Navigation",
      items: [
        {
          title: "Feed",
          href: "/feed",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/feed",
        },
        {
          title: "Discover",
          href: "/discover",
          icon: <Compass className="h-5 w-5" />,
          active: pathname === "/discover",
        },
        {
          title: "Subscriptions",
          href: "/subscriptions",
          icon: <Heart className="h-5 w-5" />,
          active: pathname === "/subscriptions",
        },
        {
          title: "Messages",
          href: "/messages",
          icon: <MessageSquare className="h-5 w-5" />,
          active: pathname === "/messages",
        },
        {
          title: "Notifications",
          href: "/notifications",
          icon: <Bell className="h-5 w-5" />,
          active: pathname === "/notifications",
        },
      ],
    },
  ]

  if (isCreator) {
    routes.push({
      title: "Creator",
      items: [
        {
          title: "Dashboard",
          href: "/studio",
          icon: <BarChart className="h-5 w-5" />,
          active: pathname === "/studio",
        },
        {
          title: "Upload",
          href: "/studio/upload",
          icon: <Upload className="h-5 w-5" />,
          active: pathname === "/studio/upload",
        },
        {
          title: "Subscribers",
          href: "/studio/subscribers",
          icon: <Users className="h-5 w-5" />,
          active: pathname === "/studio/subscribers",
        },
        {
          title: "Premium Spots",
          href: "/studio/premium-spots",
          icon: <Zap className="h-5 w-5" />,
          active: pathname === "/studio/premium-spots",
        },
      ],
    })
  }

  routes.push({
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
        active: pathname === "/profile",
      },
      {
        title: "Billing",
        href: "/billing",
        icon: <CreditCard className="h-5 w-5" />,
        active: pathname === "/billing",
      },
      {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
        active: pathname === "/settings",
      },
    ],
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] pr-0">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4 overflow-auto h-[calc(100vh-80px)]">
          {routes.map((route, i) => (
            <div key={i} className="px-1 py-2">
              <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">{route.title}</h3>
              <div className="space-y-1">
                {route.items.map((item, j) => (
                  <Button
                    key={j}
                    variant={item.active ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <div className="px-1 py-2 mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setOpen(false)
                logout()
              }}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

