"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Empty } from "@/components/empty"
import { Skeleton } from "@/components/ui/skeleton"

export function DraftList() {
  const { drafts, loadingDrafts, fetchDrafts, deleteDraft } = useCreatorTools()

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  if (loadingDrafts) {
    return <DraftListSkeleton />
  }

  if (drafts.length === 0) {
    return (
      <Empty
        title="No drafts found"
        description="You haven't created any drafts yet."
        action={
          <Link href="/creator/drafts/new">
            <Button>Create a draft</Button>
          </Link>
        }
      />
    )
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      await deleteDraft(id)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Last Saved</TableHead>
          <TableHead>Version</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.map((draft) => (
          <TableRow key={draft.id}>
            <TableCell className="font-medium">{draft.title}</TableCell>
            <TableCell>{formatDistanceToNow(new Date(draft.lastSaved), { addSuffix: true })}</TableCell>
            <TableCell>v{draft.version}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link href={`/creator/drafts/${draft.id}`}>
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={() => handleDelete(draft.id)}>
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

function DraftListSkeleton() {
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
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

