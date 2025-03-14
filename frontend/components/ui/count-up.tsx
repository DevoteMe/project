"use client"

import { useEffect, useState, useRef } from "react"

interface CountUpProps {
  value: number
  duration?: number
  formatter?: (value: number) => string
}

export function CountUp({ value, duration = 2000, formatter = (value: number) => value.toString() }: CountUpProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(count)
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
    const startTime = Date.now()
    const startValue = countRef.current
    const endValue = value
    const changeInValue = endValue - startValue

    const animateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime

      if (elapsed < duration) {
        const progress = elapsed / duration
        // Use easeOutQuad for smoother animation
        const easedProgress = 1 - Math.pow(1 - progress, 2)
        const currentValue = startValue + changeInValue * easedProgress
        setCount(currentValue)
        countRef.current = currentValue
        requestAnimationFrame(animateCount)
      } else {
        setCount(endValue)
        countRef.current = endValue
      }
    }

    requestAnimationFrame(animateCount)

    return () => {
      countRef.current = count
    }
  }, [value, duration])

  return <>{formatter(count)}</>
}

