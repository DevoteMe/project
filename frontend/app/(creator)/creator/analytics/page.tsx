import { DashboardShell } from "@/components/creator/dashboard-shell"
import { PostAnalyticsComponent } from "@/components/creator/analytics/post-analytics"
import { AudienceDemographics } from "@/components/creator/analytics/audience-demographics"
import { GrowthTrends } from "@/components/creator/analytics/growth-trends"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics | Creator Dashboard",
  description: "View detailed analytics for your content and audience",
}

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Track your content performance and audience engagement</p>
        </div>

        <div className="space-y-6">
          <PostAnalyticsComponent />
          <div className="grid gap-6 md:grid-cols-2">
            <AudienceDemographics />
            <GrowthTrends />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

