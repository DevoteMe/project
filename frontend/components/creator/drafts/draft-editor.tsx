"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Editor } from "@/components/editor"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { Save, Clock, TrashIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { draftSchema } from "@/lib/validations/draft"
import { Skeleton } from "@/components/ui/skeleton"

interface DraftEditorProps {
  draftId?: string
}

export function DraftEditor({ draftId }: DraftEditorProps) {
  const router = useRouter()
  const { selectedDraft, getDraft, saveDraft, updateDraft, deleteDraft, selectDraft } = useCreatorTools()

  const [isLoading, setIsLoading] = useState(draftId ? true : false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewContent, setPreviewContent] = useState("")

  const form = useForm<z.infer<typeof draftSchema>>({
    resolver: zodResolver(draftSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      tags: [],
    },
  })

  // Fetch draft data if editing an existing draft
  useEffect(() => {
    if (draftId) {
      const fetchDraft = async () => {
        try {
          const draft = await getDraft(draftId)
          form.reset({
            title: draft.title,
            content: draft.content,
            categoryId: draft.categoryId,
            tags: draft.tags,
          })
          selectDraft(draft)
          setPreviewContent(draft.content)
          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching draft:", error)
          toast({
            title: "Error",
            description: "Failed to load draft. Please try again.",
            variant: "destructive",
          })
          router.push("/creator/drafts")
        }
      }

      fetchDraft()
    } else {
      selectDraft(null)
    }

    // Cleanup
    return () => {
      selectDraft(null)
    }
  }, [draftId, getDraft, selectDraft, form, router])

  const onSubmit = async (data: z.infer<typeof draftSchema>) => {
    setIsSaving(true)

    try {
      if (draftId && selectedDraft) {
        // Update existing draft
        await updateDraft({
          ...selectedDraft,
          ...data,
        })
        toast({
          title: "Draft updated",
          description: "Your draft has been saved successfully.",
        })
      } else {
        // Create new draft
        const newDraft = await saveDraft(data)
        router.push(`/creator/drafts/${newDraft.id}`)
        toast({
          title: "Draft created",
          description: "Your draft has been created successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!draftId || !window.confirm("Are you sure you want to delete this draft?")) {
      return
    }

    try {
      await deleteDraft(draftId)
      toast({
        title: "Draft deleted",
        description: "Your draft has been deleted successfully.",
      })
      router.push("/creator/drafts")
    } catch (error) {
      console.error("Error deleting draft:", error)
      toast({
        title: "Error",
        description: "Failed to delete draft. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleContentChange = (value: string) => {
    form.setValue("content", value)
    setPreviewContent(value)
  }

  if (isLoading) {
    return <DraftEditorSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{draftId ? "Edit Draft" : "New Draft"}</h1>
        <div className="flex items-center gap-2">
          {draftId && (
            <>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/creator/schedule?draftId=${draftId}`)}>
                <Clock className="mr-2 h-4 w-4" />
                Schedule
              </Button>
            </>
          )}
          <Button type="submit" form="draft-form" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </div>

      {selectedDraft && (
        <div className="flex items-center text-sm text-muted-foreground">
          <span>
            Last saved:{" "}
            {formatDistanceToNow(new Date(selectedDraft.lastSaved), {
              addSuffix: true,
            })}
          </span>
          <span className="mx-2">•</span>
          <span>Version: v{selectedDraft.version}</span>
        </div>
      )}

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Form {...form}>
            <form id="draft-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter draft title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Editor
                        value={field.value}
                        onChange={handleContentChange}
                        placeholder="Write your draft content here..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardContent className="p-6">
              <h1 className="mb-4 text-2xl font-bold">{form.watch("title") || "Untitled Draft"}</h1>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DraftEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <Skeleton className="h-5 w-64" />

      <div className="space-y-4">
        <div>
          <Skeleton className="mb-2 h-5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div>
          <Skeleton className="mb-2 h-5 w-24" />
          <Skeleton className="h-10 w-48" />
        </div>

        <div>
          <Skeleton className="mb-2 h-5 w-20" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

