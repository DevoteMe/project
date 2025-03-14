"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [verificationState, setVerificationState] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    if (!token) {
      setVerificationState("error")
      setMessage("Invalid verification link. Please request a new verification email.")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verification/email/verify?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setVerificationState("success")
          setMessage(data.message || "Your email has been verified successfully!")
        } else {
          setVerificationState("error")
          setMessage(data.message || "Failed to verify your email. Please try again.")
        }
      } catch (error) {
        console.error("Error verifying email:", error)
        setVerificationState("error")
        setMessage("An error occurred while verifying your email. Please try again.")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verificationState === "loading" && "Verifying your email address"}
            {verificationState === "success" && "Email Verified Successfully"}
            {verificationState === "error" && "Verification Failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
          {verificationState === "loading" && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
          {verificationState === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
          {verificationState === "error" && <XCircle className="h-16 w-16 text-red-500" />}
          <p className="text-center text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          {verificationState !== "loading" && (
            <Button asChild>
              <Link href="/login">{verificationState === "success" ? "Continue to Login" : "Back to Login"}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

