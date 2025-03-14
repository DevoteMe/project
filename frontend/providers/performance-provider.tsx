"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { collectPerformanceMetrics, reportPerformanceMetrics } from "@/lib/performance-monitoring"

interface PerformanceContextType {
  isPerformanceSupported: boolean
  measureComponentRender: (componentName: string) => () => void
}

const PerformanceContext = createContext<PerformanceContextType>({
  isPerformanceSupported: false,
  measureComponentRender: () => () => {},
})

export function usePerformance() {
  return useContext(PerformanceContext)
}

interface PerformanceProviderProps {
  children: ReactNode
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [isPerformanceSupported, setIsPerformanceSupported] = useState(false)

  useEffect(() => {
    // Check if Performance API is supported
    setIsPerformanceSupported(
      typeof window !== "undefined" && "performance" in window && "getEntriesByType" in performance,
    )

    // Only run in production to avoid development overhead
    if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
      // Report metrics after page load
      const reportMetricsAfterLoad = () => {
        // Wait for LCP to be collected (usually within 2.5s)
        setTimeout(() => {
          const metrics = collectPerformanceMetrics()
          reportPerformanceMetrics(metrics, window.location.pathname)
        }, 3000)
      }

      // Report on initial load
      if (document.readyState === "complete") {
        reportMetricsAfterLoad()
      } else {
        window.addEventListener("load", reportMetricsAfterLoad, { once: true })
      }

      // Report on navigation (for SPA)
      const originalPushState = history.pushState
      history.pushState = function (...args) {
        originalPushState.apply(this, args)
        // Clear previous metrics
        performance.clearMarks()
        performance.clearMeasures()
        // Report after a delay to allow page to render
        setTimeout(() => {
          const metrics = collectPerformanceMetrics()
          reportPerformanceMetrics(metrics, window.location.pathname)
        }, 3000)
      }

      return () => {
        window.removeEventListener("load", reportMetricsAfterLoad)
        history.pushState = originalPushState
      }
    }
  }, [])

  const measureComponentRender = (componentName: string) => {
    const startTime = performance.now()

    return () => {
      if (isPerformanceSupported && process.env.NODE_ENV === "production") {
        const endTime = performance.now()
        const renderTime = endTime - startTime

        // Only log slow renders (> 50ms) to reduce noise
        if (renderTime > 50) {
          console.log(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`)
          // This could be reported to analytics in a real app
        }
      }
    }
  }

  return (
    <PerformanceContext.Provider value={{ isPerformanceSupported, measureComponentRender }}>
      {children}
    </PerformanceContext.Provider>
  )
}

