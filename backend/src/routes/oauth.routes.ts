import { Router } from "express"
import { OAuthService } from "../services/oauth.service"
import { authenticateJWT } from "../middleware/auth.middleware"
import { UserService } from "../services/user.service"

const router = Router()
const oauthService = new OAuthService()
const userService = new UserService()

/**
 * Register a new OAuth client
 * @route POST /api/v1/oauth/clients
 * @access Private
 */
router.post("/clients", authenticateJWT, async (req, res) => {
  try {
    const { name, redirectUris, grants, scopes } = req.body
    const userId = req.user.id

    if (!name || !redirectUris || !Array.isArray(redirectUris) || redirectUris.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name and at least one redirect URI are required",
      })
    }

    const client = await oauthService.registerClient(userId, name, redirectUris, grants, scopes)

    res.status(201).json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        redirectUris: client.redirectUris,
        grants: client.grants,
        scopes: client.scopes,
        createdAt: client.createdAt,
      },
    })
  } catch (error) {
    console.error("Error registering OAuth client:", error)
    res.status(500).json({
      success: false,
      message: "Failed to register OAuth client",
    })
  }
})

/**
 * Get user's OAuth clients
 * @route GET /api/v1/oauth/clients
 * @access Private
 */
router.get("/clients", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const clients = await oauthService.getUserClients(userId)

    res.status(200).json({
      success: true,
      clients: clients.map((client) => ({
        id: client.id,
        name: client.name,
        clientId: client.clientId,
        redirectUris: client.redirectUris,
        grants: client.grants,
        scopes: client.scopes,
        createdAt: client.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error getting OAuth clients:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get OAuth clients",
    })
  }
})

/**
 * Delete OAuth client
 * @route DELETE /api/v1/oauth/clients/:clientId
 * @access Private
 */
router.delete("/clients/:clientId", authenticateJWT, async (req, res) => {
  try {
    const { clientId } = req.params
    const userId = req.user.id

    const result = await oauthService.deleteClient(clientId, userId)

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Client not found or you do not have permission to delete it",
      })
    }

    res.status(200).json({
      success: true,
      message: "OAuth client deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting OAuth client:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete OAuth client",
    })
  }
})

/**
 * Authorization endpoint
 * @route GET /api/v1/oauth/authorize
 * @access Private
 */
router.get("/authorize", authenticateJWT, async (req, res) => {
  try {
    const { client_id, redirect_uri, response_type, scope, state } = req.query

    if (!client_id || !redirect_uri || response_type !== "code") {
      return res.status(400).json({
        success: false,
        message: "Invalid request parameters",
      })
    }

    // Validate client and redirect URI
    const client = await oauthService.getClientById(client_id as string)

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Invalid client",
      })
    }

    if (!client.redirectUris.includes(redirect_uri as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid redirect URI",
      })
    }

    // Render authorization page
    // This would typically be a frontend page where the user can approve or deny the authorization
    // For this example, we'll just redirect to a frontend route that will handle the UI
    res.redirect(
      `/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope || ""}&state=${state || ""}`,
    )
  } catch (error) {
    console.error("Error in authorization endpoint:", error)
    res.status(500).json({
      success: false,
      message: "Authorization failed",
    })
  }
})

/**
 * Approve authorization
 * @route POST /api/v1/oauth/approve
 * @access Private
 */
router.post("/approve", authenticateJWT, async (req, res) => {
  try {
    const { client_id, redirect_uri, scope, state } = req.body
    const userId = req.user.id

    if (!client_id || !redirect_uri) {
      return res.status(400).json({
        success: false,
        message: "Client ID and redirect URI are required",
      })
    }

    // Generate authorization code
    const code = await oauthService.generateAuthorizationCode(client_id, userId, redirect_uri, scope)

    // Redirect to client with code
    const redirectUrl = new URL(redirect_uri)
    redirectUrl.searchParams.append("code", code)

    if (state) {
      redirectUrl.searchParams.append("state", state)
    }

    res.status(200).json({
      success: true,
      redirectUrl: redirectUrl.toString(),
    })
  } catch (error) {
    console.error("Error approving authorization:", error)
    res.status(500).json({
      success: false,
      message: "Failed to approve authorization",
    })
  }
})

/**
 * Token endpoint
 * @route POST /api/v1/oauth/token
 * @access Public
 */
router.post("/token", async (req, res) => {
  try {
    const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token } = req.body

    if (!client_id || !client_secret) {
      return res.status(400).json({
        success: false,
        message: "Client ID and client secret are required",
      })
    }

    // Validate client
    const isValidClient = await oauthService.validateClient(client_id, client_secret, grant_type)

    if (!isValidClient) {
      return res.status(401).json({
        success: false,
        message: "Invalid client credentials",
      })
    }

    if (grant_type === "authorization_code") {
      // Exchange authorization code for tokens
      if (!code || !redirect_uri) {
        return res.status(400).json({
          success: false,
          message: "Code and redirect URI are required",
        })
      }

      const tokens = await oauthService.exchangeCodeForTokens(code, client_id, client_secret, redirect_uri)

      res.status(200).json({
        access_token: tokens.accessToken,
        token_type: "Bearer",
        expires_in: tokens.expiresIn,
        refresh_token: tokens.refreshToken,
      })
    } else if (grant_type === "refresh_token") {
      // Refresh access token
      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        })
      }

      const tokens = await oauthService.refreshAccessToken(refresh_token, client_id, client_secret)

      res.status(200).json({
        access_token: tokens.accessToken,
        token_type: "Bearer",
        expires_in: tokens.expiresIn,
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Unsupported grant type",
      })
    }
  } catch (error) {
    console.error("Error in token endpoint:", error)
    res.status(500).json({
      success: false,
      message: "Token request failed",
    })
  }
})

/**
 * Revoke token
 * @route POST /api/v1/oauth/revoke
 * @access Public
 */
router.post("/revoke", async (req, res) => {
  try {
    const { token, client_id, client_secret } = req.body

    if (!token || !client_id || !client_secret) {
      return res.status(400).json({
        success: false,
        message: "Token, client ID, and client secret are required",
      })
    }

    const result = await oauthService.revokeToken(token, client_id, client_secret)

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Invalid token or client credentials",
      })
    }

    res.status(200).json({
      success: true,
      message: "Token revoked successfully",
    })
  } catch (error) {
    console.error("Error revoking token:", error)
    res.status(500).json({
      success: false,
      message: "Failed to revoke token",
    })
  }
})

/**
 * User info endpoint
 * @route GET /api/v1/oauth/userinfo
 * @access Private (OAuth)
 */
router.get("/userinfo", async (req, res) => {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      })
    }

    const accessToken = authHeader.split(" ")[1]

    // Validate access token
    const validation = await oauthService.validateAccessToken(accessToken)

    if (!validation.valid || !validation.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      })
    }

    // Get user info
    const user = await userService.getUserById(validation.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Return user info
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Error in userinfo endpoint:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get user info",
    })
  }
})

export default router

