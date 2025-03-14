import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
        <p className="max-w-md text-muted-foreground">
          We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/" className="gap-2">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search" className="gap-2">
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

