"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Save } from "lucide-react"

export function QuickDraft() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { saveDraft } = useCreatorTools()
  const router = useRouter()

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your draft",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const draft = await saveDraft({
        title,
        content,
        categoryId: "",
        tags: [],
      })

      toast({
        title: "Draft saved",
        description: "Your draft has been saved successfully",
      })

      // Clear the form
      setTitle("")
      setContent("")

      // Redirect to the draft editor
      router.push(`/creator/drafts/${draft.id}`)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Draft</CardTitle>
        <CardDescription>Quickly save your ideas as drafts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input placeholder="Draft title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Textarea
            placeholder="Write your content here..."
            className="min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveDraft} disabled={isSaving || !title.trim()} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
      </CardFooter>
    </Card>
  )
}

