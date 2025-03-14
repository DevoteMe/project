"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, UserX, User, Search } from "lucide-react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"

interface BlockedUser {
  blockId: string
  user: {
    id: string
    username: string
    name: string
    avatar: string
  }
  blockedAt: string
}

export default function BlockedUsersPage() {
  const { data: session } = useSession()
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUnblocking, setIsUnblocking] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchBlockedUsers()
  }, [])

  const fetchBlockedUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blocks`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setBlockedUsers(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch blocked users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching blocked users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnblock = async (userId: string, blockId: string) => {
    setIsUnblocking((prev) => ({ ...prev, [blockId]: true }))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blocks/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setBlockedUsers((prev) => prev.filter((user) => user.blockId !== blockId))
        toast({
          title: "Success",
          description: "User unblocked successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to unblock user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
      toast({
        title: "Error",
        description: "An error occurred while unblocking user",
        variant: "destructive",
      })
    } finally {
      setIsUnblocking((prev) => ({ ...prev, [blockId]: false }))
    }
  }

  const filteredUsers = blockedUsers.filter(
    (item) =>
      item.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Blocked Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>Manage Blocked Users</CardTitle>
          <CardDescription>
            Users you've blocked cannot follow you, view your content, or interact with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blocked users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : blockedUsers.length === 0 ? (
              <EmptyState
                icon={<UserX className="h-12 w-12 text-muted-foreground" />}
                title="No Blocked Users"
                description="You haven't blocked any users yet"
              />
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                icon={<Search className="h-12 w-12 text-muted-foreground" />}
                title="No Results Found"
                description="No blocked users match your search"
              />
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((item) => (
                  <div key={item.blockId} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={item.user.avatar} alt={item.user.username} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{item.user.name}</h4>
                        <p className="text-sm text-muted-foreground">@{item.user.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(item.user.id, item.blockId)}
                      disabled={isUnblocking[item.blockId]}
                    >
                      {isUnblocking[item.blockId] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unblock"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

