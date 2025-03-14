"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import axios from "@/lib/axios"

export function StatusIndicator() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await axios.get("/health")
        setStatus("online")
      } catch (error) {
        setStatus("offline")
      }
      setLastChecked(new Date())
    }

    checkStatus()
    const interval = setInterval(checkStatus, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className="flex items-center gap-1.5 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "online" ? "bg-green-500" : status === "offline" ? "bg-red-500" : "bg-yellow-500"
            }`}
            aria-hidden="true"
          ></span>
          <span className="sr-only">
            {status === "online" ? "API is online" : status === "offline" ? "API is offline" : "Checking API status"}
          </span>
          {status}
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="flex items-center gap-2">
            {status === "online" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <div>
              <p className="font-medium">API Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>
              {lastChecked && (
                <p className="text-xs text-muted-foreground">Last checked: {lastChecked.toLocaleTimeString()}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

