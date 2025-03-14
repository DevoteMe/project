import express from "express"
import { StripeWebhookController } from "../controllers/webhooks/stripe-webhook.controller"
import { PayPalWebhookController } from "../controllers/webhooks/paypal-webhook.controller"
import { MailchimpWebhookController } from "../controllers/webhooks/mailchimp-webhook.controller"
import { TwilioWebhookController } from "../controllers/webhooks/twilio-webhook.controller"
import { CloudinaryWebhookController } from "../controllers/webhooks/cloudinary-webhook.controller"
import { rawBodyMiddleware } from "../middleware/raw-body.middleware"

const router = express.Router()

// Initialize webhook controllers
const stripeWebhookController = new StripeWebhookController()
const paypalWebhookController = new PayPalWebhookController()
const mailchimpWebhookController = new MailchimpWebhookController()
const twilioWebhookController = new TwilioWebhookController()
const cloudinaryWebhookController = new CloudinaryWebhookController()

// We need the raw body for signature verification
router.use(rawBodyMiddleware)

// Stripe webhook endpoint
router.post("/stripe", async (req, res) => {
  await stripeWebhookController.handleWebhook(req, res)
})

// PayPal webhook endpoint
router.post("/paypal", async (req, res) => {
  await paypalWebhookController.handleWebhook(req, res)
})

// Mailchimp webhook endpoint
router.post("/mailchimp", async (req, res) => {
  await mailchimpWebhookController.handleWebhook(req, res)
})

// Twilio webhook endpoint
router.post("/twilio", async (req, res) => {
  await twilioWebhookController.handleWebhook(req, res)
})

// Cloudinary webhook endpoint
router.post("/cloudinary", async (req, res) => {
  await cloudinaryWebhookController.handleWebhook(req, res)
})

export default router

