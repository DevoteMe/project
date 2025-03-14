import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"

// GET /api/creator/drafts - Get all drafts for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const drafts = await prisma.draft.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        lastSaved: "desc",
      },
      include: {
        versions: {
          orderBy: {
            version: "desc",
          },
          take: 1,
        },
      },
    })

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error("Error fetching drafts:", error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}

// POST /api/creator/drafts - Create a new draft
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()

    // Create a new draft
    const draft = await prisma.draft.create({
      data: {
        id: uuidv4(),
        title: data.title || "Untitled Draft",
        content: data.content || "",
        lastSaved: new Date().toISOString(),
        categoryId: data.categoryId || "",
        tags: data.tags || [],
        version: 1,
        author: {
          connect: {
            id: session.user.id,
          },
        },
        // Create initial version
        versions: {
          create: {
            id: uuidv4(),
            content: data.content || "",
            savedAt: new Date().toISOString(),
            version: 1,
          },
        },
      },
      include: {
        versions: true,
      },
    })

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("Error creating draft:", error)
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 })
  }
}

