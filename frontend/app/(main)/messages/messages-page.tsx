"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import axios from "@/lib/axios"
import type { Chat, Message } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatRelativeTime } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Send, Search, ArrowLeft } from "lucide-react"

function MessagingView() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showChatList, setShowChatList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  const fetchChats = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get("/chats")
      setChats(data)
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0])
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      // For demo purposes, set some mock data
      const mockChats = Array.from({ length: 5 }, (_, i) => ({
        id: `chat-${i}`,
        otherUser: {
          id: `user-${i}`,
          username: `user${i}`,
          profilePicture: null,
          isOnline: Math.random() > 0.5,
          lastSeen: new Date().toISOString(),
        },
        lastMessage: {
          content: `This is message ${i}`,
          senderId: Math.random() > 0.5 ? user?.id : `user-${i}`,
          createdAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
        unreadCount: Math.floor(Math.random() * 5),
      }))
      setChats(mockChats)
      if (!selectedChat && mockChats.length > 0) {
        setSelectedChat(mockChats[0])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      const { data } = await axios.get(`/chats/${chatId}/messages`)
      setMessages(data)
      // Mark messages as read
      axios.put(`/chats/${chatId}/read`)
    } catch (error) {
      console.error("Error fetching messages:", error)
      // For demo purposes, set some mock data
      const mockMessages = Array.from({ length: 10 }, (_, i) => ({
        id: `message-${i}`,
        senderId: i % 2 === 0 ? user?.id : selectedChat?.otherUser.id,
        content: `This is message ${i}`,
        createdAt: new Date(Date.now() - i * 1000 * 60 * 10).toISOString(),
        readAt: i % 2 === 0 ? new Date().toISOString() : null,
      }))
      setMessages(mockMessages)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    setIsSending(true)
    try {
      const { data } = await axios.post(`/chats/${selectedChat.id}/messages`, {
        content: newMessage,
      })

      // Add the new message to the messages list
      setMessages((prev) => [...prev, data])

      // Update the last message in the chat list
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                lastMessage: {
                  content: newMessage,
                  senderId: user?.id || "",
                  createdAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
                unreadCount: 0,
              }
            : chat,
        ),
      )

      setNewMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat)
    fetchMessages(chat.id)

    // Update unread count
    setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)))

    // On mobile, hide the chat list when a chat is selected
    if (isMobile) {
      setShowChatList(false)
    }
  }

  const handleBackToList = () => {
    setShowChatList(true)
  }

  const filteredChats = chats.filter((chat) =>
    chat.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id)
    }
  }, [selectedChat])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Determine what to show based on mobile state and selection
  const showList = !isMobile || (isMobile && showChatList)
  const showChat = !isMobile || (isMobile && !showChatList)

  return (
    <div className="h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {showList && (
          <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No conversations found.</div>
              ) : (
                <ul className="divide-y">
                  {filteredChats.map((chat) => {
                    const initials = chat.otherUser.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)

                    return (
                      <li
                        key={chat.id}
                        className={`p-3 hover:bg-muted/50 cursor-pointer ${
                          selectedChat?.id === chat.id ? "bg-muted" : ""
                        }`}
                        onClick={() => handleSelectChat(chat)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={chat.otherUser.profilePicture || ""} alt={chat.otherUser.username} />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            {chat.otherUser.isOnline && (
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">{chat.otherUser.username}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(chat.updatedAt)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.lastMessage.senderId === user?.id ? "You: " : ""}
                                {chat.lastMessage.content}
                              </p>
                              {chat.unreadCount > 0 && (
                                <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {showChat && (
          <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-3 border-b">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <Button variant="ghost" size="icon" onClick={handleBackToList} className="md:hidden">
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <Avatar>
                      <AvatarImage
                        src={selectedChat.otherUser.profilePicture || ""}
                        alt={selectedChat.otherUser.username}
                      />
                      <AvatarFallback>{selectedChat.otherUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedChat.otherUser.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedChat.otherUser.isOnline
                          ? "Online"
                          : `Last seen ${formatRelativeTime(selectedChat.otherUser.lastSeen)}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 flex flex-col-reverse">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {formatRelativeTime(message.createdAt)}
                            {message.senderId === user?.id && message.readAt && " • Read"}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <h2 className="text-xl font-semibold mb-2">No conversation selected</h2>
                <p className="text-muted-foreground mb-6">Select a conversation from the list or start a new one.</p>
                <Button asChild>
                  <Link href="/discover">Find Creators</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagingView

