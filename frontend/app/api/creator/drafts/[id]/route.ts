import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"

// GET /api/creator/drafts/[id] - Get a specific draft
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const draftId = params.id

    // Get the draft with its versions
    const draft = await prisma.draft.findUnique({
      where: {
        id: draftId,
        authorId: session.user.id,
      },
      include: {
        versions: {
          orderBy: {
            version: "desc",
          },
        },
      },
    })

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("Error fetching draft:", error)
    return NextResponse.json({ error: "Failed to fetch draft" }, { status: 500 })
  }
}

// PUT /api/creator/drafts/[id] - Update a draft
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const draftId = params.id
    const data = await req.json()

    // First, check if the draft exists and belongs to the user
    const existingDraft = await prisma.draft.findUnique({
      where: {
        id: draftId,
        authorId: session.user.id,
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

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    // Check if content has changed to determine if we need a new version
    const latestVersion = existingDraft.versions[0]
    const contentChanged = latestVersion?.content !== data.content
    const newVersionNumber = contentChanged ? existingDraft.version + 1 : existingDraft.version

    // Update the draft
    const updatedDraft = await prisma.draft.update({
      where: {
        id: draftId,
      },
      data: {
        title: data.title || existingDraft.title,
        content: data.content || existingDraft.content,
        lastSaved: new Date().toISOString(),
        categoryId: data.categoryId || existingDraft.categoryId,
        tags: data.tags || existingDraft.tags,
        version: newVersionNumber,
        // Create a new version if content changed
        ...(contentChanged && {
          versions: {
            create: {
              id: uuidv4(),
              content: data.content,
              savedAt: new Date().toISOString(),
              version: newVersionNumber,
            },
          },
        }),
      },
      include: {
        versions: {
          orderBy: {
            version: "desc",
          },
        },
      },
    })

    return NextResponse.json({ draft: updatedDraft })
  } catch (error) {
    console.error("Error updating draft:", error)
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 })
  }
}

// DELETE /api/creator/drafts/[id] - Delete a draft
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const draftId = params.id

    // First, check if the draft exists and belongs to the user
    const existingDraft = await prisma.draft.findUnique({
      where: {
        id: draftId,
        authorId: session.user.id,
      },
    })

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    // Delete all versions first (due to foreign key constraints)
    await prisma.draftVersion.deleteMany({
      where: {
        draftId: draftId,
      },
    })

    // Then delete the draft
    await prisma.draft.delete({
      where: {
        id: draftId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting draft:", error)
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 })
  }
}

// POST /api/creator/drafts/[id]/convert - Convert draft to post
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const draftId = params.id
    const { action } = await req.json()

    if (action !== "convert") {
      return NextResponse.json({ error: "Invalid action specified" }, { status: 400 })
    }

    // Find the draft
    const draft = await prisma.draft.findUnique({
      where: {
        id: draftId,
        authorId: session.user.id,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    // Create a new post from the draft
    const post = await prisma.post.create({
      data: {
        title: draft.title,
        content: draft.content,
        published: true,
        categoryId: draft.categoryId,
        tags: draft.tags,
        author: {
          connect: {
            id: session.user.id,
          },
        },
      },
    })

    // Delete the draft and its versions after successful conversion
    await prisma.draftVersion.deleteMany({
      where: {
        draftId: draftId,
      },
    })

    await prisma.draft.delete({
      where: {
        id: draftId,
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error converting draft to post:", error)
    return NextResponse.json({ error: "Failed to convert draft to post" }, { status: 500 })
  }
}

