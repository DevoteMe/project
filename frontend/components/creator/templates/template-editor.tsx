"use client"

import type React from "react"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Editor } from "@/components/editor"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, X, TagIcon, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

interface TemplateEditorProps {
  templateId?: string
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter()
  const { templates, loadingTemplates, fetchTemplates, createTemplate, updateTemplate } = useCreatorTools()

  const [isLoading, setIsLoading] = useState(templateId ? true : false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewContent, setPreviewContent] = useState("")
  const [newTag, setNewTag] = useState("")

  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
      category: "",
      isPublic: false,
      tags: [],
    },
  })

  const tags = form.watch("tags")

  // Fetch template data if editing an existing template
  useEffect(() => {
    if (templateId) {
      // Need to fetch templates first if they're not loaded
      const loadTemplate = async () => {
        if (loadingTemplates || templates.length === 0) {
          await fetchTemplates()
        }

        const template = templates.find((t) => t.id === templateId)

        if (template) {
          form.reset({
            name: template.name,
            description: template.description,
            content: template.content,
            category: template.category,
            isPublic: template.isPublic,
            tags: template.tags,
          })

          setPreviewContent(template.content)
          setIsLoading(false)
        } else {
          toast({
            title: "Template not found",
            description: "The template you are trying to edit could not be found.",
            variant: "destructive",
          })
          router.push("/creator/templates")
        }
      }

      loadTemplate()
    }
  }, [templateId, templates, loadingTemplates, fetchTemplates, form, router])

  const onSubmit = async (data: z.infer<typeof templateSchema>) => {
    setIsSaving(true)

    try {
      if (templateId) {
        // Update existing template
        const template = templates.find((t) => t.id === templateId)

        if (template) {
          await updateTemplate({
            ...template,
            ...data,
          })

          toast({
            title: "Template updated",
            description: "Your template has been updated successfully.",
          })
        }
      } else {
        // Create new template
        const newTemplate = await createTemplate(data)

        toast({
          title: "Template created",
          description: "Your template has been created successfully.",
        })

        router.push(`/creator/templates/${newTemplate.id}`)
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentChange = (value: string) => {
    form.setValue("content", value)
    setPreviewContent(value)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      form.setValue("tags", [...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    form.setValue(
      "tags",
      tags.filter((t) => t !== tag),
    )
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (isLoading) {
    return <TemplateEditorSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{templateId ? "Edit Template" : "Create Template"}</h1>
        <Button type="submit" form="template-form" disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </div>

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Form {...form}>
            <form id="template-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
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
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="blog">Blog Post</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="promo">Promotion</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Briefly describe this template" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Helps you and others understand what this template is for.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag} tag</span>
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <TagIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="pl-8"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tag
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Content</FormLabel>
                    <FormControl>
                      <Editor
                        value={field.value}
                        onChange={handleContentChange}
                        placeholder="Write your template content here..."
                      />
                    </FormControl>
                    <FormDescription>This content will be pre-filled when this template is used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Make Public</FormLabel>
                      <FormDescription>Allow other users to see and use this template.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardContent className="p-6">
              <h1 className="mb-4 text-2xl font-bold">{form.watch("name") || "Untitled Template"}</h1>
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

function TemplateEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="h-10">
        <Skeleton className="h-full w-48" />
      </div>

      <div className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-64 w-full" />
        </div>

        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  )
}

