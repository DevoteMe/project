"use client"

import { useEffect, useState } from "react"
import { PenToolIcon as Tool, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MaintenanceMode() {
  const [isInMaintenance, setIsInMaintenance] = useState(false)
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds

  useEffect(() => {
    // Check if the application is in maintenance mode
    const checkMaintenanceStatus = async () => {
      try {
        const response = await fetch("/api/maintenance-status")
        const data = await response.json()
        setIsInMaintenance(data.maintenance)
        if (data.maintenance && data.expectedDuration) {
          setCountdown(data.expectedDuration)
        }
      } catch (error) {
        console.error("Failed to check maintenance status:", error)
      }
    }

    checkMaintenanceStatus()
    const interval = setInterval(checkMaintenanceStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isInMaintenance && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isInMaintenance, countdown])

  if (!isInMaintenance) {
    return null
  }

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-md rounded-lg border bg-card p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <Tool className="h-10 w-10 text-amber-600" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold">We're under maintenance</h2>
        <p className="mt-4 text-center text-muted-foreground">
          We're performing some scheduled maintenance to improve your experience. We'll be back shortly.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-center">
          <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Expected completion in: <span className="font-semibold">{formatCountdown()}</span>
          </p>
        </div>
        <div className="mt-8 text-center">
          <Button
            onClick={() => window.location.reload()}
            className="gap-2"
            aria-label="Check if maintenance is complete"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  )
}

