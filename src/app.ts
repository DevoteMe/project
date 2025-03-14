import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import { config } from "./config/app-config"
import userRoutes from "./routes/user.routes"
import postRoutes from "./routes/post.routes"
import subscriptionRoutes from "./routes/subscription.routes"
import notificationRoutes from "./routes/notification.routes"
import chatRoutes from "./routes/chat.routes"
import premiumSpotRoutes from "./routes/premium-spot.routes"
import adminRoutes from "./routes/admin.routes"
import webhookRoutes from "./routes/webhook.routes"
import analyticsRoutes from "./routes/analytics.routes"
import monitoringRoutes from "./routes/monitoring.routes"
import { errorHandler } from "./middleware/error.middleware"
import { requestLogger } from "./middleware/logger.middleware"
import { setupSwagger } from "./swagger"

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(requestLogger)

// API routes
const apiPrefix = config.server.apiPrefix
app.use(`${apiPrefix}/users`, userRoutes)
app.use(`${apiPrefix}/posts`, postRoutes)
app.use(`${apiPrefix}/subscriptions`, subscriptionRoutes)
app.use(`${apiPrefix}/notifications`, notificationRoutes)
app.use(`${apiPrefix}/chats`, chatRoutes)
app.use(`${apiPrefix}/premium-spots`, premiumSpotRoutes)
app.use(`${apiPrefix}/admin`, adminRoutes)
app.use(`${apiPrefix}/analytics`, analyticsRoutes)
app.use(`${apiPrefix}/monitoring`, monitoringRoutes)

// Webhook routes - these don't use the API prefix for simplicity with external services
app.use("/webhooks", webhookRoutes)

// Swagger documentation
setupSwagger(app)

// Error handling
app.use(errorHandler)

export default app

