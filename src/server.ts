import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import cookieParser from "cookie-parser"
import { config } from "./config/app-config"
import { errorHandler } from "./middleware/error.middleware"
import { logger } from "./utils/logger"
import { setupSwagger } from "./swagger"
import { rateLimiter } from "./middleware/rate-limit.middleware"
import { analyticsMiddleware } from "./middleware/analytics.middleware"

// Import routes
import userRoutes from "./routes/user-routes"
import contentRoutes from "./routes/content-routes"
import subscriptionRoutes from "./routes/subscription-routes"
import contentAccessRoutes from "./routes/content-access-routes"
import webhookRoutes from "./routes/webhook-routes"
import analyticsRoutes from "./routes/analytics-routes"

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(cookieParser())

// Analytics middleware
app.use(analyticsMiddleware())

// Global rate limiter
app.use(rateLimiter("standard"))

// Parse JSON bodies for API requests
app.use(express.json())

// Special handling for webhook routes - raw body for signature verification
app.use("/api/webhooks", express.raw({ type: "application/json" }), (req, res, next) => {
  if (req.body.length) {
    req.body = JSON.parse(req.body.toString())
  }
  next()
})

// API routes with specific rate limiters
const apiPrefix = config.server.apiPrefix
app.use(`${apiPrefix}/users`, rateLimiter("auth"), userRoutes)
app.use(`${apiPrefix}/content`, rateLimiter("contentCreation"), contentRoutes)
app.use(`${apiPrefix}/subscriptions`, subscriptionRoutes)
app.use(`${apiPrefix}/gifts`, subscriptionRoutes)
app.use(`${apiPrefix}/content-access`, contentAccessRoutes)
app.use(`${apiPrefix}/webhooks`, rateLimiter("webhook"), webhookRoutes)
app.use(`${apiPrefix}/analytics`, analyticsRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Setup Swagger documentation
setupSwagger(app)

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = config.server.port
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export default app

