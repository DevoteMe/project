import { DashboardShell } from "@/components/creator/dashboard-shell"
import { StatsCards } from "@/components/creator/dashboard/stats-cards"
import { RecentActivity } from "@/components/creator/dashboard/recent-activity"
import { ContentCalendar } from "@/components/creator/dashboard/content-calendar"
import { QuickDraft } from "@/components/creator/dashboard/quick-draft"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Creator Dashboard | DevoteMe",
  description: "Manage your content, schedule posts, and view analytics",
}

export default function CreatorDashboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your creator dashboard. Manage your content and track your performance.
          </p>
        </div>

        <StatsCards />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-2">
            <ContentCalendar />
          </div>
          <div className="space-y-4">
            <QuickDraft />
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

