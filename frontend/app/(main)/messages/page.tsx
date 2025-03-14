import type { Metadata } from "next"
import MessagingView from "./messages-page"

export const metadata: Metadata = {
  title: "Messages | DevoteMe",
  description: "Chat with creators and other members of the DevoteMe community",
}

export default function MessagesPage() {
  return (
    <div className="w-full h-full">
      <MessagingView />
    </div>
  )
}

