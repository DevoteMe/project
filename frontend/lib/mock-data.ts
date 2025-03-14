import type { Conversation, Message } from "@/types/message"
import type { User } from "@/types/user"

// Mock users
const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user2",
    name: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user3",
    name: "Bob Johnson",
    username: "bobjohnson",
    email: "bob@example.com",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user4",
    name: "Alice Brown",
    username: "alicebrown",
    email: "alice@example.com",
    image: "/placeholder.svg?height=40&width=40",
  },
]

// Generate mock conversations
export function generateMockConversations(currentUser: User): Conversation[] {
  // Direct conversations
  const directConversations = mockUsers.map((user, index) => ({
    id: `conv-direct-${index}`,
    type: "direct" as const,
    members: [
      {
        userId: currentUser.id,
        user: currentUser,
        role: "member" as const,
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      },
      {
        userId: user.id,
        user,
        role: "member" as const,
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      },
    ],
    lastMessage: {
      id: `msg-direct-${index}`,
      conversationId: `conv-direct-${index}`,
      senderId: index % 2 === 0 ? currentUser.id : user.id,
      content: index % 2 === 0 ? "Hey, how's it going?" : "I wanted to ask you about the latest update",
      attachments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * (index + 1)).toISOString(), // Recent messages
      updatedAt: new Date(Date.now() - 1000 * 60 * (index + 1)).toISOString(),
      readBy: [currentUser.id],
      isDeleted: false,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * (index + 1)).toISOString(),
    unreadCount: index % 3 === 0 ? 2 : 0, // Some conversations have unread messages
    isArchived: false,
  }))

  // Group conversations
  const groupConversations: Conversation[] = [
    {
      id: "conv-group-1",
      type: "group",
      name: "Project Team",
      avatar: "/placeholder.svg?height=40&width=40",
      members: [
        {
          userId: currentUser.id,
          user: currentUser,
          role: "admin",
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
        },
        {
          userId: mockUsers[0].id,
          user: mockUsers[0],
          role: "member",
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        },
        {
          userId: mockUsers[1].id,
          user: mockUsers[1],
          role: "member",
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        },
      ],
      lastMessage: {
        id: "msg-group-1",
        conversationId: "conv-group-1",
        senderId: mockUsers[0].id,
        sender: mockUsers[0],
        content: "Let's discuss the project timeline tomorrow",
        attachments: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        readBy: [mockUsers[0].id],
        isDeleted: false,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      unreadCount: 3,
      isArchived: false,
    },
    {
      id: "conv-group-2",
      type: "group",
      name: "Content Creators",
      avatar: "/placeholder.svg?height=40&width=40",
      members: [
        {
          userId: currentUser.id,
          user: currentUser,
          role: "member",
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
        },
        {
          userId: mockUsers[2].id,
          user: mockUsers[2],
          role: "admin",
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
        {
          userId: mockUsers[3].id,
          user: mockUsers[3],
          role: "member",
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
      ],
      lastMessage: {
        id: "msg-group-2",
        conversationId: "conv-group-2",
        senderId: currentUser.id,
        sender: currentUser,
        content: "I just uploaded a new video, check it out!",
        attachments: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        readBy: [currentUser.id, mockUsers[3].id],
        isDeleted: false,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      unreadCount: 0,
      isArchived: false,
    },
  ]

  // Combine and sort by most recent activity
  return [...directConversations, ...groupConversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

// Generate mock messages for a conversation
export function generateMockMessages(conversationId: string, currentUser: User): Message[] {
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24)
  const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)

  // Find the conversation to get the other user
  const conversations = generateMockConversations(currentUser)
  const conversation = conversations.find((conv) => conv.id === conversationId)

  if (!conversation) {
    return []
  }

  let otherUser: User

  if (conversation.type === "direct") {
    otherUser = conversation.members.find((member) => member.userId !== currentUser.id)?.user || mockUsers[0]
  } else {
    // For group chats, use a mix of users
    otherUser = conversation.members.find((member) => member.userId !== currentUser.id)?.user || mockUsers[0]
  }

  // Generate messages from current day
  const todayMessages: Message[] = [
    {
      id: `msg-today-1-${conversationId}`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: "Good morning! How are you today?",
      attachments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      readBy: [otherUser.id, currentUser.id],
      isDeleted: false,
    },
    {
      id: `msg-today-2-${conversationId}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "Hi! I'm doing well, thanks. How about you?",
      attachments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(), // 2.5 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
      readBy: [currentUser.id, otherUser.id],
      isDeleted: false,
    },
    {
      id: `msg-today-3-${conversationId}`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: "I'm good! Did you get a chance to look at the latest update?",
      attachments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      readBy: [otherUser.id, currentUser.id],
      isDeleted: false,
    },
    {
      id: `msg-today-4-${conversationId}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "Yes, I did. It looks great! I especially like the new features you added.",
      attachments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(), // 1.5 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
      readBy: [currentUser.id, otherUser.id],
      isDeleted: false,
    },
    {
      id: `msg-today-5-${conversationId}`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: "Thanks! I worked really hard on it. Here's a preview of what's coming next:",
      attachments: [
        {
          id: "att-1",
          type: "image",
          url: "/placeholder.svg?height=200&width=300",
          name: "preview.jpg",
          size: 1024 * 1024, // 1MB
          mimeType: "image/jpeg",
          width: 1200,
          height: 800,
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      readBy: [otherUser.id, currentUser.id],
      isDeleted: false,
    },
    {
      id: `msg-today-6-${conversationId}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "Wow, that looks amazing! Can't wait to see it in action.",
      attachments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      readBy: [currentUser.id],
      isDeleted: false,
    },
  ]

  // Generate messages from yesterday
  const yesterdayMessages: Message[] = [
    {
      id: `msg-yesterday-1-${conversationId}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "Hey, do you have time to chat about the project tomorrow?",
      attachments: [],
      createdAt: new Date(yesterday.getTime() + 1000 * 60 * 60 * 14).toISOString(), // Yesterday, 2PM
      updatedAt: new Date(yesterday.getTime() + 1000 * 60 * 60 * 14).toISOString(),
      readBy: [currentUser.id, otherUser.id],
      isDeleted: false,
    },
    {
      id: `msg-yesterday-2-${conversationId}`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: "Sure, I'm free around 10AM. Does that work for you?",
      attachments: [],
      createdAt: new Date(yesterday.getTime() + 1000 * 60 * 60 * 15).toISOString(), // Yesterday, 3PM
      updatedAt: new Date(yesterday.getTime() + 1000 * 60 * 60 * 15).toISOString(),
      readBy: [otherUser.id, currentUser.id],
      isDeleted: false,
    },
    {
      id: `msg-yesterday-3-${conversationId}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "Perfect, 10AM works great. I'll prepare some notes.",
      attachments: [],
      createdAt: new Date(yesterday.getTime() + 1000 * 60 * 60 * 15.5).toISOString(), // Yesterday, 3:30PM
      updatedAt: new Date(yesterday.getTime() + 1000 * 60 * 60 * 15.5).toISOString(),
      readBy: [currentUser.id, otherUser.id],
      isDeleted: false,
    },
  ]

  // Generate messages from two days ago
  const twoDaysAgoMessages: Message[] = [
    {
      id: `msg-2daysago-1-${conversationId}`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: "I just sent you that document we discussed.",
      attachments: [
        {
          id: "att-2",
          type: "file",
          url: "#",
          name: "project_brief.pdf",
          size: 2.5 * 1024 * 1024, // 2.5MB
          mimeType: "application/pdf",
        },
      ],
      createdAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 60 * 10).toISOString(), // Two days ago, 10AM
      updatedAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 60 * 10).toISOString(),
      readBy: [otherUser.id, currentUser.id],
      isDeleted: false,
    },
    {
      id: `msg-2daysago-2-${conversationId}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "Got it, thanks! I'll review it and get back to you.",
      attachments: [],
      createdAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 60 * 11).toISOString(), // Two days ago, 11AM
      updatedAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 60 * 11).toISOString(),
      readBy: [currentUser.id, otherUser.id],
      isDeleted: true, // This message was deleted
    },
    {
      id: `msg-2daysago-3-${conversationId}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "Actually, I have a few questions about section 3. Can we discuss that tomorrow?",
      attachments: [],
      createdAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 60 * 14).toISOString(), // Two days ago, 2PM
      updatedAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 60 * 14).toISOString(),
      readBy: [currentUser.id, otherUser.id],
      isDeleted: false,
    },
    {
      id: `msg-2daysago-4-${conversationId}`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: "Of course! I'll be available all day.",
      attachments: [],
      createdAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 60 * 14.5).toISOString(), // Two days ago, 2:30PM
      updatedAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 60 * 14.5).toISOString(),
      readBy: [otherUser.id, currentUser.id],
      isDeleted: false,
    },
  ]

  // Combine all messages and sort by date (oldest first)
  return [...twoDaysAgoMessages, ...yesterdayMessages, ...todayMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

