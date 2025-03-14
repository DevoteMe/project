import { NextResponse } from "next/server"
import type { AudienceData } from "@/services/analytics-service"

export async function GET() {
  // Generate mock audience data
  const data: AudienceData = {
    totalFollowers: Math.floor(Math.random() * 10000) + 1000,
    newFollowers: Math.floor(Math.random() * 500) + 50,
    demographics: {
      ageGroups: [
        { label: "18-24", value: Math.floor(Math.random() * 30) + 10 },
        { label: "25-34", value: Math.floor(Math.random() * 30) + 20 },
        { label: "35-44", value: Math.floor(Math.random() * 20) + 10 },
        { label: "45-54", value: Math.floor(Math.random() * 15) + 5 },
        { label: "55+", value: Math.floor(Math.random() * 10) + 5 },
      ],
      genders: [
        { label: "Male", value: Math.floor(Math.random() * 60) + 40 },
        { label: "Female", value: Math.floor(Math.random() * 60) + 40 },
        { label: "Other", value: Math.floor(Math.random() * 10) + 1 },
      ],
      locations: [
        { country: "United States", count: Math.floor(Math.random() * 5000) + 1000 },
        { country: "United Kingdom", count: Math.floor(Math.random() * 2000) + 500 },
        { country: "Canada", count: Math.floor(Math.random() * 1000) + 300 },
        { country: "Australia", count: Math.floor(Math.random() * 800) + 200 },
        { country: "Germany", count: Math.floor(Math.random() * 600) + 100 },
        { country: "France", count: Math.floor(Math.random() * 500) + 100 },
        { country: "Other", count: Math.floor(Math.random() * 2000) + 500 },
      ],
    },
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(data)
}

