import type { Metadata } from "next"
import { ModerationDashboard } from "@/components/admin/moderation-dashboard"

export const metadata: Metadata = {
  title: "Moderation Queue | DevoteMe Admin",
  description: "Review and moderate content in the DevoteMe platform",
}

export default function ModerationQueuePage() {
  return (
    <div className="container mx-auto py-10">
      <ModerationDashboard />
    </div>
  )
}

