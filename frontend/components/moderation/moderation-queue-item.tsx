"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Check, X, AlertTriangle, Clock, Calendar, Tag } from "lucide-react"
import type { ModerationQueueItem as QueueItemType } from "@/types/moderation"
import { useModeration } from "@/providers/moderation-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ModerationQueueItemProps {
  item: QueueItemType
}

export function ModerationQueueItem({ item }: ModerationQueueItemProps) {
  const { moderateContent } = useModeration()
  const [reason, setReason] = useState("")
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [actionType, setActionType] = useState<"deny" | "quarantine">("deny")

  // Calculate time remaining for auto-approval
  const expiresAt = new Date(item.expiresAt).getTime()
  const now = Date.now()
  const secondsRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000))

  const handleAction = async (action: "approve" | "deny" | "quarantine") => {
    if (action === "approve") {
      await moderateContent(item.id, "approve")
    } else {
      setActionType(action)
      setShowReasonDialog(true)
    }
  }

  const handleSubmitReason = async () => {
    await moderateContent(item.id, actionType, reason)
    setShowReasonDialog(false)
    setReason("")
  }

  return (
    <>
      <Card className="mb-4 overflow-hidden">
        <CardHeader className="pb-2 flex flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={item.creatorAvatar} alt={item.creatorName} />
              <AvatarFallback>{item.creatorName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{item.creatorName}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.category && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {item.category}
              </Badge>
            )}
            <Badge
              variant={
                item.contentType === "post" ? "default" : item.contentType === "comment" ? "secondary" : "outline"
              }
            >
              {item.contentType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="whitespace-pre-wrap">{item.content}</p>
          </div>
          {item.mediaUrls && item.mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {item.mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Media ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center gap-1 ${secondsRemaining <= 10 ? "text-red-500" : secondsRemaining <= 30 ? "text-amber-500" : "text-muted-foreground"}`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>{secondsRemaining}s</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Auto-approval in {secondsRemaining} seconds</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => handleAction("deny")}>
              <X className="h-4 w-4 mr-1" /> Deny
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction("quarantine")}>
              <AlertTriangle className="h-4 w-4 mr-1" /> Quarantine
            </Button>
            <Button variant="default" size="sm" onClick={() => handleAction("approve")}>
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "deny" ? "Deny Content" : "Quarantine Content"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="reason" className="block text-sm font-medium mb-2">
              Reason (will be shown to the content creator)
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for this action..."
              className="w-full"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReasonDialog(false)}>
              Cancel
            </Button>
            <Button variant={actionType === "deny" ? "destructive" : "default"} onClick={handleSubmitReason}>
              {actionType === "deny" ? "Deny Content" : "Quarantine Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

