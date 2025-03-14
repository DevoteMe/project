import { DashboardShell } from "@/components/creator/dashboard-shell"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { TemplatesList } from "@/components/creator/templates/templates-list"

export const metadata: Metadata = {
  title: "Content Templates | Creator Dashboard",
  description: "Create and manage reusable content templates",
}

export default function TemplatesPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Content Templates</h2>
            <p className="text-muted-foreground">Create and manage reusable content templates for your posts</p>
          </div>
          <Link href="/creator/templates/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </Link>
        </div>

        <TemplatesList />
      </div>
    </DashboardShell>
  )
}

