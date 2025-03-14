/**
 * DevoteMe Application Configuration
 */

// Environment variables with defaults
export const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || "development",
    apiPrefix: "/api/v1",
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/devoteme",
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
    jwtExpiresIn: "7d",
    refreshTokenExpiresIn: "30d",
  },

  // Bunny CDN configuration
  bunnyCDN: {
    storageZone: process.env.BUNNY_STORAGE_ZONE || "devoteme",
    apiKey: process.env.BUNNY_API_KEY || "",
    region: process.env.BUNNY_REGION || "de",
    pullZone: process.env.BUNNY_PULL_ZONE || "",
  },

  // Firebase configuration
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.FIREBASE_APP_ID || "",
  },

  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    currency: "usd",
    platformFeePercent: 15, // DevoteMe takes 15% commission
  },

  // Content moderation
  moderation: {
    autoApproveContent: process.env.AUTO_APPROVE_CONTENT === "true",
    moderationTimeoutSeconds: 60, // 1 minute for moderation before auto-approval
  },
}

