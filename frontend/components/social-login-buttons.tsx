"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Github, Facebook, Mail } from "lucide-react"

interface SocialLoginButtonsProps {
  onSuccess?: () => void
  setIsLoading?: (isLoading: boolean) => void
}

export default function SocialLoginButtons({ onSuccess, setIsLoading }: SocialLoginButtonsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setIsLoading?.(true)

    try {
      // In a real implementation, this would redirect to Google OAuth
      // For now, we'll just simulate a successful login after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/feed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
      setIsLoading?.(false)
    }
  }

  const handleFacebookLogin = async () => {
    setIsFacebookLoading(true)
    setIsLoading?.(true)

    try {
      // In a real implementation, this would redirect to Facebook OAuth
      // For now, we'll just simulate a successful login after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/feed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login with Facebook. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFacebookLoading(false)
      setIsLoading?.(false)
    }
  }

  const handleGithubLogin = async () => {
    setIsGithubLoading(true)
    setIsLoading?.(true)

    try {
      // In a real implementation, this would redirect to GitHub OAuth
      // For now, we'll just simulate a successful login after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/feed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login with GitHub. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGithubLoading(false)
      setIsLoading?.(false)
    }
  }

  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        type="button"
        disabled={isGoogleLoading}
        onClick={handleGoogleLogin}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        {isGoogleLoading ? "Logging in with Google..." : "Continue with Google"}
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={isFacebookLoading}
        onClick={handleFacebookLogin}
        className="flex items-center gap-2"
      >
        <Facebook className="h-4 w-4" />
        {isFacebookLoading ? "Logging in with Facebook..." : "Continue with Facebook"}
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={isGithubLoading}
        onClick={handleGithubLogin}
        className="flex items-center gap-2"
      >
        <Github className="h-4 w-4" />
        {isGithubLoading ? "Logging in with GitHub..." : "Continue with GitHub"}
      </Button>
    </div>
  )
}

