"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Shield, Upload, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerificationPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [documentType, setDocumentType] = useState("ID_CARD")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const user = session?.user
  const verificationStatus = user?.identityVerificationStatus || "NONE"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a document to upload",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("document", file)
      formData.append("documentType", documentType)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verification/identity/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Your identity verification has been submitted successfully",
        })

        // Update session to reflect new verification status
        await update()

        // Redirect to settings page
        router.push("/settings")
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit verification",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting verification:", error)
      toast({
        title: "Error",
        description: "An error occurred while submitting your verification",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Identity Verification</h1>

      {verificationStatus === "APPROVED" ? (
        <Alert className="bg-green-50 border-green-200 mb-6">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Verified</AlertTitle>
          <AlertDescription>
            Your identity has been verified. You now have full access to creator features.
          </AlertDescription>
        </Alert>
      ) : verificationStatus === "PENDING" ? (
        <Alert className="bg-yellow-50 border-yellow-200 mb-6">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Verification Pending</AlertTitle>
          <AlertDescription>
            Your verification is being reviewed. This process typically takes 1-3 business days.
          </AlertDescription>
        </Alert>
      ) : verificationStatus === "REJECTED" ? (
        <Alert className="bg-red-50 border-red-200 mb-6">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle>Verification Rejected</AlertTitle>
          <AlertDescription>Your verification was rejected. Please submit a new document.</AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertTitle>Verification Required</AlertTitle>
          <AlertDescription>
            To become a creator and publish content, you need to verify your identity.
          </AlertDescription>
        </Alert>
      )}

      {verificationStatus !== "APPROVED" && verificationStatus !== "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Verification</CardTitle>
            <CardDescription>Please upload a government-issued ID to verify your identity</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <RadioGroup
                  id="documentType"
                  value={documentType}
                  onValueChange={setDocumentType}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ID_CARD" id="id_card" />
                    <Label htmlFor="id_card">ID Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PASSPORT" id="passport" />
                    <Label htmlFor="passport">Passport</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DRIVERS_LICENSE" id="drivers_license" />
                    <Label htmlFor="drivers_license">Driver's License</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mb-4">Supported formats: JPG, PNG, PDF (max 5MB)</p>
                  <Input
                    id="document"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("document")?.click()}>
                    Select File
                  </Button>
                  {file && <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || !file}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  )
}

