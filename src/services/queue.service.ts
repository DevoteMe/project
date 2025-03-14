import { Queue, Worker, type Job } from "bullmq"
import { Redis } from "ioredis"
import { config } from "../config/app-config"
import { logger } from "../utils/logger"

export class QueueService {
  private queues: Record<string, Queue> = {}
  private workers: Record<string, Worker> = {}
  private redisClient: Redis

  constructor() {
    this.redisClient = new Redis(config.redis.url)

    // Initialize queues
    this.initializeQueues()
  }

  /**
   * Initialize queues and workers
   */
  private initializeQueues() {
    // Define queue names
    const queueNames = ["stripe-webhook", "paypal-webhook", "mailchimp-webhook", "twilio-webhook", "cloudinary-webhook"]

    // Create queues
    queueNames.forEach((queueName) => {
      this.queues[queueName] = new Queue(queueName, {
        connection: this.redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        },
      })

      // Create workers
      this.workers[queueName] = new Worker(
        queueName,
        async (job: Job) => {
          logger.info(`Processing job from queue ${queueName}`, {
            jobId: job.id,
            data: job.data,
          })

          try {
            // Process job based on queue name
            switch (queueName) {
              case "stripe-webhook":
                await this.processStripeWebhook(job.data)
                break
              case "paypal-webhook":
                await this.processPayPalWebhook(job.data)
                break
              case "mailchimp-webhook":
                await this.processMailchimpWebhook(job.data)
                break
              case "twilio-webhook":
                await this.processTwilioWebhook(job.data)
                break
              case "cloudinary-webhook":
                await this.processCloudinaryWebhook(job.data)
                break
            }

            logger.info(`Job completed successfully`, {
              jobId: job.id,
              queue: queueName,
            })
          } catch (error) {
            logger.error(`Error processing job`, {
              jobId: job.id,
              queue: queueName,
              error: error.message,
              stack: error.stack,
            })
            throw error // Rethrow to trigger retry
          }
        },
        { connection: this.redisClient },
      )

      // Handle worker events
      this.workers[queueName].on("failed", (job, error) => {
        logger.error(`Job failed`, {
          jobId: job?.id,
          queue: queueName,
          error: error.message,
          attempts: job?.attemptsMade,
        })
      })
    })
  }

  /**
   * Add a job to a queue
   */
  public async addJob(queueName: string, data: any): Promise<string> {
    const queue = this.queues[queueName]

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    const job = await queue.add(queueName, data)
    return job.id
  }

  /**
   * Process Stripe webhook job
   */
  private async processStripeWebhook(data: any): Promise<void> {
    // Implement detailed processing logic here
    // This would typically involve updating database records,
    // sending notifications, etc.
    logger.info("Processing Stripe webhook job", {
      eventType: data.eventType,
      eventId: data.eventId,
    })

    // Example: Process different event types
    switch (data.eventType) {
      case "checkout.session.completed":
        // Process checkout completion
        break
      case "customer.subscription.created":
        // Process subscription creation
        break
      // Add more event types as needed
    }
  }

  /**
   * Process PayPal webhook job
   */
  private async processPayPalWebhook(data: any): Promise<void> {
    // Implement PayPal webhook processing logic
    logger.info("Processing PayPal webhook job", {
      eventType: data.eventType,
      eventId: data.eventId,
    })
  }

  /**
   * Process Mailchimp webhook job
   */
  private async processMailchimpWebhook(data: any): Promise<void> {
    // Implement Mailchimp webhook processing logic
    logger.info("Processing Mailchimp webhook job", {
      eventType: data.eventType,
    })
  }

  /**
   * Process Twilio webhook job
   */
  private async processTwilioWebhook(data: any): Promise<void> {
    // Implement Twilio webhook processing logic
    logger.info("Processing Twilio webhook job", {
      eventType: data.eventType,
    })
  }

  /**
   * Process Cloudinary webhook job
   */
  private async processCloudinaryWebhook(data: any): Promise<void> {
    // Implement Cloudinary webhook processing logic
    logger.info("Processing Cloudinary webhook job", {
      eventType: data.eventType,
    })
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    // Close all workers
    await Promise.all(Object.values(this.workers).map((worker) => worker.close()))

    // Close all queues
    await Promise.all(Object.values(this.queues).map((queue) => queue.close()))

    // Close Redis connection
    await this.redisClient.quit()
  }
}

