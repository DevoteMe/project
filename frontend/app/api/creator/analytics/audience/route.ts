import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/creator/analytics/audience - Get audience demographics
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get followers
    const followers = await prisma.follow.findMany({
      where: {
        followingId: session.user.id,
      },
      include: {
        follower: {
          select: {
            id: true,
            age: true,
            gender: true,
            country: true,
            deviceType: true,
          },
        },
      },
    })

    // Process age groups
    const ageGroups = [
      { label: "18-24", value: 0 },
      { label: "25-34", value: 0 },
      { label: "35-44", value: 0 },
      { label: "45-54", value: 0 },
      { label: "55+", value: 0 },
      { label: "Unknown", value: 0 },
    ]

    // Process genders
    const genders = [
      { label: "Male", value: 0 },
      { label: "Female", value: 0 },
      { label: "Non-binary", value: 0 },
      { label: "Other", value: 0 },
      { label: "Prefer not to say", value: 0 },
    ]

    // Process locations
    const locationMap = new Map<string, number>()

    // Process devices
    const deviceMap = new Map<string, number>()

    // Count demographics
    followers.forEach((follow) => {
      const { follower } = follow

      // Age groups
      if (follower.age) {
        if (follower.age < 25) ageGroups[0].value++
        else if (follower.age < 35) ageGroups[1].value++
        else if (follower.age < 45) ageGroups[2].value++
        else if (follower.age < 55) ageGroups[3].value++
        else ageGroups[4].value++
      } else {
        ageGroups[5].value++
      }

      // Genders
      if (follower.gender) {
        if (follower.gender === "male") genders[0].value++
        else if (follower.gender === "female") genders[1].value++
        else if (follower.gender === "non-binary") genders[2].value++
        else if (follower.gender === "other") genders[3].value++
        else genders[4].value++
      } else {
        genders[4].value++
      }

      // Locations
      if (follower.country) {
        locationMap.set(follower.country, (locationMap.get(follower.country) || 0) + 1)
      }

      // Devices
      if (follower.deviceType) {
        deviceMap.set(follower.deviceType, (deviceMap.get(follower.deviceType) || 0) + 1)
      }
    })

    // Convert maps to arrays
    const locations = Array.from(locationMap.entries())
      .map(([country, value]) => ({ country, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    const devices = Array.from(deviceMap.entries())
      .map(([type, value]) => ({ type, value }))
      .sort((a, b) => b.value - a.value)

    return NextResponse.json({
      demographics: {
        ageGroups,
        genders,
        locations,
        devices,
      },
    })
  } catch (error) {
    console.error("Error fetching audience demographics:", error)
    return NextResponse.json({ error: "Failed to fetch audience demographics" }, { status: 500 })
  }
}

