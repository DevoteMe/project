"use client"

import { useState } from "react"
import type { AccessLevel, ContentAccess } from "@/types/exclusive-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Edit, Lock, Globe, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ContentAccessSettings } from "@/components/creator/content/content-access-settings"

// Mock data for demonstration
const mockContent: {
  id: string
  title: string
  type: string
  createdAt: string
  access: ContentAccess
}[] = [
  {
    id: "c1",
    title: "My Journey as a Creator",
    type: "post",
    createdAt: "2023-06-10T14:30:00Z",
    access: {
      id: "a1",
      contentId: "c1",
      accessLevel: "public",
      previewEnabled: false,
      createdAt: "2023-06-10T14:30:00Z",
      updatedAt: "2023-06-10T14:30:00Z",
    },
  },
  {
    id: "c2",
    title: "Behind the Scenes",
    type: "video",
    createdAt: "2023-06-09T10:15:00Z",
    access: {
      id: "a2",
      contentId: "c2",
      accessLevel: "subscribers",
      previewEnabled: true,
      previewPercentage: 20,
      createdAt: "2023-06-09T10:15:00Z",
      updatedAt: "2023-06-09T10:15:00Z",
    },
  },
  {
    id: "c3",
    title: "Q&A Session",
    type: "livestream",
    createdAt: "2023-06-07T09:20:00Z",
    access: {
      id: "a3",
      contentId: "c3",
      accessLevel: "tier-specific",
      allowedTierIds: ["2", "3"],
      previewEnabled: true,
      previewPercentage: 15,
      createdAt: "2023-06-07T09:20:00Z",
      updatedAt: "2023-06-07T09:20:00Z",
    },
  },
  {
    id: "c4",
    title: "My Creative Process",
    type: "post",
    createdAt: "2023-06-06T16:10:00Z",
    access: {
      id: "a4",
      contentId: "c4",
      accessLevel: "tier-specific",
      allowedTierIds: ["3"],
      previewEnabled: false,
      createdAt: "2023-06-06T16:10:00Z",
      updatedAt: "2023-06-06T16:10:00Z",
    },
  },
  {
    id: "c5",
    title: "Monthly Update",
    type: "post",
    createdAt: "2023-06-05T11:45:00Z",
    access: {
      id: "a5",
      contentId: "c5",
      accessLevel: "subscribers",
      previewEnabled: false,
      createdAt: "2023-06-05T11:45:00Z",
      updatedAt: "2023-06-05T11:45:00Z",
    },
  },
]

// Mock tier data for display purposes
const mockTierNames: Record<string, string> = {
  "1": "Bronze",
  "2": "Silver",
  "3": "Gold",
}

export function ExclusiveContentList() {
  const [content, setContent] = useState(mockContent)
  const [searchQuery, setSearchQuery] = useState("")
  const [accessFilter, setAccessFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<(typeof mockContent)[0] | null>(null)

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAccess = accessFilter === "all" || item.access.accessLevel === accessFilter

    return matchesSearch && matchesAccess
  })

  const handleEditAccess = (contentItem: (typeof mockContent)[0]) => {
    setSelectedContent(contentItem)
    setIsDialogOpen(true)
  }

  const handleSaveAccess = (access: ContentAccess) => {
    if (!selectedContent) return

    // Update the content item with new access settings
    setContent((prev) => prev.map((item) => (item.id === selectedContent.id ? { ...item, access } : item)))

    setIsDialogOpen(false)
    setSelectedContent(null)

    toast({
      title: "Access settings updated",
      description: "Content access settings have been saved successfully.",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getAccessLevelIcon = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case "public":
        return <Globe className="h-4 w-4" />
      case "subscribers":
        return <Users className="h-4 w-4" />
      case "tier-specific":
        return <Lock className="h-4 w-4" />
      default:
        return null
    }
  }

  const getAccessLevelBadge = (access: ContentAccess) => {
    const { accessLevel, allowedTierIds } = access

    let variant: "default" | "secondary" | "outline" = "default"
    let label = "Unknown"

    switch (accessLevel) {
      case "public":
        variant = "outline"
        label = "Public"
        break
      case "subscribers":
        variant = "secondary"
        label = "Subscribers Only"
        break
      case "tier-specific":
        variant = "default"
        if (allowedTierIds && allowedTierIds.length > 0) {
          const tierNames = allowedTierIds.map((id) => mockTierNames[id]).filter(Boolean)
          label = tierNames.length === 1 ? `${tierNames[0]} Tier` : `${tierNames.length} Tiers`
        } else {
          label = "Specific Tiers"
        }
        break
    }

    return (
      <Badge variant={variant} className="flex items-center space-x-1">
        {getAccessLevelIcon(accessLevel)}
        <span>{label}</span>
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Access Settings</CardTitle>
        <CardDescription>Manage access levels for your content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={accessFilter} onValueChange={setAccessFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access Levels</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="subscribers">Subscribers Only</SelectItem>
                <SelectItem value="tier-specific">Specific Tiers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No content found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell>{getAccessLevelBadge(item.access)}</TableCell>
                      <TableCell>
                        {item.access.previewEnabled ? (
                          <Badge variant="outline" className="bg-green-50">
                            {item.access.previewPercentage || 20}% Preview
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No preview</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEditAccess(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Content Access</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="py-4">
              <h3 className="font-medium mb-4">{selectedContent.title}</h3>
              <ContentAccessSettings
                contentId={selectedContent.id}
                initialAccess={selectedContent.access}
                onSave={handleSaveAccess}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

