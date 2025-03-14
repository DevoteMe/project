"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import type { Category } from "@/types"
import { Upload, Image, type File, X } from "lucide-react"
// Import the file validators
import { validateImageFile, validateVideoFile } from "@/components/file-validator"

const uploadSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  visibilityType: z.enum(["PUBLIC", "FOLLOWERS", "DEVOTEES", "PAY_PER_VIEW"]),
  price: z.number().optional(),
  freeForDevotees: z.boolean().default(false),
  isNsfw: z.boolean().default(false),
  categories: z.array(z.string()).min(1, { message: "Select at least one category" }),
  mainCategory: z.string(),
})

type UploadFormValues = z.infer<typeof uploadSchema>

export default function UploadPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([
    { id: "sports", name: "Sports", isFixed: true },
    { id: "gaming", name: "Gaming", isFixed: true },
    { id: "exercise", name: "Exercise", isFixed: true },
    { id: "lifestyle", name: "Lifestyle", isFixed: true },
    { id: "travel", name: "Travel", isFixed: true },
    { id: "shopping", name: "Shopping", isFixed: true },
    { id: "health", name: "Health", isFixed: true },
    { id: "social", name: "Social", isFixed: true },
    { id: "entertainment", name: "Entertainment", isFixed: true },
    { id: "body", name: "Body", isFixed: true },
    { id: "misc", name: "Misc", isFixed: true },
  ])
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [contentPreview, setContentPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      visibilityType: "PUBLIC",
      freeForDevotees: false,
      isNsfw: false,
      categories: [],
    },
  })

  const visibilityType = watch("visibilityType")
  const selectedCategories = watch("categories")

  // Update the handleContentFileChange function to validate files
  const handleContentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file based on type
      let validationResult
      if (file.type.startsWith("image/")) {
        validationResult = await validateImageFile(file)
      } else if (file.type.startsWith("video/")) {
        validationResult = await validateVideoFile(file)
      } else {
        toast({
          title: "Error",
          description: "File must be an image or video",
          variant: "destructive",
        })
        return
      }

      if (!validationResult.valid) {
        toast({
          title: "Invalid File",
          description: validationResult.message,
          variant: "destructive",
        })
        return
      }

      setContentFile(file)

      // Create preview for video or image
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file)
        setContentPreview(url)
      } else if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setContentPreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Update the handleThumbnailFileChange function to validate files
  const handleThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate thumbnail image
      const validationResult = await validateImageFile(file)
      if (!validationResult.valid) {
        toast({
          title: "Invalid Thumbnail",
          description: validationResult.message,
          variant: "destructive",
        })
        return
      }

      setThumbnailFile(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const currentCategories = selectedCategories || []

    if (currentCategories.includes(categoryId)) {
      setValue(
        "categories",
        currentCategories.filter((id) => id !== categoryId),
      )

      // If this was the main category, reset main category
      if (watch("mainCategory") === categoryId) {
        setValue("mainCategory", "")
      }
    } else {
      const newCategories = [...currentCategories, categoryId]
      setValue("categories", newCategories)

      // If this is the first category, set it as main
      if (newCategories.length === 1) {
        setValue("mainCategory", categoryId)
      }
    }
  }

  const onSubmit = async (data: UploadFormValues) => {
    if (!contentFile) {
      toast({
        title: "Error",
        description: "Please select a content file to upload.",
        variant: "destructive",
      })
      return
    }

    if (!thumbnailFile) {
      toast({
        title: "Error",
        description: "Please select a thumbnail image.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("visibilityType", data.visibilityType)
      if (data.price && data.visibilityType === "PAY_PER_VIEW") {
        formData.append("price", data.price.toString())
      }
      formData.append("freeForDevotees", data.freeForDevotees.toString())
      formData.append("isNsfw", data.isNsfw.toString())
      formData.append("categories", JSON.stringify(data.categories))
      formData.append("mainCategory", data.mainCategory)
      formData.append("content", contentFile)
      formData.append("thumbnail", thumbnailFile)

      // Upload with progress tracking
      await axios.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        },
      })

      toast({
        title: "Success",
        description: "Your content has been uploaded successfully.",
      })

      router.push("/studio")
    } catch (error) {
      console.error("Error uploading content:", error)
      toast({
        title: "Error",
        description: "Failed to upload content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (!user || user.userType !== "CONTENT_CREATOR") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Creator Studio Access Denied</h2>
        <p className="text-muted-foreground mb-6">You need to be a content creator to access this page.</p>
        <Button asChild>
          <a href="/become-creator">Become a Creator</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Upload New Content</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
                <CardDescription>Provide information about your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter a title for your content" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories?.includes(category.id)}
                          onCheckedChange={() => handleCategoryChange(category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.categories && <p className="text-sm text-destructive">{errors.categories.message}</p>}
                </div>

                {selectedCategories && selectedCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="mainCategory">Main Category</Label>
                    <Select value={watch("mainCategory")} onValueChange={(value) => setValue("mainCategory", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select main category" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategories.map((categoryId) => {
                          const category = categories.find((c) => c.id === categoryId)
                          return category ? (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ) : null
                        })}
                      </SelectContent>
                    </Select>
                    {errors.mainCategory && <p className="text-sm text-destructive">{errors.mainCategory.message}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="visibilityType">Visibility</Label>
                  <Select defaultValue="PUBLIC" onValueChange={(value) => setValue("visibilityType", value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="FOLLOWERS">Followers Only</SelectItem>
                      <SelectItem value="DEVOTEES">Devotees Only</SelectItem>
                      <SelectItem value="PAY_PER_VIEW">Pay-Per-View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {visibilityType === "PAY_PER_VIEW" && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.99"
                      placeholder="Enter price"
                      onChange={(e) => setValue("price", Number.parseFloat(e.target.value))}
                    />
                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeForDevotees"
                    checked={watch("freeForDevotees")}
                    onCheckedChange={(checked) => setValue("freeForDevotees", !!checked)}
                  />
                  <Label htmlFor="freeForDevotees" className="font-normal">
                    Free for devotees (subscribers)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNsfw"
                    checked={watch("isNsfw")}
                    onCheckedChange={(checked) => setValue("isNsfw", !!checked)}
                  />
                  <Label htmlFor="isNsfw" className="font-normal">
                    This content is NSFW (Not Safe For Work)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Content</CardTitle>
                <CardDescription>Upload your content file</CardDescription>
              </CardHeader>
              <CardContent>
                {contentPreview ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                    {contentFile?.type.startsWith("video/") ? (
                      <video src={contentPreview} controls className="h-full w-full object-cover" />
                    ) : (
                      <img
                        src={contentPreview || "/placeholder.svg"}
                        alt="Content preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setContentFile(null)
                        setContentPreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Drag and drop your content file</p>
                      <p className="text-xs text-muted-foreground">Supports videos and images</p>
                    </div>
                    <Input
                      id="content"
                      type="file"
                      accept="video/*,image/*"
                      className="hidden"
                      onChange={handleContentFileChange}
                    />
                    <Label
                      htmlFor="content"
                      className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                      Select File
                    </Label>
                  </div>
                )}
                <div className="mt-4 text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">File requirements:</p>
                  <p>
                    <strong>Images:</strong> Square (1:1), Portrait (4:5), or Landscape (1.91:1) ratio. Max 10MB.
                  </p>
                  <p>
                    <strong>Videos:</strong> Aspect ratio between 9:16 and 16:9. Max 120 minutes. MP4 or MOV format. Max
                    4GB.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Thumbnail</CardTitle>
                <CardDescription>Upload a thumbnail image</CardDescription>
              </CardHeader>
              <CardContent>
                {thumbnailPreview ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                    <img
                      src={thumbnailPreview || "/placeholder.svg"}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setThumbnailFile(null)
                        setThumbnailPreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Image className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Drag and drop your thumbnail image</p>
                      <p className="text-xs text-muted-foreground">Recommended size: 1280x720</p>
                    </div>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailFileChange}
                    />
                    <Label
                      htmlFor="thumbnail"
                      className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                      Select Image
                    </Label>
                  </div>
                )}
                <div className="mt-4 text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Thumbnail requirements:</p>
                  <p>Square (1:1), Portrait (4:5), or Landscape (1.91:1) ratio. Max 10MB.</p>
                  <p>For videos, use the same aspect ratio as your video.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isUploading} className="w-full md:w-auto">
            {isUploading ? (
              <>
                <span className="mr-2">Uploading... {uploadProgress}%</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              "Upload Content"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

