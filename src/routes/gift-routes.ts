import express from "express"
import { giftController } from "../controllers/gift.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { validateRequest } from "../middleware/validation.middleware"
import { giftValidation } from "../validations/gift.validation"

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Gift:
 *       type: object
 *       required:
 *         - senderId
 *         - recipientId
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the gift
 *         senderId:
 *           type: string
 *           description: ID of the user sending the gift
 *         recipientId:
 *           type: string
 *           description: ID of the creator receiving the gift
 *         amount:
 *           type: number
 *           description: Amount of the gift in cents
 *         message:
 *           type: string
 *           description: Optional message from the sender
 *         contentId:
 *           type: string
 *           description: Optional ID of the content the gift is associated with
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: Status of the gift transaction
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /gifts:
 *   get:
 *     summary: Get all gifts for the authenticated user (sent or received)
 *     tags: [Gift]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sent, received]
 *         description: Filter by gifts sent or received
 *     responses:
 *       200:
 *         description: List of gifts
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
 *                     $ref: '#/components/schemas/Gift'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", authMiddleware, giftController.getUserGifts)

/**
 * @swagger
 * /gifts/{id}:
 *   get:
 *     summary: Get a gift by ID
 *     tags: [Gift]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gift ID
 *     responses:
 *       200:
 *         description: Gift details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Gift'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", authMiddleware, giftController.getGift)

/**
 * @swagger
 * /gifts:
 *   post:
 *     summary: Send a new gift
 *     tags: [Gift]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - amount
 *               - paymentMethodId
 *             properties:
 *               recipientId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 100
 *               message:
 *                 type: string
 *                 maxLength: 500
 *               contentId:
 *                 type: string
 *               paymentMethodId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gift sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Gift'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", authMiddleware, validateRequest(giftValidation.createGift), giftController.sendGift)

export default router

