"use client"

import { useEffect, useRef } from "react"
import { useMessaging } from "@/providers/messaging-provider"
import { useAuth } from "@/hooks/use-auth"
import { MessageBubble } from "./message-bubble"
import { MessageComposer } from "./message-composer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MoreVertical, Users, Info, PhoneCall, VideoIcon, Archive } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export function ConversationThread() {
  const { user } = useAuth()
  const { activeConversation, messages, isLoading, archiveConversation } = useMessaging()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Helper function to get conversation display name
  const getConversationName = () => {
    if (!activeConversation) return ""

    if (activeConversation.type === "group") {
      return activeConversation.name || "Group Conversation"
    }

    const otherMember = activeConversation.members.find((member) => member.userId !== user?.id)
    return otherMember?.user?.name || "Unknown User"
  }

  // Helper function to get conversation avatar
  const getConversationAvatar = () => {
    if (!activeConversation) return undefined

    if (activeConversation.type === "group") {
      return activeConversation.avatar
    }

    const otherMember = activeConversation.members.find((member) => member.userId !== user?.id)
    return otherMember?.user?.image
  }

  // Group messages by date
  const getGroupedMessages = () => {
    const grouped: { [key: string]: typeof messages } = {}

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(message)
    })

    return grouped
  }

  const handleArchive = async () => {
    if (activeConversation) {
      await archiveConversation(activeConversation.id)
    }
  }

  // If no active conversation, show empty state
  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Your Messages</h3>
          <p className="text-muted-foreground">Select a conversation or start a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Conversation header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getConversationAvatar()} />
            <AvatarFallback>
              {activeConversation.type === "group" ? <Users className="h-5 w-5" /> : getConversationName().charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium leading-none">{getConversationName()}</h3>
            {activeConversation.type === "group" && (
              <p className="text-sm text-muted-foreground">{activeConversation.members.length} members</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <PhoneCall className="h-5 w-5" />
            <span className="sr-only">Call</span>
          </Button>
          <Button variant="ghost" size="icon">
            <VideoIcon className="h-5 w-5" />
            <span className="sr-only">Video call</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
            <span className="sr-only">Info</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={cn("flex gap-2 mb-4", index % 2 === 0 ? "justify-start" : "justify-end")}>
                {index % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                <Skeleton className={cn("h-[60px] rounded-lg", index % 2 === 0 ? "w-[250px]" : "w-[200px]")} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {Object.entries(getGroupedMessages()).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="text-center my-4">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {dateMessages.map((message, index) => {
                  // Check if this is the first message from this sender in a sequence
                  const prevMessage = index > 0 ? dateMessages[index - 1] : null
                  const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId

                  return <MessageBubble key={message.id} message={message} showAvatar={showAvatar} />
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message composer */}
      <MessageComposer conversationId={activeConversation.id} />
    </div>
  )
}

