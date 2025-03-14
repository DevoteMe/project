"use client"
import { cn } from "@/lib/utils"
import type { MessageWithStatus, MessageAttachment } from "@/types/message"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Check, CheckCheck, Clock, AlertCircle, ImageIcon, FileText, Video } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useMessaging } from "@/providers/messaging-provider"

type MessageBubbleProps = {
  message: MessageWithStatus
  showAvatar?: boolean
}

function MessageAttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  const getIcon = () => {
    switch (attachment.type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (attachment.type === "image") {
    return (
      <div className="relative rounded-md overflow-hidden mb-1">
        <img
          src={attachment.url || "/placeholder.svg"}
          alt={attachment.name}
          className="max-w-[240px] max-h-[180px] object-cover rounded-md"
        />
      </div>
    )
  }

  if (attachment.type === "video") {
    return (
      <div className="relative rounded-md overflow-hidden mb-1">
        <video src={attachment.url} controls className="max-w-[240px] max-h-[180px] object-cover rounded-md" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md mb-1">
      {getIcon()}
      <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
      <span className="text-xs text-muted-foreground">{Math.round(attachment.size / 1024)} KB</span>
    </div>
  )
}

export function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
  const { user } = useAuth()
  const { deleteMessage } = useMessaging()
  const isOwnMessage = message.senderId === user?.id
  const hasAttachments = message.attachments.length > 0

  // Status indicator
  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-primary" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-destructive" />
      default:
        return null
    }
  }

  const handleDelete = async () => {
    await deleteMessage(message.id)
  }

  return (
    <div className={cn("flex gap-2 mb-2 max-w-[85%] group", isOwnMessage ? "ml-auto" : "mr-auto")}>
      {!isOwnMessage && showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.image} />
          <AvatarFallback>{message.sender?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      )}

      <div className={isOwnMessage ? "order-1" : "order-2"}>
        <div
          className={cn(
            "rounded-lg p-3 relative",
            isOwnMessage ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none",
            message.isDeleted && "italic opacity-70",
          )}
        >
          {hasAttachments && (
            <div className="mb-2 space-y-1">
              {message.attachments.map((attachment) => (
                <MessageAttachmentPreview key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}

          <div className="break-words">{message.content}</div>

          <div className="text-xs mt-1 flex items-center justify-end gap-1">
            <span className={cn("text-muted-foreground", isOwnMessage && "text-primary-foreground/70")}>
              {format(new Date(message.createdAt), "h:mm a")}
            </span>
            {isOwnMessage && getStatusIcon()}
          </div>
        </div>
      </div>

      {isOwnMessage && !message.isDeleted && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Message options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete}>Delete message</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

