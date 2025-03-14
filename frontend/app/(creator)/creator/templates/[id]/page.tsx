import { TemplateEditor } from "@/components/creator/templates/template-editor"
import { DashboardShell } from "@/components/creator/dashboard-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edit Template | Creator Dashboard",
  description: "Edit your content template",
}

export default function EditTemplatePage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <DashboardShell>
      <TemplateEditor templateId={params.id} />
    </DashboardShell>
  )
}

