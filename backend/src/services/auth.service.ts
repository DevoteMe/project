// Add to the existing auth service
import { prisma } from "../utils/prisma"
import bcrypt from "bcryptjs"

/**
 * Login with MFA
 */ \
async loginWithMfa(email: string, password: string, req: Request): Promise<
{
  requiresMfa: boolean
  userId?: string;
  token?: string;
  user?: any;
}
>
{
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        mfaEnabled: true,
        isEmailVerified: true,
        role: true,
        username: true,
        profilePicture: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new Error("Invalid credentials")
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      return {
        requiresMfa: true,
        userId: user.id
      };
    }

    // If MFA is not enabled, proceed with normal login
    const token = this.generateToken(user)

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        type: "LOGIN",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        metadata: { timestamp: new Date().toISOString() },
      },
    })

    return {
      requiresMfa: false,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified
      }
    };
  } catch (error) {
    console.error("Error during login:", error)
    throw error
  }
}

/**
 * Complete MFA login
 */
async
completeMfaLogin(userId: string, req: Request)
: Promise<
{
  token: string
  user: any
}
>
{
  try {
    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        username: true,
        profilePicture: true,
        isEmailVerified: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Generate token
    const token = this.generateToken(user)

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        type: "MFA_LOGIN",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        metadata: { timestamp: new Date().toISOString() },
      },
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified
      }
    };
  } catch (error) {
    console.error("Error completing MFA login:", error)
    throw error
  }
}

