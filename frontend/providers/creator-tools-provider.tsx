"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import type {
  Draft,
  ScheduledPost,
  Template,
  PostAnalytics,
  AudienceDemographics,
  GrowthTrend,
} from "@/types/creator-tools"

interface CreatorToolsContextType {
  // Drafts
  drafts: Draft[]
  loadingDrafts: boolean
  fetchDrafts: () => Promise<void>
  getDraft: (id: string) => Promise<Draft | null>
  saveDraft: (draft: Omit<Draft, "id" | "createdAt" | "updatedAt">) => Promise<Draft>
  updateDraft: (id: string, draft: Partial<Draft>) => Promise<Draft>
  deleteDraft: (id: string) => Promise<void>
  publishDraft: (id: string) => Promise<void>

  // Scheduled Posts
  scheduledPosts: ScheduledPost[]
  loadingScheduledPosts: boolean
  fetchScheduledPosts: () => Promise<void>
  getScheduledPost: (id: string) => Promise<ScheduledPost | null>
  schedulePost: (post: Omit<ScheduledPost, "id" | "createdAt" | "updatedAt" | "status">) => Promise<ScheduledPost>
  updateScheduledPost: (id: string, post: Partial<ScheduledPost>) => Promise<ScheduledPost>
  deleteScheduledPost: (id: string) => Promise<void>

  // Templates
  templates: Template[]
  loadingTemplates: boolean
  fetchTemplates: () => Promise<void>
  getTemplate: (id: string) => Promise<Template | null>
  createTemplate: (template: Omit<Template, "id" | "createdAt" | "updatedAt">) => Promise<Template>
  updateTemplate: (id: string, template: Partial<Template>) => Promise<Template>
  deleteTemplate: (id: string) => Promise<void>

  // Analytics
  postAnalytics: PostAnalytics[]
  audienceDemographics: AudienceDemographics | null
  growthTrends: GrowthTrend[]
  loadingAnalytics: boolean
  fetchPostAnalytics: (params: { start: Date; end: Date }) => Promise<void>
  fetchAudienceDemographics: () => Promise<void>
  fetchGrowthTrends: (params: { start: Date; end: Date }) => Promise<void>
}

const CreatorToolsContext = createContext<CreatorToolsContextType | undefined>(undefined)

export function CreatorToolsProvider({ children }: { children: ReactNode }) {
  // Drafts state
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)

  // Scheduled Posts state
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loadingScheduledPosts, setLoadingScheduledPosts] = useState(false)

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  // Analytics state
  const [postAnalytics, setPostAnalytics] = useState<PostAnalytics[]>([])
  const [audienceDemographics, setAudienceDemographics] = useState<AudienceDemographics | null>(null)
  const [growthTrends, setGrowthTrends] = useState<GrowthTrend[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Drafts functions
  const fetchDrafts = useCallback(async () => {
    setLoadingDrafts(true)
    try {
      const response = await fetch("/api/creator/drafts")
      if (!response.ok) {
        throw new Error("Failed to fetch drafts")
      }
      const data = await response.json()
      setDrafts(data.drafts)
    } catch (error) {
      console.error("Error fetching drafts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch drafts",
        variant: "destructive",
      })
    } finally {
      setLoadingDrafts(false)
    }
  }, [])

  const getDraft = useCallback(async (id: string): Promise<Draft | null> => {
    try {
      const response = await fetch(`/api/creator/drafts/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch draft")
      }
      const data = await response.json()
      return data.draft
    } catch (error) {
      console.error("Error fetching draft:", error)
      toast({
        title: "Error",
        description: "Failed to fetch draft",
        variant: "destructive",
      })
      return null
    }
  }, [])

  const saveDraft = useCallback(async (draft: Omit<Draft, "id" | "createdAt" | "updatedAt">): Promise<Draft> => {
    try {
      const response = await fetch("/api/creator/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        throw new Error("Failed to save draft")
      }

      const data = await response.json()
      setDrafts((prev) => [...prev, data.draft])
      return data.draft
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const updateDraft = useCallback(async (id: string, draft: Partial<Draft>): Promise<Draft> => {
    try {
      const response = await fetch(`/api/creator/drafts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        throw new Error("Failed to update draft")
      }

      const data = await response.json()
      setDrafts((prev) => prev.map((d) => (d.id === id ? data.draft : d)))
      return data.draft
    } catch (error) {
      console.error("Error updating draft:", error)
      toast({
        title: "Error",
        description: "Failed to update draft",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const deleteDraft = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/creator/drafts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete draft")
      }

      setDrafts((prev) => prev.filter((d) => d.id !== id))
      toast({
        title: "Success",
        description: "Draft deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting draft:", error)
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const publishDraft = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/creator/drafts/${id}/publish`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to publish draft")
      }

      setDrafts((prev) => prev.filter((d) => d.id !== id))
      toast({
        title: "Success",
        description: "Draft published successfully",
      })
    } catch (error) {
      console.error("Error publishing draft:", error)
      toast({
        title: "Error",
        description: "Failed to publish draft",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  // Scheduled Posts functions
  const fetchScheduledPosts = useCallback(async () => {
    setLoadingScheduledPosts(true)
    try {
      const response = await fetch("/api/creator/scheduled")
      if (!response.ok) {
        throw new Error("Failed to fetch scheduled posts")
      }
      const data = await response.json()
      setScheduledPosts(data.scheduledPosts)
    } catch (error) {
      console.error("Error fetching scheduled posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch scheduled posts",
        variant: "destructive",
      })
    } finally {
      setLoadingScheduledPosts(false)
    }
  }, [])

  const getScheduledPost = useCallback(async (id: string): Promise<ScheduledPost | null> => {
    try {
      const response = await fetch(`/api/creator/scheduled/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch scheduled post")
      }
      const data = await response.json()
      return data.scheduledPost
    } catch (error) {
      console.error("Error fetching scheduled post:", error)
      toast({
        title: "Error",
        description: "Failed to fetch scheduled post",
        variant: "destructive",
      })
      return null
    }
  }, [])

  const schedulePost = useCallback(
    async (post: Omit<ScheduledPost, "id" | "createdAt" | "updatedAt" | "status">): Promise<ScheduledPost> => {
      try {
        const response = await fetch("/api/creator/scheduled", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(post),
        })

        if (!response.ok) {
          throw new Error("Failed to schedule post")
        }

        const data = await response.json()
        setScheduledPosts((prev) => [...prev, data.scheduledPost])
        return data.scheduledPost
      } catch (error) {
        console.error("Error scheduling post:", error)
        toast({
          title: "Error",
          description: "Failed to schedule post",
          variant: "destructive",
        })
        throw error
      }
    },
    [],
  )

  const updateScheduledPost = useCallback(async (id: string, post: Partial<ScheduledPost>): Promise<ScheduledPost> => {
    try {
      const response = await fetch(`/api/creator/scheduled/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      })

      if (!response.ok) {
        throw new Error("Failed to update scheduled post")
      }

      const data = await response.json()
      setScheduledPosts((prev) => prev.map((p) => (p.id === id ? data.scheduledPost : p)))
      return data.scheduledPost
    } catch (error) {
      console.error("Error updating scheduled post:", error)
      toast({
        title: "Error",
        description: "Failed to update scheduled post",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const deleteScheduledPost = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/creator/scheduled/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete scheduled post")
      }

      setScheduledPosts((prev) => prev.filter((p) => p.id !== id))
      toast({
        title: "Success",
        description: "Scheduled post deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting scheduled post:", error)
      toast({
        title: "Error",
        description: "Failed to delete scheduled post",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  // Templates functions
  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true)
    try {
      const response = await fetch("/api/creator/templates")
      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      })
    } finally {
      setLoadingTemplates(false)
    }
  }, [])

  const getTemplate = useCallback(async (id: string): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/creator/templates/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch template")
      }
      const data = await response.json()
      return data.template
    } catch (error) {
      console.error("Error fetching template:", error)
      toast({
        title: "Error",
        description: "Failed to fetch template",
        variant: "destructive",
      })
      return null
    }
  }, [])

  const createTemplate = useCallback(
    async (template: Omit<Template, "id" | "createdAt" | "updatedAt">): Promise<Template> => {
      try {
        const response = await fetch("/api/creator/templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
        })

        if (!response.ok) {
          throw new Error("Failed to create template")
        }

        const data = await response.json()
        setTemplates((prev) => [...prev, data.template])
        return data.template
      } catch (error) {
        console.error("Error creating template:", error)
        toast({
          title: "Error",
          description: "Failed to create template",
          variant: "destructive",
        })
        throw error
      }
    },
    [],
  )

  const updateTemplate = useCallback(async (id: string, template: Partial<Template>): Promise<Template> => {
    try {
      const response = await fetch(`/api/creator/templates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      })

      if (!response.ok) {
        throw new Error("Failed to update template")
      }

      const data = await response.json()
      setTemplates((prev) => prev.map((t) => (t.id === id ? data.template : t)))
      return data.template
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/creator/templates/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      setTemplates((prev) => prev.filter((t) => t.id !== id))
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  // Analytics functions
  const fetchPostAnalytics = useCallback(async (params: { start: Date; end: Date }) => {
    setLoadingAnalytics(true)
    try {
      const searchParams = new URLSearchParams({
        start: params.start.toISOString(),
        end: params.end.toISOString(),
      })

      const response = await fetch(`/api/creator/analytics/posts?${searchParams}`)
      if (!response.ok) {
        throw new Error("Failed to fetch post analytics")
      }

      const data = await response.json()
      setPostAnalytics(data.analytics)
    } catch (error) {
      console.error("Error fetching post analytics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch post analytics",
        variant: "destructive",
      })
    } finally {
      setLoadingAnalytics(false)
    }
  }, [])

  const fetchAudienceDemographics = useCallback(async () => {
    setLoadingAnalytics(true)
    try {
      const response = await fetch("/api/creator/analytics/audience")
      if (!response.ok) {
        throw new Error("Failed to fetch audience demographics")
      }

      const data = await response.json()
      setAudienceDemographics(data.demographics)
    } catch (error) {
      console.error("Error fetching audience demographics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch audience demographics",
        variant: "destructive",
      })
    } finally {
      setLoadingAnalytics(false)
    }
  }, [])

  const fetchGrowthTrends = useCallback(async (params: { start: Date; end: Date }) => {
    setLoadingAnalytics(true)
    try {
      const searchParams = new URLSearchParams({
        start: params.start.toISOString(),
        end: params.end.toISOString(),
      })

      const response = await fetch(`/api/creator/analytics/growth?${searchParams}`)
      if (!response.ok) {
        throw new Error("Failed to fetch growth trends")
      }

      const data = await response.json()
      setGrowthTrends(data.trends)
    } catch (error) {
      console.error("Error fetching growth trends:", error)
      toast({
        title: "Error",
        description: "Failed to fetch growth trends",
        variant: "destructive",
      })
    } finally {
      setLoadingAnalytics(false)
    }
  }, [])

  const value = {
    // Drafts
    drafts,
    loadingDrafts,
    fetchDrafts,
    getDraft,
    saveDraft,
    updateDraft,
    deleteDraft,
    publishDraft,

    // Scheduled Posts
    scheduledPosts,
    loadingScheduledPosts,
    fetchScheduledPosts,
    getScheduledPost,
    schedulePost,
    updateScheduledPost,
    deleteScheduledPost,

    // Templates
    templates,
    loadingTemplates,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Analytics
    postAnalytics,
    audienceDemographics,
    growthTrends,
    loadingAnalytics,
    fetchPostAnalytics,
    fetchAudienceDemographics,
    fetchGrowthTrends,
  }

  return <CreatorToolsContext.Provider value={value}>{children}</CreatorToolsContext.Provider>
}

export function useCreatorTools() {
  const context = useContext(CreatorToolsContext)
  if (context === undefined) {
    throw new Error("useCreatorTools must be used within a CreatorToolsProvider")
  }
  return context
}

