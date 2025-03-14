import { DashboardShell } from "@/components/creator/dashboard-shell"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { DraftsList } from "@/components/creator/drafts/drafts-list"

export const metadata: Metadata = {
  title: "Drafts | Creator Dashboard",
  description: "Manage your content drafts",
}

export default function DraftsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Drafts</h2>
            <p className="text-muted-foreground">Manage your draft content before publishing</p>
          </div>
          <Link href="/creator/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Draft
            </Button>
          </Link>
        </div>

        <DraftsList />
      </div>
    </DashboardShell>
  )
}

