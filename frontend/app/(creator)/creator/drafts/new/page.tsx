import { DraftEditor } from "@/components/creator/drafts/draft-editor"
import { DashboardShell } from "@/components/creator/dashboard-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Draft | Creator Dashboard",
  description: "Create a new draft post",
}

export default function NewDraftPage() {
  return (
    <DashboardShell>
      <DraftEditor />
    </DashboardShell>
  )
}

