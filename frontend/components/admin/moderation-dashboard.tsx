"use client"

import { ModerationProvider } from "@/providers/moderation-provider"
import { ModerationQueue } from "@/components/moderation/moderation-queue"

export function ModerationDashboard() {
  return (
    <ModerationProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Moderation Queue</h1>
          <p className="text-muted-foreground">Review and moderate content before it's published to the platform</p>
        </div>

        <ModerationQueue />
      </div>
    </ModerationProvider>
  )
}

