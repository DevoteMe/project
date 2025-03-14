import { Eye, Heart, MessageSquare, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TopPostsProps {
  posts: {
    id: string
    title: string
    views: number
    likes: number
    comments: number
    conversionRate?: number
  }[]
}

export function TopPosts({ posts }: TopPostsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-7 border-b py-3 px-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Title</div>
          <div className="col-span-1 text-center">Views</div>
          <div className="col-span-1 text-center">Likes</div>
          <div className="col-span-1 text-center">Comments</div>
          <div className="col-span-1 text-center">Conversion</div>
        </div>
        {posts.map((post) => (
          <div key={post.id} className="grid grid-cols-7 items-center py-3 px-4 hover:bg-muted/50">
            <div className="col-span-3 font-medium truncate pr-4">
              {post.title}
              {post.conversionRate && (
                <Badge className="ml-2" variant="outline">
                  Premium
                </Badge>
              )}
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1.5">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>{post.views.toLocaleString()}</span>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1.5">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span>{post.likes.toLocaleString()}</span>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>{post.comments.toLocaleString()}</span>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1.5">
              {post.conversionRate ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">{post.conversionRate}%</span>
                </>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link href="/creator/content">View all content</Link>
        </Button>
      </div>
    </div>
  )
}

