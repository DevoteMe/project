import Link from "next/link"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">DevoteMe</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/feed" className="text-sm font-medium transition-colors hover:text-primary">
            Feed
          </Link>
          <Link href="/explore" className="text-sm font-medium transition-colors hover:text-primary">
            Explore
          </Link>
          <Link href="/categories" className="text-sm font-medium transition-colors hover:text-primary">
            Categories
          </Link>
          <Link href="/messages" className="text-sm font-medium transition-colors hover:text-primary">
            Messages
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/search">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
        </Link>
        <NotificationDropdown />
        <UserNav />
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  )
}

