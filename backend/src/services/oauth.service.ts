import { PrismaClient, type OAuthClient } from "@prisma/client"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

export class OAuthService {
  /**
   * Register a new OAuth client
   */
  async registerClient(
    userId: string,
    name: string,
    redirectUris: string[],
    grants: string[] = ["authorization_code", "refresh_token"],
    scopes: string[] = ["profile"],
  ): Promise<OAuthClient> {
    try {
      // Generate client ID and secret
      const clientId = randomBytes(16).toString("hex")
      const clientSecret = randomBytes(32).toString("hex")

      // Create client
      const client = await prisma.oAuthClient.create({
        data: {
          name,
          clientId,
          clientSecret,
          redirectUris,
          grants,
          scopes,
          userId,
        },
      })

      return client
    } catch (error) {
      console.error("Error registering OAuth client:", error)
      throw error
    }
  }

  /**
   * Get client by client ID
   */
  async getClientById(clientId: string): Promise<OAuthClient | null> {
    try {
      return await prisma.oAuthClient.findFirst({
        where: { clientId },
      })
    } catch (error) {
      console.error("Error getting OAuth client:", error)
      throw error
    }
  }

  /**
   * Validate client credentials
   */
  async validateClient(clientId: string, clientSecret: string, grantType: string): Promise<boolean> {
    try {
      const client = await this.getClientById(clientId)

      if (!client) {
        return false
      }

      // Check if client secret matches
      if (client.clientSecret !== clientSecret) {
        return false
      }

      // Check if grant type is allowed
      if (!client.grants.includes(grantType)) {
        return false
      }

      return true
    } catch (error) {
      console.error("Error validating client:", error)
      return false
    }
  }

  /**
   * Generate authorization code
   */
  async generateAuthorizationCode(
    clientId: string,
    userId: string,
    redirectUri: string,
    scope?: string,
  ): Promise<string> {
    try {
      // Validate client and redirect URI
      const client = await this.getClientById(clientId)

      if (!client) {
        throw new Error("Invalid client")
      }

      if (!client.redirectUris.includes(redirectUri)) {
        throw new Error("Invalid redirect URI")
      }

      // Generate code
      const code = randomBytes(32).toString("hex")

      // Set expiration (10 minutes)
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)

      // Save code
      await prisma.oAuthAuthorizationCode.create({
        data: {
          code,
          expiresAt,
          redirectUri,
          scope,
          clientId: client.id,
          userId,
        },
      })

      return code
    } catch (error) {
      console.error("Error generating authorization code:", error)
      throw error
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      // Validate client
      const client = await prisma.oAuthClient.findFirst({
        where: { clientId },
      })

      if (!client || client.clientSecret !== clientSecret) {
        throw new Error("Invalid client")
      }

      // Find authorization code
      const authCode = await prisma.oAuthAuthorizationCode.findFirst({
        where: {
          code,
          redirectUri,
        },
      })

      if (!authCode) {
        throw new Error("Invalid authorization code")
      }

      // Check if code is expired
      if (authCode.expiresAt < new Date()) {
        throw new Error("Authorization code expired")
      }

      // Generate tokens
      const accessToken = randomBytes(32).toString("hex")
      const refreshToken = randomBytes(32).toString("hex")

      // Set expiration times
      const accessTokenExpiresAt = new Date()
      accessTokenExpiresAt.setHours(accessTokenExpiresAt.getHours() + 1) // 1 hour

      const refreshTokenExpiresAt = new Date()
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30) // 30 days

      // Save tokens
      await prisma.oAuthToken.create({
        data: {
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          scope: authCode.scope,
          clientId: client.id,
          userId: authCode.userId,
        },
      })

      // Delete used authorization code
      await prisma.oAuthAuthorizationCode.delete({
        where: { id: authCode.id },
      })

      return {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour in seconds
      }
    } catch (error) {
      console.error("Error exchanging code for tokens:", error)
      throw error
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Validate client
      const client = await prisma.oAuthClient.findFirst({
        where: { clientId },
      })

      if (!client || client.clientSecret !== clientSecret) {
        throw new Error("Invalid client")
      }

      // Find refresh token
      const token = await prisma.oAuthToken.findFirst({
        where: {
          refreshToken,
          clientId: client.id,
        },
      })

      if (!token) {
        throw new Error("Invalid refresh token")
      }

      // Check if refresh token is expired
      if (token.refreshTokenExpiresAt && token.refreshTokenExpiresAt < new Date()) {
        throw new Error("Refresh token expired")
      }

      // Generate new access token
      const accessToken = randomBytes(32).toString("hex")

      // Set expiration time
      const accessTokenExpiresAt = new Date()
      accessTokenExpiresAt.setHours(accessTokenExpiresAt.getHours() + 1) // 1 hour

      // Update token
      await prisma.oAuthToken.update({
        where: { id: token.id },
        data: {
          accessToken,
          accessTokenExpiresAt,
        },
      })

      return {
        accessToken,
        expiresIn: 3600, // 1 hour in seconds
      }
    } catch (error) {
      console.error("Error refreshing access token:", error)
      throw error
    }
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<{ valid: boolean; userId?: string; scope?: string }> {
    try {
      // Find token
      const token = await prisma.oAuthToken.findFirst({
        where: { accessToken },
      })

      if (!token) {
        return { valid: false }
      }

      // Check if token is expired
      if (token.accessTokenExpiresAt < new Date()) {
        return { valid: false }
      }

      return {
        valid: true,
        userId: token.userId,
        scope: token.scope,
      }
    } catch (error) {
      console.error("Error validating access token:", error)
      return { valid: false }
    }
  }

  /**
   * Revoke token
   */
  async revokeToken(token: string, clientId: string, clientSecret: string): Promise<boolean> {
    try {
      // Validate client
      const client = await prisma.oAuthClient.findFirst({
        where: { clientId },
      })

      if (!client || client.clientSecret !== clientSecret) {
        return false
      }

      // Find and delete token (could be access or refresh token)
      const deletedAccessToken = await prisma.oAuthToken.deleteMany({
        where: {
          accessToken: token,
          clientId: client.id,
        },
      })

      const deletedRefreshToken = await prisma.oAuthToken.deleteMany({
        where: {
          refreshToken: token,
          clientId: client.id,
        },
      })

      return deletedAccessToken.count > 0 || deletedRefreshToken.count > 0
    } catch (error) {
      console.error("Error revoking token:", error)
      return false
    }
  }

  /**
   * Get user's OAuth clients
   */
  async getUserClients(userId: string): Promise<OAuthClient[]> {
    try {
      return await prisma.oAuthClient.findMany({
        where: { userId },
      })
    } catch (error) {
      console.error("Error getting user clients:", error)
      throw error
    }
  }

  /**
   * Delete OAuth client
   */
  async deleteClient(clientId: string, userId: string): Promise<boolean> {
    try {
      const client = await prisma.oAuthClient.findFirst({
        where: {
          clientId,
          userId,
        },
      })

      if (!client) {
        return false
      }

      await prisma.oAuthClient.delete({
        where: { id: client.id },
      })

      return true
    } catch (error) {
      console.error("Error deleting OAuth client:", error)
      return false
    }
  }
}

