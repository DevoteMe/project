import { PrismaClient, UserType } from "@prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/app-config"
import { paymentService } from "./payment.service"

const prisma = new PrismaClient()

export class UserService {
  /**
   * Create a new user
   * @param userData User data
   */
  async createUser(userData: {
    username: string
    email: string
    password?: string
    userType: UserType
    country?: string
    googleId?: string
    facebookId?: string
  }): Promise<any> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username },
            userData.googleId ? { googleId: userData.googleId } : {},
            userData.facebookId ? { facebookId: userData.facebookId } : {},
          ],
        },
      })

      if (existingUser) {
        throw new Error("User already exists")
      }

      // Hash password if provided
      let passwordHash = null
      if (userData.password) {
        passwordHash = await bcrypt.hash(userData.password, 10)
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          passwordHash,
          userType: userData.userType,
          country: userData.country,
          googleId: userData.googleId,
          facebookId: userData.facebookId,
          nsfwSettings: {
            showNsfw: false,
            blurNsfw: true,
          },
          notificationSettings: {
            payment: true,
            systemInfo: true,
            newTip: true,
            newDevotee: true,
            creatorAnnouncements: true,
            creatorPromotion: true,
            creatorPosts: true,
            newLikes: true,
            newComments: true,
          },
        },
      })

      // Create Stripe customer
      const stripeCustomerId = await paymentService.createCustomer(user.id, user.email)

      // If user is a content creator, create content creator profile
      if (userData.userType === UserType.CONTENT_CREATOR) {
        await prisma.contentCreator.create({
          data: {
            userId: user.id,
          },
        })
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
      }
    } catch (error) {
      console.error("Error creating user:", error)
      throw new Error("Failed to create user")
    }
  }

  /**
   * Authenticate a user
   * @param email User email
   * @param password User password
   */
  async authenticateUser(email: string, password: string): Promise<any> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user || !user.passwordHash) {
        throw new Error("Invalid credentials")
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

      if (!isPasswordValid) {
        throw new Error("Invalid credentials")
      }

      // Update last seen
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastSeen: new Date(),
          isOnline: true,
        },
      })

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id)
      const refreshToken = this.generateRefreshToken(user.id)

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.userType,
        },
        accessToken,
        refreshToken,
      }
    } catch (error) {
      console.error("Error authenticating user:", error)
      throw new Error("Failed to authenticate user")
    }
  }

  /**
   * Generate access token
   * @param userId User ID
   */
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    })
  }

  /**
   * Generate refresh token
   * @param userId User ID
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.auth.jwtSecret, {
      expiresIn: config.auth.refreshTokenExpiresIn,
    })
  }

  /**
   * Verify token
   * @param token JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.auth.jwtSecret)
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  /**
   * Get user profile
   * @param userId User ID
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          contentCreator: true,
        },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Remove sensitive information
      const { passwordHash, ...userProfile } = user

      return userProfile
    } catch (error) {
      console.error("Error getting user profile:", error)
      throw new Error("Failed to get user profile")
    }
  }

  /**
   * Update user profile
   * @param userId User ID
   * @param profileData Profile data
   */
  async updateUserProfile(
    userId: string,
    profileData: {
      username?: string
      profileText?: string
      profilePicture?: string
      country?: string
      nsfwSettings?: any
      notificationSettings?: any
    },
  ): Promise<any> {
    try {
      // Check if username is taken
      if (profileData.username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username: profileData.username,
            id: { not: userId },
          },
        })

        if (existingUser) {
          throw new Error("Username already taken")
        }
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          username: profileData.username,
          profileText: profileData.profileText,
          profilePicture: profileData.profilePicture,
          country: profileData.country,
          nsfwSettings: profileData.nsfwSettings,
          notificationSettings: profileData.notificationSettings,
        },
      })

      // Remove sensitive information
      const { passwordHash, ...userProfile } = user

      return userProfile
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw new Error("Failed to update user profile")
    }
  }

  /**
   * Set user as content creator
   * @param userId User ID
   * @param referralCode Optional referral code
   */
  async setUserAsContentCreator(userId: string, referralCode?: string): Promise<any> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Check if user is already a content creator
      const existingCreator = await prisma.contentCreator.findUnique({
        where: { userId },
      })

      if (existingCreator) {
        throw new Error("User is already a content creator")
      }

      // Update user type
      await prisma.user.update({
        where: { id: userId },
        data: {
          userType: UserType.CONTENT_CREATOR,
        },
      })

      // Handle referral if provided
      let referrerId = null
      let referralStartDate = null
      let referralEndDate = null

      if (referralCode) {
        // Find referrer
        const referrer = await prisma.contentCreator.findFirst({
          where: {
            id: referralCode,
          },
        })

        if (referrer) {
          referrerId = referrer.id
          referralStartDate = new Date()
          // Set end date to 1 year from now
          referralEndDate = new Date()
          referralEndDate.setFullYear(referralEndDate.getFullYear() + 1)
        }
      }

      // Create content creator profile
      const contentCreator = await prisma.contentCreator.create({
        data: {
          userId,
          referrerId,
          referralStartDate,
          referralEndDate,
        },
      })

      return {
        id: contentCreator.id,
        userId,
        referrerId,
        referralStartDate,
        referralEndDate,
      }
    } catch (error) {
      console.error("Error setting user as content creator:", error)
      throw new Error("Failed to set user as content creator")
    }
  }

  /**
   * Set devotional price for content creator
   * @param userId User ID
   * @param price Devotional price
   */
  async setDevotionalPrice(userId: string, price: number): Promise<any> {
    try {
      // Check if user is a content creator
      const contentCreator = await prisma.contentCreator.findFirst({
        where: { userId },
      })

      if (!contentCreator) {
        throw new Error("User is not a content creator")
      }

      // Update devotional price
      const updatedCreator = await prisma.contentCreator.update({
        where: { userId },
        data: {
          devotionalPrice: price,
        },
      })

      return {
        id: updatedCreator.id,
        userId,
        devotionalPrice: updatedCreator.devotionalPrice,
      }
    } catch (error) {
      console.error("Error setting devotional price:", error)
      throw new Error("Failed to set devotional price")
    }
  }

  /**
   * Get user by username
   * @param username Username
   */
  async getUserByUsername(username: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          contentCreator: true,
        },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Remove sensitive information
      const { passwordHash, ...userProfile } = user

      return userProfile
    } catch (error) {
      console.error("Error getting user by username:", error)
      throw new Error("Failed to get user by username")
    }
  }

  /**
   * Get user's referral link
   * @param userId User ID
   */
  async getReferralLink(userId: string): Promise<string> {
    try {
      // Check if user is a content creator
      const contentCreator = await prisma.contentCreator.findFirst({
        where: { userId },
      })

      if (!contentCreator) {
        throw new Error("User is not a content creator")
      }

      // Generate referral link
      const baseUrl = process.env.FRONTEND_URL || "https://devoteme.com"
      return `${baseUrl}/register?ref=${contentCreator.id}`
    } catch (error) {
      console.error("Error getting referral link:", error)
      throw new Error("Failed to get referral link")
    }
  }
}

export const userService = new UserService()

