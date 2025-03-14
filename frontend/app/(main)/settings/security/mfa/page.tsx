"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, Check, Copy } from "lucide-react"

export default function MfaPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [secret, setSecret] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [token, setToken] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  useEffect(() => {
    // Check if MFA is enabled
    const checkMfaStatus = async () => {
      try {
        const response = await axios.get("/api/v1/user/profile")
        setMfaEnabled(response.data.user.mfaEnabled)
      } catch (error) {
        console.error("Error checking MFA status:", error)
      }
    }

    checkMfaStatus()
  }, [])

  const generateMfaSecret = async () => {
    try {
      setLoading(true)
      const response = await axios.post("/api/v1/mfa/generate")
      setSecret(response.data.data.secret)
      setQrCode(response.data.data.qrCodeUrl)
    } catch (error) {
      console.error("Error generating MFA secret:", error)
      toast({
        title: "Error",
        description: "Failed to generate MFA secret",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const enableMfa = async () => {
    try {
      setLoading(true)
      const response = await axios.post("/api/v1/mfa/enable", {
        secret,
        token,
      })

      setMfaEnabled(true)
      setBackupCodes(response.data.backupCodes)
      setShowBackupCodes(true)

      toast({
        title: "Success",
        description: "MFA enabled successfully",
      })
    } catch (error) {
      console.error("Error enabling MFA:", error)
      toast({
        title: "Error",
        description: "Failed to enable MFA. Please check your token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const disableMfa = async () => {
    try {
      setLoading(true)
      await axios.post("/api/v1/mfa/disable", {
        token,
      })

      setMfaEnabled(false)
      setSecret("")
      setQrCode("")
      setToken("")

      toast({
        title: "Success",
        description: "MFA disabled successfully",
      })
    } catch (error) {
      console.error("Error disabling MFA:", error)
      toast({
        title: "Error",
        description: "Failed to disable MFA. Please check your token.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    })
  }

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-6">Two-Factor Authentication</h1>

      {showBackupCodes ? (
        <Card>
          <CardHeader>
            <CardTitle>Save Your Backup Codes</CardTitle>
            <CardDescription>
              Store these backup codes in a safe place. You can use them to sign in if you lose access to your
              authenticator app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md mb-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                These codes will only be shown once. If you lose them, you'll need to generate new ones.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={copyBackupCodes}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Codes
            </Button>
            <Button onClick={() => setShowBackupCodes(false)}>I've Saved These Codes</Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue={mfaEnabled ? "manage" : "setup"}>
          <TabsList className="mb-4">
            <TabsTrigger value="setup" disabled={mfaEnabled}>
              Setup
            </TabsTrigger>
            <TabsTrigger value="manage" disabled={!mfaEnabled}>
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Set Up Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account by requiring a verification code in addition to your
                  password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!qrCode ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <Shield className="h-16 w-16 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Enhance Your Account Security</h3>
                    <p className="text-center text-muted-foreground mb-6">
                      Two-factor authentication adds an additional layer of security by requiring a code from your
                      mobile device.
                    </p>
                    <Button onClick={generateMfaSecret} disabled={loading}>
                      {loading ? "Loading..." : "Get Started"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="mb-4">
                        <img
                          src={qrCode || "/placeholder.svg"}
                          alt="QR Code"
                          className="border border-border rounded-md"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Scan this QR code with your authenticator app
                      </p>
                      <div className="flex items-center p-2 bg-muted rounded-md">
                        <span className="font-mono text-sm">{secret}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="token" className="text-sm font-medium">
                        Enter the 6-digit code from your authenticator app
                      </label>
                      <Input
                        id="token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              {qrCode && (
                <CardFooter>
                  <Button onClick={enableMfa} disabled={loading || token.length !== 6} className="w-full">
                    {loading ? "Verifying..." : "Enable Two-Factor Authentication"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Manage Two-Factor Authentication</CardTitle>
                <CardDescription>Your account is protected with two-factor authentication.</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Two-factor authentication is enabled</AlertTitle>
                  <AlertDescription>
                    Your account has an extra layer of security. When you sign in, you'll need to provide a code from
                    your authenticator app.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <label htmlFor="disable-token" className="text-sm font-medium">
                    Enter the 6-digit code to disable two-factor authentication
                  </label>
                  <Input
                    id="disable-token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/settings/security")}>
                  Back to Security
                </Button>
                <Button variant="destructive" onClick={disableMfa} disabled={loading || token.length !== 6}>
                  {loading ? "Disabling..." : "Disable Two-Factor Authentication"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

