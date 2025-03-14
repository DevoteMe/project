import express from "express"
import { subscriptionController } from "../controllers/subscription.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { validateRequest } from "../middleware/validation.middleware"
import { subscriptionValidation } from "../validations/subscription.validation"

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       required:
 *         - userId
 *         - creatorId
 *         - planId
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the subscription
 *         userId:
 *           type: string
 *           description: ID of the subscriber
 *         creatorId:
 *           type: string
 *           description: ID of the creator being subscribed to
 *         planId:
 *           type: string
 *           description: ID of the subscription plan
 *         status:
 *           type: string
 *           enum: [active, canceled, paused, past_due]
 *           description: Current status of the subscription
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the subscription started
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the subscription ends/ended
 *         renewalDate:
 *           type: string
 *           format: date-time
 *           description: When the subscription will renew
 *         paymentMethod:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [credit_card, paypal, crypto]
 *             lastFour:
 *               type: string
 *             expiryDate:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SubscriptionPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         interval:
 *           type: string
 *           enum: [monthly, quarterly, yearly]
 *         features:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Get all subscriptions for the authenticated user
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", authMiddleware, subscriptionController.getUserSubscriptions)

/**
 * @swagger
 * /subscriptions/creator:
 *   get:
 *     summary: Get all subscribers for the authenticated creator
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscribers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/creator", authMiddleware, subscriptionController.getCreatorSubscribers)

/**
 * @swagger
 * /subscriptions/{id}:
 *   get:
 *     summary: Get a subscription by ID
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", authMiddleware, subscriptionController.getSubscription)

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creatorId
 *               - planId
 *               - paymentMethodId
 *             properties:
 *               creatorId:
 *                 type: string
 *               planId:
 *                 type: string
 *               paymentMethodId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/",
  authMiddleware,
  validateRequest(subscriptionValidation.createSubscription),
  subscriptionController.createSubscription,
)

/**
 * @swagger
 * /subscriptions/{id}/cancel:
 *   post:
 *     summary: Cancel a subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/:id/cancel", authMiddleware, subscriptionController.cancelSubscription)

/**
 * @swagger
 * /subscriptions/{id}/pause:
 *   post:
 *     summary: Pause a subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription paused successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/:id/pause", authMiddleware, subscriptionController.pauseSubscription)

/**
 * @swagger
 * /subscriptions/{id}/resume:
 *   post:
 *     summary: Resume a paused subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription resumed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/:id/resume", authMiddleware, subscriptionController.resumeSubscription)

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     summary: Get all subscription plans for a creator
 *     tags: [Subscription]
 *     parameters:
 *       - in: query
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Creator ID
 *     responses:
 *       200:
 *         description: List of subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubscriptionPlan'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/plans", subscriptionController.getSubscriptionPlans)

export default router

