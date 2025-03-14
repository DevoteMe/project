"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { CreatorToolsProvider } from "@/providers/creator-tools-provider"
import { Toaster } from "@/components/ui/toaster"

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CreatorToolsProvider>
        {children}
        <Toaster />
      </CreatorToolsProvider>
    </ThemeProvider>
  )
}

