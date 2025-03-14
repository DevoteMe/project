"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer"

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  overscan?: number
  className?: string
  onEndReached?: () => void
  endReachedThreshold?: number
  loading?: boolean
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  keyExtractor?: (item: T, index: number) => string
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  overscan = 5,
  className = "",
  onEndReached,
  endReachedThreshold = 0.8,
  loading = false,
  loadingComponent = <div className="py-4 text-center">Loading more items...</div>,
  emptyComponent = <div className="py-8 text-center text-muted-foreground">No items to display</div>,
  keyExtractor = (_, index) => index.toString(),
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  const { ref: endRef, inView: endIsVisible } = useInView({
    threshold: endReachedThreshold,
  })

  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return

    const { scrollTop, clientHeight } = containerRef.current
    const start = Math.floor(scrollTop / itemHeight) - overscan
    const end = Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan

    setVisibleRange({
      start: Math.max(0, start),
      end: Math.min(items.length, end),
    })
  }, [itemHeight, items.length, overscan])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      calculateVisibleRange()
    }

    calculateVisibleRange()
    container.addEventListener("scroll", handleScroll)

    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [calculateVisibleRange, items])

  useEffect(() => {
    if (endIsVisible && onEndReached && !loading) {
      onEndReached()
    }
  }, [endIsVisible, onEndReached, loading])

  if (items.length === 0 && !loading) {
    return <>{emptyComponent}</>
  }

  const visibleItems = items.slice(visibleRange.start, visibleRange.end)

  return (
    <div ref={containerRef} className={`h-full overflow-auto ${className}`} role="list" aria-busy={loading}>
      <div
        style={{
          height: `${items.length * itemHeight}px`,
          position: "relative",
        }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.start + index
          return (
            <div
              key={keyExtractor(item, actualIndex)}
              style={{
                position: "absolute",
                top: `${actualIndex * itemHeight}px`,
                width: "100%",
                height: `${itemHeight}px`,
              }}
              role="listitem"
            >
              {renderItem(item, actualIndex)}
            </div>
          )
        })}
        <div ref={endRef} style={{ height: "1px" }} />
      </div>
      {loading && loadingComponent}
    </div>
  )
}

