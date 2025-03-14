"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Edit, Trash2, PlusCircle } from "lucide-react"
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
import { useState } from "react"

export function TemplatesList() {
  const { templates, loadingTemplates, fetchTemplates, deleteTemplate } = useCreatorTools()
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete)
      setTemplateToDelete(null)
    }
  }

  const handleUseTemplate = (templateId: string) => {
    // Navigate to new post page with template ID
    window.location.href = `/creator/new?template=${templateId}`
  }

  if (loadingTemplates) {
    return <TemplatesListSkeleton />
  }

  if (!templates.length) {
    return (
      <Empty
        title="No templates found"
        description="Create your first template to get started"
        action={
          <Link href="/creator/templates/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="line-clamp-1">{template.name}</CardTitle>
              <div className="flex gap-1">
                {template.isDefault && <Badge variant="secondary">Default</Badge>}
                {template.isPublic && <Badge>Public</Badge>}
              </div>
            </div>
            <CardDescription className="line-clamp-2">
              {template.description || "No description provided"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Category:</span> {template.category}
              </div>
              <div className="text-sm">
                <span className="font-medium">Created:</span> {format(new Date(template.createdAt), "MMM d, yyyy")}
              </div>
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => handleUseTemplate(template.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Use
            </Button>
            <div className="flex gap-2">
              <Link href={`/creator/templates/${template.id}`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </Link>
              <AlertDialog
                open={templateToDelete === template.id}
                onOpenChange={(open) => !open && setTemplateToDelete(null)}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setTemplateToDelete(template.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this template? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function TemplatesListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="mt-2 h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-14" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-9 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

