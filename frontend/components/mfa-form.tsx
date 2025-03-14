"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield } from "lucide-react"

interface MfaFormProps {
  userId: string
  onSuccess: (token: string, user: any) => void
}

export function MfaForm({ userId, onSuccess }: MfaFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [activeTab, setActiveTab] = useState("authenticator")

  const handleSubmit = async (isBackupCode = false) => {
    try {
      setLoading(true)

      const response = await axios.post("/api/v1/auth/mfa-login", {
        userId,
        token: isBackupCode ? backupCode : token,
        isBackupCode,
      })

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token)

        // Call onSuccess callback
        onSuccess(response.data.token, response.data.user)

        toast({
          title: "Success",
          description: "Authentication successful",
        })
      }
    } catch (error) {
      console.error("Error during MFA login:", error)
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>Enter the verification code from your authenticator app or use a backup code.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="authenticator">Authenticator</TabsTrigger>
            <TabsTrigger value="backup">Backup Code</TabsTrigger>
          </TabsList>

          <TabsContent value="authenticator" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium">
                6-digit verification code
              </label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="backup-code" className="text-sm font-medium">
                Backup code
              </label>
              <Input
                id="backup-code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder="XXXX-XXXX"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => handleSubmit(activeTab === "backup")}
          disabled={loading || (activeTab === "authenticator" ? token.length !== 6 : !backupCode)}
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </CardFooter>
    </Card>
  )
}

