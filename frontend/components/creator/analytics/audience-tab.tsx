"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"

interface AudienceTabProps {
  data: any
  type: "demographics" | "devices" | "referrers"
}

export function AudienceTab({ data, type }: AudienceTabProps) {
  if (type === "demographics") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Breakdown of your audience by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <AgeChart data={data.age} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Breakdown of your audience by gender</CardDescription>
          </CardHeader>
          <CardContent>
            <GenderChart data={data.gender} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Top countries your audience is from</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationChart data={data.location} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === "devices") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Usage</CardTitle>
          <CardDescription>What devices your audience uses to view your content</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <DeviceChart data={data} />
        </CardContent>
      </Card>
    )
  }

  if (type === "referrers") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
          <CardDescription>Where your audience is coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <ReferrerTable data={data} />
        </CardContent>
      </Card>
    )
  }

  return null
}

// Helper components for charts
function AgeChart({ data }: { data: { labels: string[]; data: number[] } }) {
  const chartData = data.labels.map((age, i) => ({
    name: age,
    value: data.data[i],
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

function GenderChart({ data }: { data: { labels: string[]; data: number[] } }) {
  const chartData = data.labels.map((gender, i) => ({
    name: gender,
    value: data.data[i],
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          <Cell fill="hsl(210, 70%, 60%)" /> {/* Male */}
          <Cell fill="hsl(340, 70%, 60%)" /> {/* Female */}
          <Cell fill="hsl(150, 70%, 60%)" /> {/* Other */}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

function LocationChart({ data }: { data: { country: string; percentage: number }[] }) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium">{item.country}</span>
          </div>
          <div className="ml-auto font-medium">{item.percentage}%</div>
        </div>
      ))}
    </div>
  )
}

function DeviceChart({ data }: { data: { labels: string[]; data: number[] } }) {
  const chartData = data.labels.map((device, i) => ({
    name: device,
    value: data.data[i],
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

function ReferrerTable({ data }: { data: { source: string; visits: number; percentage: number }[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground">
        <div>Source</div>
        <div className="text-right">Visits</div>
        <div className="text-right">Percentage</div>
      </div>
      {data.map((item, index) => (
        <div key={index} className="grid grid-cols-3 items-center">
          <div className="font-medium">{item.source}</div>
          <div className="text-right">{item.visits.toLocaleString()}</div>
          <div className="text-right">{item.percentage}%</div>
        </div>
      ))}
    </div>
  )
}

