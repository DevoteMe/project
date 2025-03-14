import express from "express"
import { webhookController } from "../controllers/webhook.controller"
import { validateRequest } from "../middleware/validation.middleware"
import { webhookValidation } from "../validations/webhook.validation"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook endpoints for third-party integrations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WebhookEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the webhook event
 *         type:
 *           type: string
 *           description: Type of webhook event
 *           example: payment.succeeded
 *         data:
 *           type: object
 *           description: Event data payload
 *         created:
 *           type: integer
 *           description: Unix timestamp of when the event was created
 */

/**
 * @swagger
 * /webhooks/stripe:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Webhooks]
 *     description: Endpoint for receiving webhook events from Stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookEvent'
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/stripe", validateRequest(webhookValidation.stripeWebhook), webhookController.handleStripeWebhook)

/**
 * @swagger
 * /webhooks/paypal:
 *   post:
 *     summary: Handle PayPal webhook events
 *     tags: [Webhooks]
 *     description: Endpoint for receiving webhook events from PayPal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookEvent'
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/paypal", validateRequest(webhookValidation.paypalWebhook), webhookController.handlePaypalWebhook)

/**
 * @swagger
 * /webhooks/mailchimp:
 *   post:
 *     summary: Handle Mailchimp webhook events
 *     tags: [Webhooks]
 *     description: Endpoint for receiving webhook events from Mailchimp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/mailchimp", validateRequest(webhookValidation.mailchimpWebhook), webhookController.handleMailchimpWebhook)

/**
 * @swagger
 * /webhooks/twilio:
 *   post:
 *     summary: Handle Twilio webhook events
 *     tags: [Webhooks]
 *     description: Endpoint for receiving webhook events from Twilio
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/twilio", express.urlencoded({ extended: true }), webhookController.handleTwilioWebhook)

/**
 * @swagger
 * /webhooks/cloudinary:
 *   post:
 *     summary: Handle Cloudinary webhook events
 *     tags: [Webhooks]
 *     description: Endpoint for receiving webhook events from Cloudinary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/cloudinary",
  validateRequest(webhookValidation.cloudinaryWebhook),
  webhookController.handleCloudinaryWebhook,
)

export default router

