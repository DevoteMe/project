"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModerationQueue } from "@/components/moderation/moderation-queue"
import { ContentList } from "@/components/admin/content-list"
import { ModerationStats } from "@/components/admin/moderation-stats"
import { ModerationProvider } from "@/providers/moderation-provider"

export function ContentManagement() {
  const [activeTab, setActiveTab] = useState("queue")

  return (
    <ModerationProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Content Management</h1>
          <p className="text-muted-foreground">Review, approve, and manage content across the platform</p>
        </div>

        <ModerationStats />

        <Tabs defaultValue="queue" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
            <TabsTrigger value="content">All Content</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6">
            <ModerationQueue />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ContentList />
          </TabsContent>
        </Tabs>
      </div>
    </ModerationProvider>
  )
}

