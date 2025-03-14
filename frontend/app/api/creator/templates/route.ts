import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"

// GET /api/creator/templates - Get all templates for current user and public templates
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's templates and public templates
    const templates = await prisma.contentTemplate.findMany({
      where: {
        OR: [{ authorId: session.user.id }, { isPublic: true }],
      },
      orderBy: [{ isDefault: "desc" }, { usageCount: "desc" }],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

// POST /api/creator/templates - Create a new template
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()

    // Create the template
    const template = await prisma.contentTemplate.create({
      data: {
        id: uuidv4(),
        name: data.name,
        description: data.description || "",
        content: data.content,
        category: data.category,
        isDefault: data.isDefault || false,
        isPublic: data.isPublic || false,
        usageCount: 0,
        tags: data.tags || [],
        author: {
          connect: {
            id: session.user.id,
          },
        },
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}

