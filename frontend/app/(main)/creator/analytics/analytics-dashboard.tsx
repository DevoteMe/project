"use client"

import { useEffect, useState } from "react"
import { type AnalyticsData, fetchAnalyticsData } from "@/services/analytics-service"
import { AnalyticsCard } from "@/components/analytics/analytics-card"
import { ViewsChart } from "@/components/analytics/views-chart"
import { EngagementChart } from "@/components/analytics/engagement-chart"
import { AudienceChart } from "@/components/analytics/audience-chart"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { ContentPerformanceTable } from "@/components/analytics/content-performance-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Heart, Users, DollarSign } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const analyticsData = await fetchAnalyticsData(period)
        setData(analyticsData)
      } catch (err) {
        console.error("Failed to load analytics data:", err)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [period])

  if (loading && !data) {
    return <div>Loading analytics data...</div>
  }

  if (error && !data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" className="mt-4" onClick={() => fetchAnalyticsData(period)}>
          Retry
        </Button>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          We don't have any analytics data for your account yet. Start creating content to see your performance metrics.
        </AlertDescription>
      </Alert>
    )
  }

  // Calculate total engagement
  const totalEngagement =
    data.engagement.likes + data.engagement.comments + data.engagement.shares + data.engagement.saves

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overview</h2>
        <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 hours</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Views"
          value={data.summary.views.total.toLocaleString()}
          icon={<Eye className="h-4 w-4" />}
          trend={{
            value: data.summary.views.change,
            isPositive: data.summary.views.change >= 0,
          }}
          description={`Compared to previous ${period}`}
        />

        <AnalyticsCard
          title="Engagement"
          value={totalEngagement.toLocaleString()}
          icon={<Heart className="h-4 w-4" />}
          trend={{
            value: data.summary.engagement.change,
            isPositive: data.summary.engagement.change >= 0,
          }}
          description={`Compared to previous ${period}`}
        />

        <AnalyticsCard
          title="Followers"
          value={data.audience.totalFollowers.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          trend={{
            value: data.summary.followers.change,
            isPositive: data.summary.followers.change >= 0,
          }}
          description={`${data.audience.newFollowers} new in this period`}
        />

        <AnalyticsCard
          title="Revenue"
          value={`$${data.revenue.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{
            value: data.summary.revenue.change,
            isPositive: data.summary.revenue.change >= 0,
          }}
          description={`Compared to previous ${period}`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ViewsChart data={data.viewsHistory} />
        <EngagementChart data={data.engagement} />
      </div>

      <ContentPerformanceTable data={data.topContent} />

      <div className="grid gap-4 md:grid-cols-2">
        <AudienceChart data={data.audience} />
        <RevenueChart data={data.revenue} />
      </div>
    </div>
  )
}

