import { TemplateEditor } from "@/components/creator/templates/template-editor"
import { DashboardShell } from "@/components/creator/dashboard-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Template | Creator Dashboard",
  description: "Create a new content template",
}

export default function NewTemplatePage() {
  return (
    <DashboardShell>
      <TemplateEditor />
    </DashboardShell>
  )
}

