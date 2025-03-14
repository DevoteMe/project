import { NextResponse } from "next/server"
import { faker } from "@faker-js/faker"
import type { Notification, NotificationType } from "@/types/notification"

// Generate mock notifications
const generateMockNotifications = (count: number): Notification[] => {
  const types: NotificationType[] = ["LIKE", "COMMENT", "FOLLOW", "MENTION", "SUBSCRIPTION", "PAYMENT", "SYSTEM"]

  return Array.from({ length: count }).map((_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const isRead = Math.random() > 0.3

    let title = ""
    let body = ""
    let actionText = ""
    let link = ""

    switch (type) {
      case "LIKE":
        title = `${faker.person.fullName()} liked your post`
        body = `They liked your post "${faker.lorem.sentence(4)}"`
        break
      case "COMMENT":
        title = `${faker.person.fullName()} commented on your post`
        body = faker.lorem.sentence(8)
        actionText = "Reply"
        break
      case "FOLLOW":
        title = `${faker.person.fullName()} started following you`
        body = "You have a new follower!"
        actionText = "View Profile"
        break
      case "MENTION":
        title = `${faker.person.fullName()} mentioned you in a comment`
        body = `"${faker.lorem.sentence(6)}"`
        actionText = "View Comment"
        break
      case "SUBSCRIPTION":
        title = `${faker.person.fullName()} subscribed to your content`
        body = "You have a new subscriber!"
        break
      case "PAYMENT":
        title = "Payment received"
        body = `You received $${(Math.random() * 20 + 5).toFixed(2)} from ${faker.person.fullName()}`
        actionText = "View Details"
        break
      case "SYSTEM":
        title = "DevoteMe Update"
        body = "We've added new features to help you grow your audience!"
        actionText = "Learn More"
        link = "/blog/new-features"
        break
    }

    return {
      id: faker.string.uuid(),
      type,
      read: isRead,
      createdAt: faker.date.recent({ days: 14 }).toISOString(),
      data: {
        title,
        body,
        actionText,
        link,
        senderId: faker.string.uuid(),
        senderName: faker.person.fullName(),
        senderImage: faker.image.avatar(),
        contentId: faker.string.uuid(),
        contentType: "post",
      },
    }
  })
}

export async function GET() {
  // In a real app, this would fetch notifications from a database
  const notifications = generateMockNotifications(15)

  // Sort by date (newest first)
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json(notifications)
}

