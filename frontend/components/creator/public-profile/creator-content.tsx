"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExclusiveBadge } from "@/components/content/exclusive-badge"
import { ContentPreview } from "@/components/content/content-preview"
import { GiftButton } from "@/components/gifts/gift-button"
import { Search } from "lucide-react"

// Mock data for demonstration
const mockContent = [
  {
    id: "c1",
    title: "My Journey as a Creator",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    type: "post",
    createdAt: "2023-06-10T14:30:00Z",
    thumbnail: "/placeholder.svg?height=200&width=400",
    likes: 42,
    comments: 12,
    access: {
      accessLevel: "public" as const,
      previewEnabled: false,
    },
  },
  {
    id: "c2",
    title: "Behind the Scenes",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    type: "video",
    createdAt: "2023-06-09T10:15:00Z",
    thumbnail: "/placeholder.svg?height=200&width=400",
    likes: 78,
    comments: 24,
    access: {
      accessLevel: "subscribers" as const,
      previewEnabled: true,
      previewPercentage: 20,
    },
  },
  {
    id: "c3",
    title: "Q&A Session",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    type: "livestream",
    createdAt: "2023-06-07T09:20:00Z",
    thumbnail: "/placeholder.svg?height=200&width=400",
    likes: 156,
    comments: 87,
    access: {
      accessLevel: "tier-specific" as const,
      allowedTierIds: ["2", "3"],
      allowedTierNames: ["Silver", "Gold"],
      previewEnabled: true,
      previewPercentage: 15,
    },
  },
  {
    id: "c4",
    title: "My Creative Process",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    type: "post",
    createdAt: "2023-06-06T16:10:00Z",
    thumbnail: "/placeholder.svg?height=200&width=400",
    likes: 63,
    comments: 18,
    access: {
      accessLevel: "tier-specific" as const,
      allowedTierIds: ["3"],
      allowedTierNames: ["Gold"],
      previewEnabled: false,
    },
  },
]

interface CreatorContentProps {
  creatorId: string
}

export function CreatorContent({ creatorId }: CreatorContentProps) {
  const [content, setContent] = useState(mockContent)
  const [searchQuery, setSearchQuery] = useState("")
  const [contentType, setContentType] = useState("all")
  const [accessFilter, setAccessFilter] = useState("all")
  const [selectedContent, setSelectedContent] = useState<(typeof mockContent)[0] | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = contentType === "all" || item.type === contentType
    const matchesAccess =
      accessFilter === "all" ||
      (accessFilter === "public" && item.access.accessLevel === "public") ||
      (accessFilter === "exclusive" && item.access.accessLevel !== "public")

    return matchesSearch && matchesType && matchesAccess
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleOpenPreview = (item: (typeof mockContent)[0]) => {
    setSelectedContent(item)
    setIsPreviewOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="post">Posts</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="livestream">Livestreams</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="poll">Polls</SelectItem>
            </SelectContent>
          </Select>

          <Select value={accessFilter} onValueChange={setAccessFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="public">Public Only</SelectItem>
              <SelectItem value="exclusive">Exclusive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content found matching your filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img src={item.thumbnail || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />
                {item.access.accessLevel !== "public" && (
                  <div className="absolute top-2 right-2">
                    <ExclusiveBadge accessLevel={item.access.accessLevel} tierNames={item.access.allowedTierNames} />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>

                  <h3 className="font-semibold line-clamp-2">{item.title}</h3>

                  <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{item.likes} likes</span>
                      <span>{item.comments} comments</span>
                    </div>

                    <div className="flex space-x-2">
                      <GiftButton creatorId={creatorId} contentId={item.id} variant="ghost" size="sm" />

                      <Button variant="outline" size="sm" onClick={() => handleOpenPreview(item)}>
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedContent && isPreviewOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedContent.title}</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
              </div>

              {selectedContent.access.accessLevel !== "public" ? (
                <ContentPreview
                  creatorId={creatorId}
                  creatorName="Creator Name"
                  previewContent={
                    <div className="prose max-w-none">
                      <img
                        src={selectedContent.thumbnail || "/placeholder.svg"}
                        alt={selectedContent.title}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                      <p>{selectedContent.excerpt}</p>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies
                        lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel
                        ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                      </p>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies
                        lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel
                        ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                      </p>
                    </div>
                  }
                  previewPercentage={selectedContent.access.previewPercentage}
                  accessType={selectedContent.access.accessLevel}
                  requiredTierIds={selectedContent.access.allowedTierIds}
                />
              ) : (
                <div className="prose max-w-none">
                  <img
                    src={selectedContent.thumbnail || "/placeholder.svg"}
                    alt={selectedContent.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <p>{selectedContent.excerpt}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia,
                    nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies
                    lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia,
                    nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies
                    lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

