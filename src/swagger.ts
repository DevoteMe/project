import swaggerJsdoc from "swagger-jsdoc"
import { version } from "../package.json"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DevoteMe API Documentation",
      version,
      description: "API documentation for the DevoteMe social media platform",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      contact: {
        name: "DevoteMe Support",
        url: "https://devoteme.com/support",
        email: "support@devoteme.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
      {
        url: "https://api.devoteme.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Unauthorized",
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: "User does not have permission to access this resource",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Forbidden",
                  },
                },
              },
            },
          },
        },
        BadRequestError: {
          description: "Invalid request parameters",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Bad Request",
                  },
                  errors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        field: {
                          type: "string",
                        },
                        message: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Not Found",
                  },
                },
              },
            },
          },
        },
        TooManyRequestsError: {
          description: "Rate limit exceeded",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Too Many Requests",
                  },
                  retryAfter: {
                    type: "number",
                    example: 60,
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        // Existing schemas...

        // New schemas for analytics and webhooks
        AnalyticsEvent: {
          type: "object",
          properties: {
            eventType: {
              type: "string",
              enum: ["pageView", "contentView", "interaction", "conversion", "error"],
              description: "Type of analytics event",
            },
            userId: {
              type: "string",
              description: "ID of the user who triggered the event (if authenticated)",
            },
            sessionId: {
              type: "string",
              description: "Unique session identifier",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "When the event occurred",
            },
            properties: {
              type: "object",
              description: "Additional properties specific to the event type",
            },
          },
          required: ["eventType", "sessionId", "timestamp"],
        },
        AnalyticsSummary: {
          type: "object",
          properties: {
            totalUsers: {
              type: "number",
              description: "Total number of users",
            },
            activeUsers: {
              type: "number",
              description: "Number of active users in the selected time period",
            },
            newUsers: {
              type: "number",
              description: "Number of new users in the selected time period",
            },
            totalPageViews: {
              type: "number",
              description: "Total number of page views",
            },
            averageSessionDuration: {
              type: "number",
              description: "Average session duration in seconds",
            },
            bounceRate: {
              type: "number",
              description: "Bounce rate percentage",
            },
            topContent: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  contentId: {
                    type: "string",
                    description: "ID of the content",
                  },
                  title: {
                    type: "string",
                    description: "Title of the content",
                  },
                  views: {
                    type: "number",
                    description: "Number of views",
                  },
                },
              },
            },
            topReferrers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  source: {
                    type: "string",
                    description: "Referrer source",
                  },
                  count: {
                    type: "number",
                    description: "Number of referrals",
                  },
                },
              },
            },
          },
        },
        TimeSeriesData: {
          type: "object",
          properties: {
            timePoints: {
              type: "array",
              items: {
                type: "string",
                format: "date-time",
              },
              description: "Array of time points",
            },
            metrics: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: {
                  type: "number",
                },
              },
              description: "Metrics data for each time point",
            },
          },
        },
        WebhookEvent: {
          type: "object",
          properties: {
            provider: {
              type: "string",
              enum: ["stripe", "paypal", "mailchimp", "twilio", "cloudinary"],
              description: "The provider that sent the webhook",
            },
            eventType: {
              type: "string",
              description: "Type of event from the provider",
            },
            payload: {
              type: "object",
              description: "The webhook payload from the provider",
            },
            signature: {
              type: "string",
              description: "Webhook signature for verification",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "When the webhook was received",
            },
          },
          required: ["provider", "eventType", "payload"],
        },
        SystemHealth: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["healthy", "degraded", "unhealthy"],
              description: "Overall system health status",
            },
            uptime: {
              type: "number",
              description: "Server uptime in seconds",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Current server time",
            },
            services: {
              type: "object",
              additionalProperties: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["healthy", "degraded", "unhealthy"],
                  },
                  responseTime: {
                    type: "number",
                    description: "Response time in milliseconds",
                  },
                  message: {
                    type: "string",
                    description: "Additional status information",
                  },
                },
              },
              description: "Status of individual services",
            },
            metrics: {
              type: "object",
              properties: {
                cpu: {
                  type: "number",
                  description: "CPU usage percentage",
                },
                memory: {
                  type: "number",
                  description: "Memory usage percentage",
                },
                requestsPerMinute: {
                  type: "number",
                  description: "Number of requests per minute",
                },
                errorRate: {
                  type: "number",
                  description: "Error rate percentage",
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/docs/*.yaml"],
}

const specs = swaggerJsdoc(options)

export default specs

