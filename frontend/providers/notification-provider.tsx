"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import axios from "@/lib/axios"
import type { Notification, NotificationPreferences } from "@/types/notification"
import { useToast } from "@/hooks/use-toast"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences | null
  loading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await axios.get("/notifications")
      setNotifications(response.data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    if (!user) return

    try {
      const response = await axios.get("/notifications/preferences")
      setPreferences(response.data)
    } catch (err) {
      console.error("Failed to fetch notification preferences:", err)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put("/notifications/read-all")
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`/notifications/${id}`)
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    } catch (err) {
      console.error("Failed to delete notification:", err)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await axios.put("/notifications/preferences", newPreferences)
      setPreferences(response.data)
      toast({
        title: "Success",
        description: "Notification preferences updated",
      })
    } catch (err) {
      console.error("Failed to update notification preferences:", err)
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      })
    }
  }

  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  // Set up polling for new notifications
  useEffect(() => {
    if (!user) return

    fetchNotifications()
    fetchPreferences()

    const interval = setInterval(() => {
      fetchNotifications()
    }, 60000) // Poll every minute

    return () => clearInterval(interval)
  }, [user])

  // Set up WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user) return

    // This would be replaced with actual WebSocket implementation
    const setupWebSocket = () => {
      console.log("Setting up WebSocket connection for notifications")
      // WebSocket implementation would go here
    }

    setupWebSocket()
  }, [user])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

