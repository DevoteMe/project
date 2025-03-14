import type React from "react"
import { CreatorToolsProvider } from "@/providers/creator-tools-provider"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Creator Dashboard | DevoteMe",
  description: "Manage your content, schedule posts, and view analytics",
}

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/creator")
  }

  return (
    <CreatorToolsProvider>
      <div className="flex min-h-screen flex-col">{children}</div>
    </CreatorToolsProvider>
  )
}

