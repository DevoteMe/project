import { SchedulePostForm } from "@/components/creator/schedule/schedule-post-form"
import { DashboardShell } from "@/components/creator/dashboard-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Schedule Post | Creator Dashboard",
  description: "Schedule a post for future publication",
}

export default function SchedulePostPage() {
  return (
    <DashboardShell>
      <SchedulePostForm />
    </DashboardShell>
  )
}

