"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ContentStatusBadge } from "@/components/moderation/content-status-badge"
import { ContentStatusExplanation } from "@/components/moderation/content-status-explanation"
import type { ModerationStatus } from "@/types/moderation"
import { Upload, X } from "lucide-react"

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

export function CreatePostForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<string[]>([])
  const [moderationStatus, setModerationStatus] = useState<ModerationStatus | null>(null)
  const [moderationReason, setModerationReason] = useState<string | undefined>(undefined)

  const handleAddMedia = () => {
    // In a real app, this would open a file picker and upload the file
    // For this mock, we'll just add a placeholder
    setMediaFiles([...mediaFiles, `/placeholder.svg?height=300&width=400&text=Image+${mediaFiles.length + 1}`])
  }

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // In a real app, you would submit the post to your API
      // For this mock, we'll simulate a successful submission with moderation

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Set initial moderation status to pending
      setModerationStatus("pending")

      // Simulate moderation process
      // In a real app, this would be handled by your backend
      setTimeout(() => {
        // Randomly decide moderation outcome for demo purposes
        const outcome = Math.random()
        if (outcome > 0.8) {
          setModerationStatus("denied")
          setModerationReason("This content violates our community guidelines regarding inappropriate content.")
        } else if (outcome > 0.6) {
          setModerationStatus("quarantined")
          setModerationReason("This content requires additional review by our moderation team.")
        } else {
          setModerationStatus("approved")

          // If approved, show success message and redirect after a delay
          toast({
            title: "Success",
            description: "Your post has been created and approved!",
          })

          setTimeout(() => {
            router.push("/feed")
          }, 2000)
        }
      }, 5000) // Simulate 5-second moderation process
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Create Post</span>
          {moderationStatus && <ContentStatusBadge status={moderationStatus} />}
        </CardTitle>
      </CardHeader>

      {moderationStatus ? (
        <CardContent>
          <ContentStatusExplanation status={moderationStatus} reason={moderationReason} />

          <div className="mt-6 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Your Post</h3>
            <p className="whitespace-pre-wrap">{content}</p>

            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {mediaFiles.map((url, index) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Media ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {moderationStatus === "pending" && (
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => router.push("/feed")}>
                Go to Feed
              </Button>
            </div>
          )}

          {(moderationStatus === "denied" || moderationStatus === "quarantined") && (
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setModerationStatus(null)
                  setModerationReason(undefined)
                }}
              >
                Edit Post
              </Button>
              <Button variant="default" onClick={() => router.push("/feed")}>
                Go to Feed
              </Button>
            </div>
          )}
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              <div className="grid grid-cols-2 gap-2">
                {mediaFiles.map((url, index) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Media ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => handleRemoveMedia(index)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {mediaFiles.length < 4 && (
                  <Button
                    variant="outline"
                    className="aspect-video flex flex-col items-center justify-center border border-dashed"
                    onClick={handleAddMedia}
                    type="button"
                  >
                    <Upload className="h-6 w-6 mb-2" />
                    <span>Add Media</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Content Moderation Notice</h3>
              <p className="text-sm text-muted-foreground">
                Your post will be reviewed by our automated moderation system before being published. If no issues are
                found, it will be automatically approved within 60 seconds. Posts that require additional review may be
                quarantined for manual review by our moderation team.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Post"}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}

