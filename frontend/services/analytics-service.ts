import axios from "@/lib/axios"

export type TimeRange = "24h" | "7d" | "30d" | "90d" | "all"
export type MetricType = "users" | "content" | "revenue" | "engagement" | "system"

export interface AnalyticsDataPoint {
  timestamp: string
  value: number
}

export interface AnalyticsMetric {
  name: string
  value: number
  change: number // percentage change
  data?: AnalyticsDataPoint[]
}

export interface AnalyticsSummary {
  metrics: AnalyticsMetric[]
}

export interface UserAnalytics {
  newUsers: AnalyticsMetric
  activeUsers: AnalyticsMetric
  retentionRate: AnalyticsMetric
  churnRate: AnalyticsMetric
  usersByPlan: { name: string; value: number }[]
  usersByCountry: { name: string; value: number }[]
  userGrowth: AnalyticsDataPoint[]
}

export interface ContentAnalytics {
  totalContent: AnalyticsMetric
  newContent: AnalyticsMetric
  viewsTotal: AnalyticsMetric
  averageEngagement: AnalyticsMetric
  popularContent: { id: string; title: string; creator: string; views: number; engagement: number }[]
  contentByType: { name: string; value: number }[]
  contentGrowth: AnalyticsDataPoint[]
}

export interface RevenueAnalytics {
  totalRevenue: AnalyticsMetric
  subscriptionRevenue: AnalyticsMetric
  oneTimeRevenue: AnalyticsMetric
  averageRevenue: AnalyticsMetric
  revenueByPlan: { name: string; value: number }[]
  revenueByCountry: { name: string; value: number }[]
  revenueGrowth: AnalyticsDataPoint[]
}

export interface SystemAnalytics {
  apiRequests: AnalyticsMetric
  errorRate: AnalyticsMetric
  averageResponseTime: AnalyticsMetric
  serverLoad: AnalyticsMetric
  requestsByEndpoint: { name: string; value: number }[]
  errorsByType: { name: string; value: number }[]
  responseTimeHistory: AnalyticsDataPoint[]
}

class AnalyticsService {
  async getSummary(timeRange: TimeRange): Promise<AnalyticsSummary> {
    const { data } = await axios.get(`/api/analytics/summary?timeRange=${timeRange}`)
    return data
  }

  async getUserAnalytics(timeRange: TimeRange): Promise<UserAnalytics> {
    const { data } = await axios.get(`/api/analytics/users?timeRange=${timeRange}`)
    return data
  }

  async getContentAnalytics(timeRange: TimeRange): Promise<ContentAnalytics> {
    const { data } = await axios.get(`/api/analytics/content?timeRange=${timeRange}`)
    return data
  }

  async getRevenueAnalytics(timeRange: TimeRange): Promise<RevenueAnalytics> {
    const { data } = await axios.get(`/api/analytics/revenue?timeRange=${timeRange}`)
    return data
  }

  async getSystemAnalytics(timeRange: TimeRange): Promise<SystemAnalytics> {
    const { data } = await axios.get(`/api/analytics/system?timeRange=${timeRange}`)
    return data
  }

  async getCustomMetric(metricName: string, timeRange: TimeRange): Promise<AnalyticsDataPoint[]> {
    const { data } = await axios.get(`/api/analytics/metric/${metricName}?timeRange=${timeRange}`)
    return data
  }
}

export const analyticsService = new AnalyticsService()

