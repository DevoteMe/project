"use client"

import { useState } from "react"
import type { AnalyticsPeriod, DashboardData } from "@/lib/api/analytics"
import { AnalyticsSummary } from "./analytics-summary"
import { ViewsChart } from "./views-chart"
import { EngagementChart } from "./engagement-chart"
import { TopPosts } from "./top-posts"
import { AudienceTab } from "./audience-tab"
import { RevenueChart } from "./revenue-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalyticsProps {
  initialData: DashboardData
}

export function Analytics({ initialData }: AnalyticsProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d")
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData)

  const handlePeriodChange = async (value: AnalyticsPeriod) => {
    setPeriod(value)
    // In a real implementation, we'd fetch new data based on the period
    // For now, we'll just update the state with the same data
    setDashboardData(initialData)
  }

  const handleExportData = () => {
    // In a real implementation, this would generate and download a CSV or PDF report
    alert("This would download your analytics data as a CSV or PDF in a real implementation.")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Creator Analytics</h1>
          <p className="text-muted-foreground">Track your content performance and audience engagement</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value) => handlePeriodChange(value as AnalyticsPeriod)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <AnalyticsSummary data={dashboardData.summary} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Views</CardTitle>
            <CardDescription>Total views over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ViewsChart data={dashboardData.viewsData} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
            <CardDescription>Likes, comments, and shares</CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart data={dashboardData.engagementData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Content</CardTitle>
          <CardDescription>Your most viewed and engaged content</CardDescription>
        </CardHeader>
        <CardContent>
          <TopPosts posts={dashboardData.topPosts} />
        </CardContent>
      </Card>

      <Tabs defaultValue="demographics" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="referrers">Traffic Sources</TabsTrigger>
        </TabsList>
        <TabsContent value="demographics">
          <AudienceTab data={dashboardData.audienceData.demographics} type="demographics" />
        </TabsContent>
        <TabsContent value="devices">
          <AudienceTab data={dashboardData.audienceData.devices} type="devices" />
        </TabsContent>
        <TabsContent value="referrers">
          <AudienceTab data={dashboardData.audienceData.referrers} type="referrers" />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Track your earnings from premium content, spots, and tips</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={dashboardData.revenueData} />
        </CardContent>
      </Card>
    </div>
  )
}

