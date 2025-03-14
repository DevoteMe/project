import type { Metadata } from "next"
import { DashboardShell } from "@/components/creator/dashboard-shell"
import { SubscriptionTiersList } from "@/components/creator/subscriptions/subscription-tiers-list"
import { SubscriptionStats } from "@/components/creator/subscriptions/subscription-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscribersList } from "@/components/creator/subscriptions/subscribers-list"

export const metadata: Metadata = {
  title: "Subscription Management | DevoteMe",
  description: "Manage your subscription tiers and subscribers",
}

export default function SubscriptionsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">Create and manage subscription tiers for your followers</p>
        </div>

        <SubscriptionStats />

        <Tabs defaultValue="tiers" className="w-full">
          <TabsList>
            <TabsTrigger value="tiers">Subscription Tiers</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          </TabsList>
          <TabsContent value="tiers" className="space-y-4">
            <SubscriptionTiersList />
          </TabsContent>
          <TabsContent value="subscribers" className="space-y-4">
            <SubscribersList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}

