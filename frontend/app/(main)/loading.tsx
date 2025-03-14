import { SkeletonCard } from "@/components/ui/skeleton-card"

export default function Loading() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

