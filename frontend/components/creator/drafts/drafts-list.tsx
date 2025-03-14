"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Edit, Trash2, Send, PlusCircle } from "lucide-react"
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

export function DraftsList() {
  const { drafts, loadingDrafts, fetchDrafts, deleteDraft, publishDraft } = useCreatorTools()
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null)
  const [draftToPublish, setDraftToPublish] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  const handleDelete = async () => {
    if (draftToDelete) {
      await deleteDraft(draftToDelete)
      setDraftToDelete(null)
    }
  }

  const handlePublish = async () => {
    if (draftToPublish) {
      setIsPublishing(true)
      try {
        await publishDraft(draftToPublish)
        setDraftToPublish(null)
      } finally {
        setIsPublishing(false)
      }
    }
  }

  if (loadingDrafts) {
    return <DraftsListSkeleton />
  }

  if (!drafts.length) {
    return (
      <Empty
        title="No drafts found"
        description="Create your first draft to get started"
        action={
          <Link href="/creator/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Draft
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
              <TableHead>Last Updated</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.map((draft) => (
              <TableRow key={draft.id}>
                <TableCell className="font-medium">{draft.title}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(draft.updatedAt), "MMM d, yyyy h:mm a")}</span>
                  </div>
                </TableCell>
                <TableCell>{draft.categoryId || "Uncategorized"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/creator/drafts/${draft.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <AlertDialog
                      open={draftToPublish === draft.id}
                      onOpenChange={(open) => !open && setDraftToPublish(null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setDraftToPublish(draft.id)}>
                          <Send className="h-4 w-4 text-primary" />
                          <span className="sr-only">Publish</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Publish Draft</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to publish this draft? It will be visible to your audience
                            immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePublish} disabled={isPublishing}>
                            {isPublishing ? "Publishing..." : "Publish"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog
                      open={draftToDelete === draft.id}
                      onOpenChange={(open) => !open && setDraftToDelete(null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setDraftToDelete(draft.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Draft</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this draft? This action cannot be undone.
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

function DraftsListSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Last Updated</TableHead>
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
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-9" />
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

