import { PrismaClient } from "@prisma/client"
import * as speakeasy from "speakeasy"
import * as QRCode from "qrcode"
import { randomBytes, createHash } from "crypto"

const prisma = new PrismaClient()

export class MfaService {
  /**
   * Generate a new MFA secret for a user
   */
  async generateMfaSecret(userId: string): Promise<{ secret: string; otpAuthUrl: string; qrCodeUrl: string }> {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Generate a new secret
      const secret = speakeasy.generateSecret({
        length: 20,
        name: `DevoteMe:${user.email}`,
      })

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "")

      return {
        secret: secret.base32,
        otpAuthUrl: secret.otpauth_url || "",
        qrCodeUrl,
      }
    } catch (error) {
      console.error("Error generating MFA secret:", error)
      throw error
    }
  }

  /**
   * Verify a TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 1, // Allow 1 step before and after for time drift
      })
    } catch (error) {
      console.error("Error verifying token:", error)
      return false
    }
  }

  /**
   * Enable MFA for a user
   */
  async enableMfa(
    userId: string,
    secret: string,
    token: string,
  ): Promise<{ success: boolean; backupCodes?: string[] }> {
    try {
      // Verify the token first
      const isValid = this.verifyToken(secret, token)

      if (!isValid) {
        return { success: false }
      }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes()

      // Hash the backup codes for storage
      const hashedBackupCodes = backupCodes.map((code) => createHash("sha256").update(code).digest("hex"))

      // Update user with MFA enabled
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: true,
          mfaSecret: secret,
          backupCodes: hashedBackupCodes,
        },
      })

      // Log activity
      await prisma.userActivity.create({
        data: {
          userId,
          type: "MFA_ENABLED",
          metadata: { timestamp: new Date().toISOString() },
        },
      })

      return {
        success: true,
        backupCodes,
      }
    } catch (error) {
      console.error("Error enabling MFA:", error)
      return { success: false }
    }
  }

  /**
   * Disable MFA for a user
   */
  async disableMfa(userId: string, token: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.mfaEnabled || !user.mfaSecret) {
        return false
      }

      // Verify the token
      const isValid = this.verifyToken(user.mfaSecret, token)

      if (!isValid) {
        return false
      }

      // Update user with MFA disabled
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          backupCodes: [],
        },
      })

      // Log activity
      await prisma.userActivity.create({
        data: {
          userId,
          type: "MFA_DISABLED",
          metadata: { timestamp: new Date().toISOString() },
        },
      })

      return true
    } catch (error) {
      console.error("Error disabling MFA:", error)
      return false
    }
  }

  /**
   * Verify a backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.mfaEnabled || user.backupCodes.length === 0) {
        return false
      }

      // Hash the provided code
      const hashedCode = createHash("sha256").update(code).digest("hex")

      // Check if the code exists in the user's backup codes
      const codeIndex = user.backupCodes.indexOf(hashedCode)

      if (codeIndex === -1) {
        return false
      }

      // Remove the used backup code
      const updatedBackupCodes = [...user.backupCodes]
      updatedBackupCodes.splice(codeIndex, 1)

      // Update user with the new backup codes list
      await prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: updatedBackupCodes,
        },
      })

      // Log activity
      await prisma.userActivity.create({
        data: {
          userId,
          type: "BACKUP_CODE_USED",
          metadata: { timestamp: new Date().toISOString() },
        },
      })

      return true
    } catch (error) {
      console.error("Error verifying backup code:", error)
      return false
    }
  }

  /**
   * Generate new backup codes
   */
  private generateBackupCodes(count = 10, length = 8): string[] {
    const codes: string[] = []

    for (let i = 0; i < count; i++) {
      const code =
        randomBytes(length / 2)
          .toString("hex")
          .toUpperCase()
          .match(/.{1,4}/g)
          ?.join("-") || ""

      codes.push(code)
    }

    return codes
  }
}

