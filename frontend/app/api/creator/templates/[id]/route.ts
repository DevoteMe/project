import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/creator/templates/[id] - Get a specific template
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const templateId = params.id

    const template = await prisma.contentTemplate.findUnique({
      where: {
        id: templateId,
        OR: [{ authorId: session.user.id }, { isPublic: true }],
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
  }
}

// PUT /api/creator/templates/[id] - Update a template
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const templateId = params.id
    const data = await req.json()

    // Check if the template exists and belongs to the user
    const existingTemplate = await prisma.contentTemplate.findUnique({
      where: {
        id: templateId,
        authorId: session.user.id,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found or you do not have permission to edit it" },
        { status: 404 },
      )
    }

    // Update the template
    const updatedTemplate = await prisma.contentTemplate.update({
      where: {
        id: templateId,
      },
      data: {
        name: data.name || existingTemplate.name,
        description: data.description || existingTemplate.description,
        content: data.content || existingTemplate.content,
        category: data.category || existingTemplate.category,
        isDefault: data.isDefault !== undefined ? data.isDefault : existingTemplate.isDefault,
        isPublic: data.isPublic !== undefined ? data.isPublic : existingTemplate.isPublic,
        tags: data.tags || existingTemplate.tags,
        updatedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

// DELETE /api/creator/templates/[id] - Delete a template
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const templateId = params.id

    // Check if the template exists and belongs to the user
    const existingTemplate = await prisma.contentTemplate.findUnique({
      where: {
        id: templateId,
        authorId: session.user.id,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found or you do not have permission to delete it" },
        { status: 404 },
      )
    }

    // Delete the template
    await prisma.contentTemplate.delete({
      where: {
        id: templateId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}

