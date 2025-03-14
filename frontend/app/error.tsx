"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-react"

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-12 w-12 text-red-600" aria-hidden="true" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight">Something went wrong</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        {error?.message || "An unexpected error occurred. Please try again or contact support if the problem persists."}
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/" className="gap-2">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

