"use client"

import { ConversationList } from "@/components/messaging/conversation-list"
import { ConversationThread } from "@/components/messaging/conversation-thread"
import { MessagingProvider } from "@/providers/messaging-provider"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useEffect, useState } from "react"
import { useMessaging } from "@/providers/messaging-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

function MobileMessagingView() {
  const { activeConversation, setActiveConversation } = useMessaging()

  if (!activeConversation) {
    return <ConversationList />
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setActiveConversation(null)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to conversations
        </Button>
      </div>
      <div className="flex-1">
        <ConversationThread />
      </div>
    </div>
  )
}

function DesktopMessagingView() {
  return (
    <div className="grid grid-cols-[320px_1fr] h-full">
      <ConversationList />
      <ConversationThread />
    </div>
  )
}

export function MessagingView() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  // We need to handle the hydration correctly for responsive layouts
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show nothing during initial SSR/hydration
  if (!isMounted) return null

  return <MessagingProvider>{isMobile ? <MobileMessagingView /> : <DesktopMessagingView />}</MessagingProvider>
}

