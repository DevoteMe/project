"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, PlayCircle, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Empty } from "@/components/empty"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export function ScheduledPostsList() {
  const { scheduledPosts, loadingScheduledPosts, fetchScheduledPosts, deleteScheduledPost, publishNow } =
    useCreatorTools()

  useEffect(() => {
    fetchScheduledPosts()
  }, [fetchScheduledPosts])

  if (loadingScheduledPosts) {
    return <ScheduledPostsListSkeleton />
  }

  if (scheduledPosts.length === 0) {
    return (
      <Empty
        title="No scheduled posts"
        description="You haven't scheduled any posts yet."
        action={
          <Link href="/creator/schedule">
            <Button>Schedule a post</Button>
          </Link>
        }
      />
    )
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this scheduled post?")) {
      try {
        await deleteScheduledPost(id)
        toast({
          title: "Post deleted",
          description: "The scheduled post has been deleted.",
        })
      } catch (error) {
        console.error("Error deleting post:", error)
        toast({
          title: "Error",
          description: "Failed to delete the post. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handlePublishNow = async (id: string) => {
    if (window.confirm("Are you sure you want to publish this post now instead of waiting for the scheduled time?")) {
      try {
        await publishNow(id)
        toast({
          title: "Post published",
          description: "Your post has been published successfully.",
        })
      } catch (error) {
        console.error("Error publishing post:", error)
        toast({
          title: "Error",
          description: "Failed to publish the post. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        )
      case "published":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Published
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Scheduled For</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Recurring</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scheduledPosts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">{post.title}</TableCell>
            <TableCell>
              {format(new Date(post.scheduledFor), "PPP p")}
              <div className="text-xs text-muted-foreground">{post.timezone}</div>
            </TableCell>
            <TableCell>{getStatusBadge(post.status)}</TableCell>
            <TableCell>
              {post.recurringPattern ? (
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                  {`Every ${post.recurringPattern.interval} ${post.recurringPattern.frequency}`}
                </Badge>
              ) : (
                <span className="text-muted-foreground">No</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {post.status === "scheduled" && (
                  <>
                    <Link href={`/creator/schedule/${post.id}`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" onClick={() => handlePublishNow(post.id)}>
                      <PlayCircle className="h-4 w-4" />
                      <span className="sr-only">Publish Now</span>
                    </Button>
                  </>
                )}
                <Button variant="outline" size="icon" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ScheduledPostsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="rounded-md border">
        <div className="h-12 border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

