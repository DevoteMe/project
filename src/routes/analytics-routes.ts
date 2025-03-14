import express from "express"
import { analyticsController } from "../controllers/analytics.controller"
import { authenticate } from "../middleware/auth.middleware"
import { authorize } from "../middleware/authorization.middleware"
import { cacheMiddleware } from "../middleware/cache.middleware"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics endpoints
 */

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get analytics dashboard data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Returns analytics data for the dashboard
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/dashboard",
  authenticate,
  authorize(["admin", "creator"]),
  cacheMiddleware({ ttl: 300 }),
  analyticsController.getDashboardData,
)

/**
 * @swagger
 * /analytics/content/{contentId}:
 *   get:
 *     summary: Get analytics for specific content
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Returns analytics data for a specific content item
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Content analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/content/:contentId",
  authenticate,
  authorize(["admin", "creator"]),
  cacheMiddleware({ ttl: 300 }),
  analyticsController.getContentAnalytics,
)

/**
 * @swagger
 * /analytics/realtime:
 *   get:
 *     summary: Get real-time analytics data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Returns real-time analytics data
 *     responses:
 *       200:
 *         description: Real-time analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/realtime", authenticate, authorize(["admin", "creator"]), analyticsController.getRealTimeAnalytics)

/**
 * @swagger
 * /analytics/export:
 *   get:
 *     summary: Export analytics data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Exports analytics data in CSV format
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [users, content, subscriptions, payments]
 *         description: Type of data to export
 *     responses:
 *       200:
 *         description: Analytics data exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/export", authenticate, authorize(["admin"]), analyticsController.exportAnalyticsData)

export default router

