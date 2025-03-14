import { DashboardShell } from "@/components/creator/dashboard-shell"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { ScheduledPostsList } from "@/components/creator/scheduled/scheduled-posts-list"

export const metadata: Metadata = {
  title: "Scheduled Posts | Creator Dashboard",
  description: "Manage your scheduled content",
}

export default function ScheduledPostsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Scheduled Posts</h2>
            <p className="text-muted-foreground">Manage your scheduled content and publishing calendar</p>
          </div>
          <Link href="/creator/schedule">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Post
            </Button>
          </Link>
        </div>

        <ScheduledPostsList />
      </div>
    </DashboardShell>
  )
}

