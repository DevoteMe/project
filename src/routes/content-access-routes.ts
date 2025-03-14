import express from "express"
import { contentAccessController } from "../controllers/content-access.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { validateRequest } from "../middleware/validation.middleware"
import { contentAccessValidation } from "../validations/content-access.validation"

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentAccess:
 *       type: object
 *       required:
 *         - userId
 *         - contentId
 *         - accessType
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the content access record
 *         userId:
 *           type: string
 *           description: ID of the user with access
 *         contentId:
 *           type: string
 *           description: ID of the content being accessed
 *         accessType:
 *           type: string
 *           enum: [subscription, gift, purchase, free]
 *           description: How the user gained access to the content
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: When the access expires (null for permanent access)
 *         referenceId:
 *           type: string
 *           description: ID of the subscription, gift, or purchase that granted access
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /content-access:
 *   get:
 *     summary: Get all content access records for the authenticated user
 *     tags: [ContentAccess]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of content access records
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
 *                     $ref: '#/components/schemas/ContentAccess'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", authMiddleware, contentAccessController.getUserContentAccess)

/**
 * @swagger
 * /content-access/check/{contentId}:
 *   get:
 *     summary: Check if the authenticated user has access to specific content
 *     tags: [ContentAccess]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID to check access for
 *     responses:
 *       200:
 *         description: Access check result
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
 *                   properties:
 *                     hasAccess:
 *                       type: boolean
 *                     accessDetails:
 *                       $ref: '#/components/schemas/ContentAccess'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/check/:contentId", authMiddleware, contentAccessController.checkContentAccess)

/**
 * @swagger
 * /content-access:
 *   post:
 *     summary: Grant content access to a user (admin/creator only)
 *     tags: [ContentAccess]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - contentId
 *               - accessType
 *             properties:
 *               userId:
 *                 type: string
 *               contentId:
 *                 type: string
 *               accessType:
 *                 type: string
 *                 enum: [subscription, gift, purchase, free]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               referenceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Content access granted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ContentAccess'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/",
  authMiddleware,
  validateRequest(contentAccessValidation.grantAccess),
  contentAccessController.grantContentAccess,
)

/**
 * @swagger
 * /content-access/{id}:
 *   delete:
 *     summary: Revoke content access (admin/creator only)
 *     tags: [ContentAccess]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content access ID to revoke
 *     responses:
 *       200:
 *         description: Content access revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Content access revoked successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete("/:id", authMiddleware, contentAccessController.revokeContentAccess)

export default router

