import type { Metadata } from "next"
import { NotificationsPage as NotificationsPageComponent } from "@/components/notifications/notifications-page"

export const metadata: Metadata = {
  title: "Notifications | DevoteMe",
  description: "View your notifications",
}

export default function NotificationsRoute() {
  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with activity related to your account</p>
      </div>

      <NotificationsPageComponent />
    </div>
  )
}

