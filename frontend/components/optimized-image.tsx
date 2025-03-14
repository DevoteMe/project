"use client"

import Image, { type ImageProps } from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  fallback?: string
  lowQualityPlaceholder?: boolean
  aspectRatio?: number
  containerClassName?: string
}

export function OptimizedImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  lowQualityPlaceholder = true,
  aspectRatio,
  containerClassName,
  className,
  fill,
  width,
  height,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [blurDataURL, setBlurDataURL] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (lowQualityPlaceholder && typeof src === "string") {
      // Generate a tiny placeholder (could be replaced with a real LQIP service)
      setBlurDataURL(
        `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width || 100} ${height || 100}"><rect width="100%" height="100%" fill="rgb(229 231 235)"/></svg>`,
      )
    }
  }, [src, lowQualityPlaceholder, width, height])

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  const actualSrc = error ? fallback : src

  const imageStyles = cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", className)

  const containerStyles = cn("relative overflow-hidden", aspectRatio && `aspect-[${aspectRatio}]`, containerClassName)

  if (fill) {
    return (
      <div className={containerStyles}>
        <Image
          src={actualSrc || "/placeholder.svg"}
          alt={alt}
          fill
          className={imageStyles}
          onLoadingComplete={() => setIsLoading(false)}
          onError={handleError}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          {...props}
        />
      </div>
    )
  }

  return (
    <Image
      src={actualSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={imageStyles}
      onLoadingComplete={() => setIsLoading(false)}
      onError={handleError}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      {...props}
    />
  )
}

