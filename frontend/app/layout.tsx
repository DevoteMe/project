import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AppProvider } from "@/providers/app-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevoteMe - Social Media Platform",
  description: "Connect with creators and share your devotion",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}

