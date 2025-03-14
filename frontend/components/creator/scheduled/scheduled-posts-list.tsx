"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Edit, Trash2, PlusCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Empty } from "@/components/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ScheduledPostsList() {
  const { scheduledPosts, loadingScheduledPosts, fetchScheduledPosts, deleteScheduledPost } = useCreatorTools()
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchScheduledPosts()
  }, [fetchScheduledPosts])

  const handleDelete = async () => {
    if (postToDelete) {
      await deleteScheduledPost(postToDelete)
      setPostToDelete(null)
    }
  }

  if (loadingScheduledPosts) {
    return <ScheduledPostsListSkeleton />
  }

  if (!scheduledPosts.length) {
    return (
      <Empty
        title="No scheduled posts"
        description="Schedule your first post to get started"
        action={
          <Link href="/creator/schedule">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Post
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Scheduled For</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(post.scheduledFor), "MMM d, yyyy h:mm a")}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Timezone: {post.timezone}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      post.status === "scheduled" ? "outline" : post.status === "published" ? "default" : "destructive"
                    }
                  >
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>{post.categoryId || "Uncategorized"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/creator/scheduled/${post.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <AlertDialog
                      open={postToDelete === post.id}
                      onOpenChange={(open) => !open && setPostToDelete(null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setPostToDelete(post.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Scheduled Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this scheduled post? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ScheduledPostsListSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Scheduled For</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-1 h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

