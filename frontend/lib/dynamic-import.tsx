import type React from "react"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface DynamicImportOptions {
  ssr?: boolean
  loading?: React.ComponentType
  suspense?: boolean
}

export function dynamicImport<T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options: DynamicImportOptions = {},
) {
  const { ssr = false, loading = () => <Skeleton className="h-32 w-full" />, suspense = false } = options

  const Component = dynamic(importFn, {
    ssr,
    loading: suspense ? undefined : loading,
  })

  if (suspense) {
    return (props: T) => (
      <Suspense fallback={<loading />}>
        <Component {...props} />
      </Suspense>
    )
  }

  return Component
}

