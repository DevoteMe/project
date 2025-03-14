"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BlockButtonProps {
  userId: string
  username: string
  onBlockStatusChange?: (isBlocked: boolean) => void
}

export function BlockButton({ userId, username, onBlockStatusChange }: BlockButtonProps) {
  const { data: session } = useSession()
  const [isBlocked, setIsBlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    checkBlockStatus()
  }, [userId])

  const checkBlockStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blocks/check/${userId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setIsBlocked(data.isBlocked)
        if (onBlockStatusChange) {
          onBlockStatusChange(data.isBlocked)
        }
      }
    } catch (error) {
      console.error("Error checking block status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlock = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blocks/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setIsBlocked(true)
        if (onBlockStatusChange) {
          onBlockStatusChange(true)
        }
        toast({
          title: "User Blocked",
          description: `You have blocked @${username}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to block user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error blocking user:", error)
      toast({
        title: "Error",
        description: "An error occurred while blocking user",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnblock = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blocks/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setIsBlocked(false)
        if (onBlockStatusChange) {
          onBlockStatusChange(false)
        }
        toast({
          title: "User Unblocked",
          description: `You have unblocked @${username}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to unblock user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
      toast({
        title: "Error",
        description: "An error occurred while unblocking user",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    )
  }

  if (isBlocked) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnblock}
        disabled={isProcessing}
        className="text-green-600 border-green-600 hover:bg-green-50"
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
        Unblock
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
          <ShieldAlert className="h-4 w-4 mr-2" />
          Block
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block @{username}?</AlertDialogTitle>
          <AlertDialogDescription>
            When you block someone:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>They won't be able to follow you or view your content</li>
              <li>They won't be able to message you</li>
              <li>You won't see their comments or posts</li>
              <li>Any existing follows between you will be removed</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlock} disabled={isProcessing} className="bg-red-600 hover:bg-red-700">
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Block User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

