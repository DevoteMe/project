"use client"

import { useState, useEffect } from "react"
import { useModeration } from "@/providers/moderation-provider"
import { ModerationFilter } from "@/components/moderation/moderation-filter"
import { ContentStatusBadge } from "@/components/moderation/content-status-badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Eye, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { ModerationQueueItem } from "@/types/moderation"

export function ContentList() {
  const { queueItems, isLoading, error, refreshQueue, moderateContent } = useModeration()
  const [viewItem, setViewItem] = useState<ModerationQueueItem | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(queueItems.length / itemsPerPage))
  }, [queueItems])

  // Get current page items
  const currentItems = queueItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handleViewContent = (item: ModerationQueueItem) => {
    setViewItem(item)
  }

  const handleAction = async (itemId: string, action: "approve" | "deny" | "quarantine") => {
    await moderateContent(itemId, action)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">All Content</h2>
        <Button variant="outline" size="sm" onClick={refreshQueue} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <ModerationFilter />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                  </TableRow>
                ))
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No content found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {item.content.substring(0, 50)}
                    {item.content.length > 50 ? "..." : ""}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{item.contentType}</span>
                  </TableCell>
                  <TableCell>{item.creatorName}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <ContentStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewContent(item)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(item.id, "approve")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(item.id, "deny")}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deny
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(item.id, "quarantine")}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Quarantine
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="w-8 h-8 p-0"
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Content Details</DialogTitle>
              <DialogDescription>View and manage content details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Creator</p>
                  <p>{viewItem.creatorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{new Date(viewItem.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <ContentStatusBadge status={viewItem.status} />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Content</p>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">{viewItem.content}</div>
              </div>

              {viewItem.mediaUrls && viewItem.mediaUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Media</p>
                  <div className="grid grid-cols-2 gap-2">
                    {viewItem.mediaUrls.map((url, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Media ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewItem.reason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Moderation Reason</p>
                  <div className="p-4 bg-muted rounded-md">{viewItem.reason}</div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleAction(viewItem.id, "deny")
                    setViewItem(null)
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleAction(viewItem.id, "quarantine")
                    setViewItem(null)
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Quarantine
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    handleAction(viewItem.id, "approve")
                    setViewItem(null)
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

