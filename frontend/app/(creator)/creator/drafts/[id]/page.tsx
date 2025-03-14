import { DraftEditor } from "@/components/creator/drafts/draft-editor"
import { DashboardShell } from "@/components/creator/dashboard-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edit Draft | Creator Dashboard",
  description: "Edit your draft post",
}

export default function EditDraftPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <DashboardShell>
      <DraftEditor draftId={params.id} />
    </DashboardShell>
  )
}

