import type { Request, Response } from "express"
import { logger } from "../../utils/logger"

export abstract class BaseWebhookController {
  protected abstract verifySignature(req: Request): boolean
  protected abstract processEvent(event: any): Promise<void>

  /**
   * Handle incoming webhook request
   */
  public async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.verifySignature(req)) {
        logger.warn("Invalid webhook signature", {
          service: this.constructor.name,
          ip: req.ip,
        })
        res.status(401).json({ error: "Invalid signature" })
        return
      }

      // Process the event
      await this.processEvent(req.body)

      // Return success response
      res.status(200).json({ received: true })
    } catch (error) {
      logger.error("Error processing webhook", {
        error: error.message,
        service: this.constructor.name,
        body: req.body,
      })

      // Always return 200 to prevent retries (even on error)
      // We'll handle failures internally through our own retry mechanism
      res.status(200).json({ received: true, error: "Event processing queued" })
    }
  }
}

