"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import type { ContentPerformance } from "@/services/analytics-service"

interface ContentPerformanceTableProps {
  data: ContentPerformance[]
  className?: string
}

export function ContentPerformanceTable({ data, className }: ContentPerformanceTableProps) {
  const [sortBy, setSortBy] = useState<"views" | "engagement" | "conversionRate">("views")

  // Sort data based on selected criteria
  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case "views":
        return b.views - a.views
      case "engagement":
        const engagementA = a.engagement.likes + a.engagement.comments + a.engagement.shares + a.engagement.saves
        const engagementB = b.engagement.likes + b.engagement.comments + b.engagement.shares + b.engagement.saves
        return engagementB - engagementA
      case "conversionRate":
        return b.conversionRate - a.conversionRate
      default:
        return 0
    }
  })

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Content</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort by: {sortBy === "views" ? "Views" : sortBy === "engagement" ? "Engagement" : "Conversion Rate"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("views")}>Views</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("engagement")}>Engagement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("conversionRate")}>Conversion Rate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>Performance metrics for your top content</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right">Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="max-w-[200px] truncate" title={item.title}>
                    {item.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString()}</div>
                </TableCell>
                <TableCell className="text-right">{item.views.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.engagement.likes.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.engagement.comments.toLocaleString()}</TableCell>
                <TableCell className="text-right">{(item.conversionRate * 100).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

