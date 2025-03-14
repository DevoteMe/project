"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"

interface LazyLoadProps {
  children: React.ReactNode
  placeholder?: React.ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  className?: string
}

export function LazyLoad({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = "200px",
  triggerOnce = true,
  className,
}: LazyLoadProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  })

  useEffect(() => {
    if (inView && !shouldRender) {
      setShouldRender(true)
    }
  }, [inView, shouldRender])

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : placeholder}
    </div>
  )
}

interface LazyLoadImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholderClassName?: string
}

export function LazyLoadImage({ src, alt, width, height, className, placeholderClassName }: LazyLoadImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView && imgRef.current) {
      const img = imgRef.current
      img.onload = () => setIsLoaded(true)
      img.src = src
    }
  }, [inView, src])

  return (
    <div ref={ref} className={`relative ${className}`} style={{ width, height }}>
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-muted animate-pulse ${placeholderClassName}`}
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        width={width}
        height={height}
        loading="lazy"
        // src is set via useEffect when in view
      />
    </div>
  )
}

