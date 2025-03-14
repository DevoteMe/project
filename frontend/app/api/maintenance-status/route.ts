import { NextResponse } from "next/server"

export async function GET() {
  // In a real app, this would check a database or environment variable
  // For demo purposes, we're hardcoding the response
  const isInMaintenance = process.env.MAINTENANCE_MODE === "true"

  return NextResponse.json({
    maintenance: isInMaintenance,
    expectedDuration: isInMaintenance ? 300 : 0, // 5 minutes in seconds
    message: isInMaintenance
      ? "DevoteMe is currently under maintenance. Please check back soon."
      : "DevoteMe is operating normally.",
  })
}

