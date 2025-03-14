"use client"

import type React from "react"
import { useState } from "react"
import type { Conversation } from "@/types/message"
import { useMessaging } from "@/providers/messaging-provider"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Edit, MoreVertical, Search, Users, Plus, Archive } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { NewConversationDialog } from "./new-conversation-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ConversationList() {
  const { user } = useAuth()
  const { conversations, setActiveConversation, activeConversation, archiveConversation } = useMessaging()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)

  // Filter conversations by search term
  const filteredConversations = conversations
    .filter((conversation) => !conversation.isArchived)
    .filter((conversation) => {
      const searchLower = searchTerm.toLowerCase()

      // For direct conversations, search other user's name
      if (conversation.type === "direct") {
        const otherMember = conversation.members.find((member) => member.userId !== user?.id)
        return otherMember?.user?.name?.toLowerCase().includes(searchLower) || false
      }

      // For group conversations, search group name
      return conversation.name?.toLowerCase().includes(searchLower) || false
    })

  // Helper function to get conversation display name
  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === "group") {
      return conversation.name || "Group Conversation"
    }

    const otherMember = conversation.members.find((member) => member.userId !== user?.id)
    return otherMember?.user?.name || "Unknown User"
  }

  // Helper function to get conversation avatar
  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === "group") {
      return conversation.avatar
    }

    const otherMember = conversation.members.find((member) => member.userId !== user?.id)
    return otherMember?.user?.image
  }

  // Helper function to format time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return format(date, "h:mm a")
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else {
      return format(date, "MMM d")
    }
  }

  // Handle clicking on a conversation
  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversation(conversation)
  }

  // Handle archiving a conversation
  const handleArchive = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await archiveConversation(conversationId)
  }

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsNewConversationOpen(true)}>
            <Plus className="h-5 w-5" />
            <span className="sr-only">New conversation</span>
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                  activeConversation?.id === conversation.id && "bg-secondary",
                )}
                onClick={() => handleConversationClick(conversation)}
              >
                {conversation.type === "group" ? (
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      {conversation.avatar ? (
                        <AvatarImage src={conversation.avatar} />
                      ) : (
                        <AvatarFallback>
                          <Users className="h-5 w-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 bg-primary text-xs text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.members.length}
                    </span>
                  </div>
                ) : (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getConversationAvatar(conversation)} />
                    <AvatarFallback>{getConversationName(conversation).charAt(0)}</AvatarFallback>
                  </Avatar>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{getConversationName(conversation)}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {conversation.lastMessage && formatMessageTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage?.isDeleted
                        ? "This message was deleted"
                        : conversation.lastMessage?.content || "No messages yet"}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="rounded-full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {conversation.type === "group" && (
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit group
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => handleArchive(conversation.id, e)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <NewConversationDialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen} />
    </div>
  )
}

