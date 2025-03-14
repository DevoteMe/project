import { NextResponse } from "next/server"
import type { NotificationPreferences } from "@/types/notification"

// Default notification preferences
const defaultPreferences: NotificationPreferences = {
  email: {
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    subscriptions: true,
    payments: true,
    system: true,
  },
  push: {
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    subscriptions: true,
    payments: true,
    system: true,
  },
  inApp: {
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    subscriptions: true,
    payments: true,
    system: true,
  },
}

export async function GET() {
  // In a real app, this would fetch preferences from a database
  return NextResponse.json(defaultPreferences)
}

export async function PUT(request: Request) {
  // In a real app, this would update preferences in a database
  const body = await request.json()

  // Merge with default preferences
  const updatedPreferences = {
    ...defaultPreferences,
    ...body,
  }

  return NextResponse.json(updatedPreferences)
}

