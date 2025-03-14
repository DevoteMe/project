"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeOptions {
  threshold?: number
  preventDefault?: boolean
}

export function useSwipe(
  elementRef: React.RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  options: SwipeOptions = {},
) {
  const { threshold = 50, preventDefault = true } = options

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const touchEndY = useRef<number | null>(null)

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchStartY.current = e.targetTouches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
    touchEndY.current = e.targetTouches[0].clientY

    // Prevent default only if we're swiping horizontally
    if (preventDefault && touchStartX.current && touchEndX.current) {
      const diffX = Math.abs(touchStartX.current - touchEndX.current)
      const diffY = Math.abs(touchStartY.current! - touchEndY.current!)

      if (diffX > diffY && diffX > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) return

    const diffX = touchStartX.current - touchEndX.current
    const diffY = touchStartY.current - touchEndY.current

    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swiped left
          handlers.onSwipeLeft?.()
        } else {
          // Swiped right
          handlers.onSwipeRight?.()
        }
      }
    }
    // Vertical swipe
    else {
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          // Swiped up
          handlers.onSwipeUp?.()
        } else {
          // Swiped down
          handlers.onSwipeDown?.()
        }
      }
    }

    // Reset values
    touchStartX.current = null
    touchEndX.current = null
    touchStartY.current = null
    touchEndY.current = null
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener("touchstart", handleTouchStart)
    element.addEventListener("touchmove", handleTouchMove)
    element.addEventListener("touchend", handleTouchEnd)

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [elementRef, handlers])
}

