import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Heart, Users } from "lucide-react"

interface CreatorCardProps {
  creator: {
    id: string
    username: string
    profilePicture?: string | null
    isOnline?: boolean
    lastSeen?: string
    contentCreator?: {
      devotionalPrice?: number
      totalPosts?: number
      totalDevotees?: number
    }
  }
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const initials = creator.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-devoteme-600 to-devoteme-400"></div>
      <CardContent className="pt-0 relative">
        <div className="-mt-12 flex justify-center">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={creator.profilePicture || ""} alt={creator.username} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-3 text-center">
          <Link href={`/creator/${creator.username}`}>
            <h3 className="text-xl font-semibold hover:underline">{creator.username}</h3>
          </Link>
          <div className="mt-2 flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{creator.contentCreator?.totalPosts || 0} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{creator.contentCreator?.totalDevotees || 0} devotees</span>
            </div>
          </div>
          {creator.contentCreator?.devotionalPrice && (
            <div className="mt-2 text-sm font-medium">{formatPrice(creator.contentCreator.devotionalPrice)}/month</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-4">
        <Button asChild>
          <Link href={`/creator/${creator.username}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

