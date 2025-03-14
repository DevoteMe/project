"use client"

import { useState } from "react"
import { useModeration } from "@/providers/moderation-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock categories - in a real app, these would come from your API
const CATEGORIES = [
  "Art",
  "Music",
  "Photography",
  "Writing",
  "Gaming",
  "Technology",
  "Fitness",
  "Cooking",
  "Fashion",
  "Travel",
]

export function ModerationFilter() {
  const { filters, setFilters } = useModeration()
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  const [dateRange, setDateRange] = useState<{
    from?: Date
    to?: Date
  }>({
    from: filters.dateRange?.start,
    to: filters.dateRange?.end,
  })

  const handleApplyFilters = () => {
    const newFilters = {
      ...localFilters,
      dateRange:
        dateRange.from && dateRange.to
          ? {
              start: dateRange.from,
              end: dateRange.to,
            }
          : undefined,
    }

    setFilters(newFilters)
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      status: "all",
      contentType: "all",
      category: undefined,
      search: undefined,
      dateRange: undefined,
    }

    setLocalFilters(resetFilters)
    setDateRange({})
    setFilters(resetFilters)
    setIsOpen(false)
  }

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.contentType !== "all" ||
    filters.category !== undefined ||
    filters.search !== undefined ||
    filters.dateRange !== undefined

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && <span className="ml-1 rounded-full bg-primary w-2 h-2" />}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex-1 max-w-sm ml-4">
          <Input
            placeholder="Search content..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
          />
        </div>
      </div>

      {isOpen && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={localFilters.status || "all"}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="quarantined">Quarantined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Select
                  value={localFilters.contentType || "all"}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, contentType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                    <SelectItem value="message">Messages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={localFilters.category || ""}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, category: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="flex flex-wrap gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-[240px]",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>

                  {dateRange.from && dateRange.to && (
                    <Button variant="ghost" size="sm" onClick={() => setDateRange({})}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Dates
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

