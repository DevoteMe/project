"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TimeRangeSelector } from "@/components/analytics/time-range-selector"
import { LineChart } from "@/components/analytics/line-chart"
import { HealthIndicator } from "@/components/analytics/health-indicator"
import { DataTable } from "@/components/analytics/data-table"
import type { TimeRange } from "@/services/analytics-service"
import { AlertTriangle, CheckCircle, RefreshCw, Server, Database, Globe, Shield } from "lucide-react"

// Mock data for the monitoring dashboard
const mockSystemHealth = {
  api: { status: "healthy", uptime: "99.98%", lastIncident: "7d ago" },
  database: { status: "healthy", uptime: "99.95%", lastIncident: "14d ago" },
  storage: { status: "healthy", uptime: "100%", lastIncident: "None" },
  cache: { status: "healthy", uptime: "99.99%", lastIncident: "3d ago" },
  queue: { status: "warning", uptime: "99.5%", lastIncident: "1h ago" },
}

const mockResourceUsage = {
  cpu: 42,
  memory: 68,
  disk: 37,
  network: 28,
}

const mockActiveAlerts = [
  {
    id: 1,
    severity: "warning",
    message: "Queue processing delay detected",
    timestamp: "2023-06-15T10:23:45Z",
    service: "Message Queue",
  },
  {
    id: 2,
    severity: "info",
    message: "Scheduled maintenance in 24 hours",
    timestamp: "2023-06-15T09:15:30Z",
    service: "All Services",
  },
]

const mockRecentIncidents = [
  {
    id: 101,
    status: "resolved",
    title: "API Latency Spike",
    startTime: "2023-06-12T14:30:00Z",
    endTime: "2023-06-12T15:45:00Z",
    impact: "minor",
  },
  {
    id: 102,
    status: "resolved",
    title: "Database Connection Issues",
    startTime: "2023-06-08T08:15:00Z",
    endTime: "2023-06-08T09:30:00Z",
    impact: "major",
  },
  {
    id: 103,
    status: "resolved",
    title: "Storage Service Degradation",
    startTime: "2023-06-01T18:20:00Z",
    endTime: "2023-06-01T20:10:00Z",
    impact: "minor",
  },
]

export default function MonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [cpuHistory, setCpuHistory] = useState<any[]>([])
  const [memoryHistory, setMemoryHistory] = useState<any[]>([])
  const [apiRequestsHistory, setApiRequestsHistory] = useState<any[]>([])
  const [errorRateHistory, setErrorRateHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real application, you would fetch this data from your backend
        // For now, we'll use mock data
        const now = Date.now()
        const mockCpuHistory = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
          value: 30 + Math.random() * 40,
        }))

        const mockMemoryHistory = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
          value: 50 + Math.random() * 30,
        }))

        const mockApiRequestsHistory = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
          value: 1000 + Math.random() * 2000,
        }))

        const mockErrorRateHistory = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
          value: Math.random() * 3,
        }))

        setCpuHistory(mockCpuHistory)
        setMemoryHistory(mockMemoryHistory)
        setApiRequestsHistory(mockApiRequestsHistory)
        setErrorRateHistory(mockErrorRateHistory)
      } catch (error) {
        console.error("Error fetching monitoring data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  const handleRefresh = () => {
    // Refresh the data
    const now = Date.now()
    setCpuHistory((prev) => [
      ...prev.slice(1),
      { timestamp: new Date(now).toISOString(), value: 30 + Math.random() * 40 },
    ])
    setMemoryHistory((prev) => [
      ...prev.slice(1),
      { timestamp: new Date(now).toISOString(), value: 50 + Math.random() * 30 },
    ])
    setApiRequestsHistory((prev) => [
      ...prev.slice(1),
      { timestamp: new Date(now).toISOString(), value: 1000 + Math.random() * 2000 },
    ])
    setErrorRateHistory((prev) => [
      ...prev.slice(1),
      { timestamp: new Date(now).toISOString(), value: Math.random() * 3 },
    ])
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time monitoring of system health and performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} className="w-[180px]" />
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {mockActiveAlerts.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Alerts ({mockActiveAlerts.length})</AlertTitle>
          <AlertDescription>There are active alerts that may require your attention.</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <HealthIndicator
              title="API Service"
              status={mockSystemHealth.api.status as any}
              metric={`Uptime: ${mockSystemHealth.api.uptime}`}
            />
            <HealthIndicator
              title="Database"
              status={mockSystemHealth.database.status as any}
              metric={`Uptime: ${mockSystemHealth.database.uptime}`}
            />
            <HealthIndicator
              title="Storage"
              status={mockSystemHealth.storage.status as any}
              metric={`Uptime: ${mockSystemHealth.storage.uptime}`}
            />
            <HealthIndicator
              title="Cache"
              status={mockSystemHealth.cache.status as any}
              metric={`Uptime: ${mockSystemHealth.cache.uptime}`}
            />
            <HealthIndicator
              title="Queue"
              status={mockSystemHealth.queue.status as any}
              metric={`Uptime: ${mockSystemHealth.queue.uptime}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CPU</span>
                    <span>{mockResourceUsage.cpu}%</span>
                  </div>
                  <Progress value={mockResourceUsage.cpu} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory</span>
                    <span>{mockResourceUsage.memory}%</span>
                  </div>
                  <Progress value={mockResourceUsage.memory} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Disk</span>
                    <span>{mockResourceUsage.disk}%</span>
                  </div>
                  <Progress value={mockResourceUsage.disk} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Network</span>
                    <span>{mockResourceUsage.network}%</span>
                  </div>
                  <Progress value={mockResourceUsage.network} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Recent system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {mockActiveAlerts.length === 0 ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">No active alerts</p>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {mockActiveAlerts.map((alert) => (
                      <li key={alert.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={alert.severity === "warning" ? "warning" : "secondary"}>
                                {alert.severity}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{alert.service}</span>
                            </div>
                            <p className="mt-1">{alert.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LineChart
              title="API Requests"
              description="Number of API requests over time"
              data={apiRequestsHistory}
              color="hsl(var(--primary))"
            />
            <LineChart
              title="Error Rate"
              description="API error rate percentage over time"
              data={errorRateHistory}
              color="hsl(var(--destructive))"
              valueSuffix="%"
            />
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LineChart
              title="CPU Usage"
              description="CPU utilization percentage over time"
              data={cpuHistory}
              height={300}
              color="hsl(var(--primary))"
              valueSuffix="%"
            />
            <LineChart
              title="Memory Usage"
              description="Memory utilization percentage over time"
              data={memoryHistory}
              height={300}
              color="hsl(var(--secondary))"
              valueSuffix="%"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Server Resources</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CPU</span>
                    <span>{mockResourceUsage.cpu}%</span>
                  </div>
                  <Progress value={mockResourceUsage.cpu} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory</span>
                    <span>{mockResourceUsage.memory}%</span>
                  </div>
                  <Progress value={mockResourceUsage.memory} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Disk</span>
                    <span>{mockResourceUsage.disk}%</span>
                  </div>
                  <Progress value={mockResourceUsage.disk} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Network</span>
                    <span>{mockResourceUsage.network}%</span>
                  </div>
                  <Progress value={mockResourceUsage.network} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Database</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Connections</span>
                    <span>42/100</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Query Time</span>
                    <span>78ms</span>
                  </div>
                  <Progress value={78} max={200} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Storage</span>
                    <span>28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cache Hit Rate</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">CDN & Storage</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CDN Cache Hit</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Storage Used</span>
                    <span>1.2TB/2TB</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Bandwidth</span>
                    <span>34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>File Operations</span>
                    <span>156/s</span>
                  </div>
                  <Progress value={52} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Blocked Requests</span>
                    <span>24/hr</span>
                  </div>
                  <Progress value={24} max={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Auth Failures</span>
                    <span>12/hr</span>
                  </div>
                  <Progress value={12} max={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Rate Limited</span>
                    <span>8/hr</span>
                  </div>
                  <Progress value={8} max={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>SSL Score</span>
                    <span>A+</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <DataTable
            title="Active Alerts"
            description="Current system alerts that require attention"
            columns={[
              {
                header: "Severity",
                accessorKey: "severity",
                cell: (row) => (
                  <Badge
                    variant={
                      row.severity === "warning" ? "warning" : row.severity === "error" ? "destructive" : "secondary"
                    }
                  >
                    {row.severity}
                  </Badge>
                ),
              },
              { header: "Service", accessorKey: "service" },
              { header: "Message", accessorKey: "message" },
              {
                header: "Time",
                accessorKey: "timestamp",
                cell: (row) => new Date(row.timestamp).toLocaleString(),
              },
              {
                header: "Actions",
                accessorKey: "id",
                cell: (row) => (
                  <Button variant="outline" size="sm">
                    Acknowledge
                  </Button>
                ),
              },
            ]}
            data={mockActiveAlerts}
            searchable
            searchKey="message"
          />

          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>Recent alerts from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                title=""
                description=""
                columns={[
                  {
                    header: "Severity",
                    accessorKey: "severity",
                    cell: (row) => (
                      <Badge
                        variant={
                          row.severity === "warning"
                            ? "warning"
                            : row.severity === "error"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {row.severity}
                      </Badge>
                    ),
                  },
                  { header: "Service", accessorKey: "service" },
                  { header: "Message", accessorKey: "message" },
                  {
                    header: "Time",
                    accessorKey: "timestamp",
                    cell: (row) => new Date(row.timestamp).toLocaleString(),
                  },
                  {
                    header: "Status",
                    accessorKey: "status",
                    cell: (row) => <Badge variant="outline">Resolved</Badge>,
                  },
                ]}
                data={[
                  {
                    id: 3,
                    severity: "error",
                    message: "Database connection timeout",
                    timestamp: "2023-06-14T15:30:45Z",
                    service: "Database",
                    status: "resolved",
                  },
                  {
                    id: 4,
                    severity: "warning",
                    message: "High memory usage detected",
                    timestamp: "2023-06-13T08:45:12Z",
                    service: "API Server",
                    status: "resolved",
                  },
                  {
                    id: 5,
                    severity: "info",
                    message: "Scheduled maintenance completed",
                    timestamp: "2023-06-10T22:10:30Z",
                    service: "All Services",
                    status: "resolved",
                  },
                ]}
                searchable
                searchKey="message"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <DataTable
            title="Recent Incidents"
            description="System incidents from the past 30 days"
            columns={[
              {
                header: "Status",
                accessorKey: "status",
                cell: (row) => (
                  <Badge variant={row.status === "active" ? "destructive" : "outline"}>{row.status}</Badge>
                ),
              },
              { header: "Title", accessorKey: "title" },
              {
                header: "Impact",
                accessorKey: "impact",
                cell: (row) => (
                  <Badge
                    variant={
                      row.impact === "critical" ? "destructive" : row.impact === "major" ? "warning" : "secondary"
                    }
                  >
                    {row.impact}
                  </Badge>
                ),
              },
              {
                header: "Start Time",
                accessorKey: "startTime",
                cell: (row) => new Date(row.startTime).toLocaleString(),
              },
              {
                header: "End Time",
                accessorKey: "endTime",
                cell: (row) => (row.endTime ? new Date(row.endTime).toLocaleString() : "Ongoing"),
              },
              {
                header: "Duration",
                accessorKey: "startTime",
                cell: (row) => {
                  const start = new Date(row.startTime)
                  const end = row.endTime ? new Date(row.endTime) : new Date()
                  const durationMs = end.getTime() - start.getTime()
                  const minutes = Math.floor(durationMs / 60000)
                  const hours = Math.floor(minutes / 60)
                  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`
                },
              },
            ]}
            data={mockRecentIncidents}
            searchable
            searchKey="title"
          />

          <Card>
            <CardHeader>
              <CardTitle>Incident Reports</CardTitle>
              <CardDescription>Detailed analysis of recent incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentIncidents.map((incident) => (
                  <Card key={incident.id} className="border border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{incident.title}</CardTitle>
                          <CardDescription>
                            {new Date(incident.startTime).toLocaleString()} -{" "}
                            {incident.endTime ? new Date(incident.endTime).toLocaleString() : "Ongoing"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            incident.impact === "critical"
                              ? "destructive"
                              : incident.impact === "major"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {incident.impact}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium">Summary</h4>
                          <p className="text-sm text-muted-foreground">
                            {incident.title} affected{" "}
                            {incident.impact === "major" ? "multiple services" : "some services"} for approximately{" "}
                            {(() => {
                              const start = new Date(incident.startTime)
                              const end = incident.endTime ? new Date(incident.endTime) : new Date()
                              const durationMs = end.getTime() - start.getTime()
                              const minutes = Math.floor(durationMs / 60000)
                              const hours = Math.floor(minutes / 60)
                              return hours > 0 ? `${hours} hours and ${minutes % 60} minutes` : `${minutes} minutes`
                            })()}.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Root Cause</h4>
                          <p className="text-sm text-muted-foreground">
                            {incident.title.includes("API")
                              ? "Increased latency due to unexpected traffic spike and insufficient auto-scaling configuration."
                              : incident.title.includes("Database")
                                ? "Connection pool exhaustion caused by a query that was not properly optimized."
                                : "Storage service degradation due to maintenance on underlying infrastructure."}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Resolution</h4>
                          <p className="text-sm text-muted-foreground">
                            {incident.title.includes("API")
                              ? "Increased capacity and adjusted auto-scaling parameters to better handle traffic spikes."
                              : incident.title.includes("Database")
                                ? "Optimized the problematic query and increased connection pool size."
                                : "Coordinated with infrastructure provider to complete maintenance and restore service."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

