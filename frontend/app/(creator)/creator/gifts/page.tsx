import type { Metadata } from "next"
import { DashboardShell } from "@/components/creator/dashboard-shell"
import { GiftsStats } from "@/components/creator/gifts/gifts-stats"
import { GiftsHistory } from "@/components/creator/gifts/gifts-history"

export const metadata: Metadata = {
  title: "Gifts & Tips | DevoteMe",
  description: "Manage your received gifts and tips",
}

export default function GiftsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gifts & Tips</h1>
          <p className="text-muted-foreground">Track and manage gifts received from your followers</p>
        </div>

        <GiftsStats />
        <GiftsHistory />
      </div>
    </DashboardShell>
  )
}

