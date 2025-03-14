"use client"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSwipe } from "@/hooks/use-swipe"

interface MobileImageViewerProps {
  src: string
  alt: string
  onClose: () => void
}

export default function MobileImageViewer({ src, alt, onClose }: MobileImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset position and scale when image changes
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [src])

  // Handle pinch to zoom
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let initialDistance = 0
    let initialScale = 1

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
        initialScale = scale
      } else if (e.touches.length === 1) {
        setIsDragging(true)
        setStartPosition({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch to zoom
        e.preventDefault()
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )

        const newScale = Math.max(1, Math.min(4, initialScale * (currentDistance / initialDistance)))
        setScale(newScale)
      } else if (e.touches.length === 1 && isDragging && scale > 1) {
        // Pan when zoomed in
        e.preventDefault()
        setPosition({
          x: e.touches[0].clientX - startPosition.x,
          y: e.touches[0].clientY - startPosition.y,
        })
      }
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchmove", handleTouchMove)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [scale, position, isDragging])

  // Double tap to zoom
  const handleDoubleTap = () => {
    setScale(scale === 1 ? 2 : 1)
    setPosition({ x: 0, y: 0 })
  }

  // Use swipe hook for closing on swipe down
  useSwipe(containerRef, {
    onSwipeDown: () => {
      if (scale === 1) {
        onClose()
      }
    },
  })

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black touch-none"
      onClick={handleDoubleTap}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10 bg-black/50 text-white hover:bg-black/70"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="relative w-full h-full overflow-hidden">
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="absolute w-full h-full object-contain transition-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center",
          }}
          draggable={false}
        />
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-1">
        Pinch to zoom • Double tap to toggle zoom • Swipe down to close
      </div>
    </div>
  )
}

