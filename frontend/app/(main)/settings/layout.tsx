import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { User, Shield, Bell, Clock, UserX, Settings } from "lucide-react"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
}

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] py-10">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
        <h2 className="mb-4 text-lg font-semibold">Settings</h2>
        <nav className="flex flex-col space-y-1">
          <Link href="/settings/profile" className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
          <Link href="/settings/verification" className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
            <Shield className="mr-2 h-4 w-4" />
            Verification
          </Link>
          <Link href="/settings/notifications" className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Link>
          <Link href="/settings/activity" className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
            <Clock className="mr-2 h-4 w-4" />
            Activity
          </Link>
          <Link href="/settings/blocked-users" className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
            <UserX className="mr-2 h-4 w-4" />
            Blocked Users
          </Link>
          <Link href="/settings/privacy" className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
            <Settings className="mr-2 h-4 w-4" />
            Privacy & Data
          </Link>
        </nav>
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}

