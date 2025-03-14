// Performance monitoring utility

// Interface for performance metrics
interface PerformanceMetrics {
  timeToFirstByte?: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
  timeToInteractive?: number
  domContentLoaded?: number
  loadComplete?: number
  memoryUsage?: number
}

// Function to collect performance metrics
export function collectPerformanceMetrics(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {}

  // Only run in browser environment
  if (typeof window === "undefined") {
    return metrics
  }

  try {
    // Navigation timing metrics
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[]
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0]

        // Time to First Byte (TTFB)
        metrics.timeToFirstByte = navigationEntry.responseStart - navigationEntry.requestStart

        // DOM Content Loaded
        metrics.domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime

        // Load Complete
        metrics.loadComplete = navigationEntry.loadEventEnd - navigationEntry.startTime
      }
    }

    // Paint metrics
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType("paint")
      for (const entry of paintEntries) {
        const paintEntry = entry as PerformancePaintTiming
        if (paintEntry.name === "first-contentful-paint") {
          metrics.firstContentfulPaint = paintEntry.startTime
        }
      }
    }

    // Memory usage
    if (performance.memory) {
      metrics.memoryUsage = performance.memory.usedJSHeapSize
    }

    // Web Vitals metrics via PerformanceObserver
    if (typeof PerformanceObserver !== "undefined") {
      // We would normally set up observers here, but for simplicity
      // we're just checking if they're already collected
      const lcpEntries = performance.getEntriesByType("largest-contentful-paint")
      if (lcpEntries.length > 0) {
        metrics.largestContentfulPaint = lcpEntries[0].startTime
      }

      const fidEntries = performance.getEntriesByType("first-input")
      if (fidEntries.length > 0) {
        metrics.firstInputDelay = (fidEntries[0] as any).processingStart - fidEntries[0].startTime
      }

      const layoutShiftEntries = performance.getEntriesByType("layout-shift")
      if (layoutShiftEntries.length > 0) {
        metrics.cumulativeLayoutShift = layoutShiftEntries.reduce((sum, entry) => sum + (entry as any).value, 0)
      }
    }

    return metrics
  } catch (error) {
    console.error("Error collecting performance metrics:", error)
    return metrics
  }
}

// Function to report performance metrics to analytics
export function reportPerformanceMetrics(metrics: PerformanceMetrics, url: string): void {
  // This would normally send the metrics to an analytics service
  // For now, we'll just log them
  console.log("Performance metrics for", url, metrics)

  // Example of how you might send this to a real analytics service
  /*
  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      metrics,
      timestamp: Date.now(),
    }),
  }).catch(error => {
    console.error('Failed to report performance metrics:', error);
  });
  */
}

// Hook to measure component render time
export function measureRenderTime(componentName: string): () => void {
  const startTime = performance.now()

  return () => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    console.log(`Component ${componentName} rendered in ${renderTime.toFixed(2)}ms`)
  }
}

