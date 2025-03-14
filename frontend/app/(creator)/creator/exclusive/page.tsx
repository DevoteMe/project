import type { Metadata } from "next"
import { DashboardShell } from "@/components/creator/dashboard-shell"
import { ExclusiveContentStats } from "@/components/creator/exclusive/exclusive-content-stats"
import { ExclusiveContentList } from "@/components/creator/exclusive/exclusive-content-list"

export const metadata: Metadata = {
  title: "Exclusive Content | DevoteMe",
  description: "Manage your exclusive content and access settings",
}

export default function ExclusiveContentPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exclusive Content</h1>
          <p className="text-muted-foreground">Manage your exclusive content and access settings</p>
        </div>

        <ExclusiveContentStats />
        <ExclusiveContentList />
      </div>
    </DashboardShell>
  )
}

