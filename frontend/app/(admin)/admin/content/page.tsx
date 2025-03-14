import type { Metadata } from "next"
import { ContentManagement } from "@/components/admin/content-management"

export const metadata: Metadata = {
  title: "Content Management | DevoteMe Admin",
  description: "Manage and moderate content across the DevoteMe platform",
}

export default function ContentManagementPage() {
  return (
    <div className="container mx-auto py-10">
      <ContentManagement />
    </div>
  )
}

