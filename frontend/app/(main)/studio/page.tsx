"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "@/lib/axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPrice } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { BarChart, LineChart, PieChart, Upload, Users, DollarSign, TrendingUp, Eye } from "lucide-react"

export default function CreatorStudioPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalDevotees: 0,
    totalViews: 0,
    totalEarnings: 0,
    recentEarnings: 0,
    devoteeGrowth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("week")

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // This would be a real API endpoint in a production app
      const { data } = await axios.get("/creator/stats", {
        params: { timeframe },
      })
      setStats(data)
    } catch (error) {
      console.error("Error fetching creator stats:", error)
      // For demo purposes, set some mock data
      setStats({
        totalPosts: 42,
        totalDevotees: 156,
        totalViews: 12500,
        totalEarnings: 1250.75,
        recentEarnings: 320.5,
        devoteeGrowth: 12,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [timeframe])

  if (!user || user.userType !== "CONTENT_CREATOR") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Creator Studio Access Denied</h2>
        <p className="text-muted-foreground mb-6">You need to be a content creator to access this page.</p>
        <Button asChild>
          <Link href="/become-creator">Become a Creator</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Creator Studio</h1>
        <Button asChild>
          <Link href="/studio/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload New Content
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devotees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDevotees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.devoteeGrowth > 0 ? "+" : ""}
              {stats.devoteeGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.recentEarnings)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="views">Views</TabsTrigger>
          <TabsTrigger value="devotees">Devotees</TabsTrigger>
        </TabsList>

        <div className="flex justify-end space-x-2">
          <Button variant={timeframe === "week" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("week")}>
            Week
          </Button>
          <Button
            variant={timeframe === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe("month")}
          >
            Month
          </Button>
          <Button variant={timeframe === "year" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("year")}>
            Year
          </Button>
        </div>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your earnings over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground flex flex-col items-center">
                <BarChart className="h-16 w-16 mb-2" />
                <p>Earnings chart would be displayed here</p>
                <p className="text-sm">Using real data from your account</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Breakdown of your earnings</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center">
                  <PieChart className="h-16 w-16 mb-2" />
                  <p>Revenue breakdown chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Content</CardTitle>
                <CardDescription>Your highest earning content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded bg-muted"></div>
                        <div>
                          <p className="font-medium">Post Title {i + 1}</p>
                          <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 1000)} views</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrice(Math.random() * 100)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Views Overview</CardTitle>
              <CardDescription>Your content views over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground flex flex-col items-center">
                <LineChart className="h-16 w-16 mb-2" />
                <p>Views chart would be displayed here</p>
                <p className="text-sm">Using real data from your account</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devotees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Devotee Growth</CardTitle>
              <CardDescription>Your subscriber growth over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground flex flex-col items-center">
                <LineChart className="h-16 w-16 mb-2" />
                <p>Devotee growth chart would be displayed here</p>
                <p className="text-sm">Using real data from your account</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

