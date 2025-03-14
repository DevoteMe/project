"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GiftStore } from "@/components/gifts/gift-store"
import { Gift } from "lucide-react"

interface GiftButtonProps {
  creatorId: string
  contentId?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function GiftButton({ creatorId, contentId, variant = "outline", size = "default" }: GiftButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setIsDialogOpen(true)} aria-label="Send a gift">
        <Gift className="h-4 w-4 mr-2" />
        Send Gift
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Send a Gift</DialogTitle>
          </DialogHeader>
          <GiftStore creatorId={creatorId} contentId={contentId} onClose={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

