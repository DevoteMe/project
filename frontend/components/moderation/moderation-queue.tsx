"use client"

import { useEffect, useState } from "react"
import { useModeration } from "@/providers/moderation-provider"
import { ModerationQueueItem } from "@/components/moderation/moderation-queue-item"
import { ModerationFilter } from "@/components/moderation/moderation-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ModerationQueue() {
  const { queueItems, isLoading, error, stats, refreshQueue } = useModeration()
  const [activeTab, setActiveTab] = useState("pending")

  // Auto-refresh when switching tabs
  useEffect(() => {
    refreshQueue()
  }, [activeTab, refreshQueue])

  // Filter items based on active tab
  const filteredItems = queueItems.filter((item) => {
    if (activeTab === "pending") return item.status === "pending"
    if (activeTab === "quarantined") return item.status === "quarantined"
    return true // 'all' tab
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Content Moderation Queue</h2>
        <Button variant="outline" size="sm" onClick={refreshQueue} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
            <CardDescription>Pending</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.approved}</CardTitle>
            <CardDescription>Approved</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.denied}</CardTitle>
            <CardDescription>Denied</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.quarantined}</CardTitle>
            <CardDescription>Quarantined</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <ModerationFilter />

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="quarantined">Quarantined ({stats.quarantined})</TabsTrigger>
          <TabsTrigger value="all">All Content</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[160px]" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No content to moderate in this queue.</p>
            </div>
          ) : (
            <div>
              {filteredItems.map((item) => (
                <ModerationQueueItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

