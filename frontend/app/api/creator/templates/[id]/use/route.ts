import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"

// POST /api/creator/templates/[id]/use - Use a template to create a draft
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const templateId = params.id

    // Find the template
    const template = await prisma.contentTemplate.findUnique({
      where: {
        id: templateId,
        OR: [{ authorId: session.user.id }, { isPublic: true }],
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Create a draft from the template
    const draft = await prisma.draft.create({
      data: {
        id: uuidv4(),
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        content: template.content,
        lastSaved: new Date().toISOString(),
        categoryId: "",
        tags: template.tags,
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
            content: template.content,
            savedAt: new Date().toISOString(),
            version: 1,
          },
        },
      },
      include: {
        versions: true,
      },
    })

    // Increment the template usage count
    await prisma.contentTemplate.update({
      where: {
        id: templateId,
      },
      data: {
        usageCount: template.usageCount + 1,
      },
    })

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("Error using template:", error)
    return NextResponse.json({ error: "Failed to create draft from template" }, { status: 500 })
  }
}

