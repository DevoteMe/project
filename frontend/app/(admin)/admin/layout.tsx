import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Settings, ShieldAlert, FileText, MessageSquare, Bell, BarChart } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard | DevoteMe",
  description: "DevoteMe Admin Dashboard",
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-background">
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/admin/users">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/admin/content">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Content
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/admin/moderation">
                <Button variant="ghost" className="w-full justify-start">
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Moderation
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/admin/messages">
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/admin/notifications">
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/admin/analytics">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/admin/settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

