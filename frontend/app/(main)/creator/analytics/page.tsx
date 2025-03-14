import type { Metadata } from "next"
import { Suspense } from "react"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Creator Analytics | DevoteMe",
  description: "View insights and performance metrics for your content",
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Creator Analytics</h1>
        <p className="text-muted-foreground">Track your content performance and audience engagement</p>
      </div>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>

      <Skeleton className="h-[400px] w-full" />

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}

