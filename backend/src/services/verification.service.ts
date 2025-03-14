import { PrismaClient } from "@prisma/client"
import { randomBytes } from "crypto"
import { sendEmail } from "./email.service"

const prisma = new PrismaClient()

export class VerificationService {
  /**
   * Generate and send email verification token
   */
  async sendEmailVerification(userId: string): Promise<boolean> {
    try {
      // Generate a random token
      const token = randomBytes(32).toString("hex")
      const expiry = new Date()
      expiry.setHours(expiry.getHours() + 24) // Token valid for 24 hours

      // Save token to user record
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerificationToken: token,
          emailVerificationTokenExpiry: expiry,
        },
      })

      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

      await sendEmail({
        to: user.email,
        subject: "Verify your DevoteMe account",
        html: `
          <h1>Verify your email address</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account on DevoteMe, you can safely ignore this email.</p>
        `,
      })

      return true
    } catch (error) {
      console.error("Error sending verification email:", error)
      return false
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user with this token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationTokenExpiry: {
            gt: new Date(),
          },
        },
      })

      if (!user) {
        return {
          success: false,
          message: "Invalid or expired verification token",
        }
      }

      // Mark email as verified and clear token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationTokenExpiry: null,
        },
      })

      return {
        success: true,
        message: "Email verified successfully",
      }
    } catch (error) {
      console.error("Error verifying email:", error)
      return {
        success: false,
        message: "An error occurred during verification",
      }
    }
  }

  /**
   * Submit identity verification documents
   */
  async submitIdentityVerification(
    userId: string,
    documentType: string,
    documentUrl: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Create identity document record
      await prisma.identityDocument.create({
        data: {
          userId,
          type: documentType,
          documentUrl,
          status: "PENDING",
        },
      })

      // Update user verification status
      await prisma.user.update({
        where: { id: userId },
        data: {
          identityVerificationStatus: "PENDING",
        },
      })

      // Notify admins about new verification request
      // This would be implemented in a notification service

      return {
        success: true,
        message: "Identity verification submitted successfully",
      }
    } catch (error) {
      console.error("Error submitting identity verification:", error)
      return {
        success: false,
        message: "An error occurred while submitting verification",
      }
    }
  }

  /**
   * Admin: Review identity verification
   */
  async reviewIdentityVerification(
    documentId: string,
    approved: boolean,
    rejectionReason?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const document = await prisma.identityDocument.findUnique({
        where: { id: documentId },
        include: { user: true },
      })

      if (!document) {
        return {
          success: false,
          message: "Document not found",
        }
      }

      // Update document status
      await prisma.identityDocument.update({
        where: { id: documentId },
        data: {
          status: approved ? "APPROVED" : "REJECTED",
          rejectionReason: approved ? null : rejectionReason,
        },
      })

      // If approved, update user verification status
      if (approved) {
        await prisma.user.update({
          where: { id: document.userId },
          data: {
            identityVerified: true,
            identityVerificationStatus: "APPROVED",
          },
        })
      } else {
        await prisma.user.update({
          where: { id: document.userId },
          data: {
            identityVerificationStatus: "REJECTED",
          },
        })
      }

      // Notify user about verification result
      // This would be implemented in a notification service

      return {
        success: true,
        message: `Identity verification ${approved ? "approved" : "rejected"} successfully`,
      }
    } catch (error) {
      console.error("Error reviewing identity verification:", error)
      return {
        success: false,
        message: "An error occurred while reviewing verification",
      }
    }
  }
}

