"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard } from "@/components/analytics/metric-card"
import { LineChart } from "@/components/analytics/line-chart"
import { BarChart } from "@/components/analytics/bar-chart"
import { PieChart } from "@/components/analytics/pie-chart"
import { DataTable } from "@/components/analytics/data-table"
import { TimeRangeSelector } from "@/components/analytics/time-range-selector"
import { HealthIndicator } from "@/components/analytics/health-indicator"
import {
  analyticsService,
  type TimeRange,
  type AnalyticsSummary,
  type UserAnalytics,
  type ContentAnalytics,
  type RevenueAnalytics,
  type SystemAnalytics,
} from "@/services/analytics-service"
import { Loader2 } from "lucide-react"

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [summaryData, userData, contentData, revenueData, systemData] = await Promise.all([
          analyticsService.getSummary(timeRange),
          analyticsService.getUserAnalytics(timeRange),
          analyticsService.getContentAnalytics(timeRange),
          analyticsService.getRevenueAnalytics(timeRange),
          analyticsService.getSystemAnalytics(timeRange),
        ])

        setSummary(summaryData)
        setUserAnalytics(userData)
        setContentAnalytics(contentData)
        setRevenueAnalytics(revenueData)
        setSystemAnalytics(systemData)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor your platform's performance and user engagement.</p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} className="w-[180px]" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary?.metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} prefix={metric.name.includes("Revenue") ? "$" : ""} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {userAnalytics && (
              <LineChart
                title="User Growth"
                description="New user registrations over time"
                data={userAnalytics.userGrowth}
              />
            )}
            {contentAnalytics && (
              <LineChart
                title="Content Growth"
                description="New content created over time"
                data={contentAnalytics.contentGrowth}
                color="hsl(var(--secondary))"
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {revenueAnalytics && (
              <LineChart
                title="Revenue Growth"
                description="Revenue generated over time"
                data={revenueAnalytics.revenueGrowth}
                color="hsl(var(--success))"
                valuePrefix="$"
              />
            )}
            {systemAnalytics && (
              <LineChart
                title="API Requests"
                description="Total API requests over time"
                data={systemAnalytics.responseTimeHistory}
                color="hsl(var(--warning))"
              />
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {userAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard metric={userAnalytics.newUsers} />
                <MetricCard metric={userAnalytics.activeUsers} />
                <MetricCard metric={userAnalytics.retentionRate} suffix="%" />
                <MetricCard metric={userAnalytics.churnRate} suffix="%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PieChart
                  title="Users by Plan"
                  description="Distribution of users across subscription plans"
                  data={userAnalytics.usersByPlan}
                />
                <BarChart
                  title="Users by Country"
                  description="Top countries by user count"
                  data={userAnalytics.usersByCountry}
                />
              </div>

              <LineChart
                title="User Growth Trend"
                description="New user registrations over time"
                data={userAnalytics.userGrowth}
                height={400}
              />
            </>
          )}
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          {contentAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard metric={contentAnalytics.totalContent} />
                <MetricCard metric={contentAnalytics.newContent} />
                <MetricCard metric={contentAnalytics.viewsTotal} />
                <MetricCard metric={contentAnalytics.averageEngagement} suffix="%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PieChart
                  title="Content by Type"
                  description="Distribution of content across different types"
                  data={contentAnalytics.contentByType}
                />
                <LineChart
                  title="Content Growth"
                  description="New content created over time"
                  data={contentAnalytics.contentGrowth}
                  color="hsl(var(--secondary))"
                />
              </div>

              <DataTable
                title="Popular Content"
                description="Top performing content by views and engagement"
                columns={[
                  { header: "Title", accessorKey: "title" },
                  { header: "Creator", accessorKey: "creator" },
                  { header: "Views", accessorKey: "views", cell: (row) => row.views.toLocaleString() },
                  { header: "Engagement", accessorKey: "engagement", cell: (row) => `${row.engagement.toFixed(1)}%` },
                ]}
                data={contentAnalytics.popularContent}
                searchable
                searchKey="title"
              />
            </>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          {revenueAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard metric={revenueAnalytics.totalRevenue} prefix="$" />
                <MetricCard metric={revenueAnalytics.subscriptionRevenue} prefix="$" />
                <MetricCard metric={revenueAnalytics.oneTimeRevenue} prefix="$" />
                <MetricCard metric={revenueAnalytics.averageRevenue} prefix="$" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PieChart
                  title="Revenue by Plan"
                  description="Distribution of revenue across subscription plans"
                  data={revenueAnalytics.revenueByPlan}
                  valuePrefix="$"
                />
                <BarChart
                  title="Revenue by Country"
                  description="Top countries by revenue"
                  data={revenueAnalytics.revenueByCountry}
                  valuePrefix="$"
                />
              </div>

              <LineChart
                title="Revenue Growth Trend"
                description="Revenue generated over time"
                data={revenueAnalytics.revenueGrowth}
                height={400}
                color="hsl(var(--success))"
                valuePrefix="$"
              />
            </>
          )}
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          {systemAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HealthIndicator
                  title="API Health"
                  status={
                    systemAnalytics.errorRate.value < 1
                      ? "healthy"
                      : systemAnalytics.errorRate.value < 5
                        ? "warning"
                        : "error"
                  }
                  metric={`${systemAnalytics.errorRate.value.toFixed(2)}% Error Rate`}
                />
                <HealthIndicator
                  title="Response Time"
                  status={
                    systemAnalytics.averageResponseTime.value < 200
                      ? "healthy"
                      : systemAnalytics.averageResponseTime.value < 500
                        ? "warning"
                        : "error"
                  }
                  metric={`${systemAnalytics.averageResponseTime.value.toFixed(0)}ms Avg`}
                />
                <HealthIndicator
                  title="Server Load"
                  status={
                    systemAnalytics.serverLoad.value < 50
                      ? "healthy"
                      : systemAnalytics.serverLoad.value < 80
                        ? "warning"
                        : "error"
                  }
                  metric={`${systemAnalytics.serverLoad.value.toFixed(0)}% CPU`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard metric={systemAnalytics.apiRequests} />
                <MetricCard metric={systemAnalytics.errorRate} suffix="%" />
                <MetricCard metric={systemAnalytics.averageResponseTime} suffix="ms" />
                <MetricCard metric={systemAnalytics.serverLoad} suffix="%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BarChart
                  title="Requests by Endpoint"
                  description="Distribution of API requests across endpoints"
                  data={systemAnalytics.requestsByEndpoint}
                />
                <PieChart
                  title="Errors by Type"
                  description="Distribution of errors by type"
                  data={systemAnalytics.errorsByType}
                />
              </div>

              <LineChart
                title="Response Time History"
                description="API response time over time"
                data={systemAnalytics.responseTimeHistory}
                height={400}
                color="hsl(var(--warning))"
                valueSuffix="ms"
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

