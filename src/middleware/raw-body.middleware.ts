import type { Request, Response, NextFunction } from "express"
import bodyParser from "body-parser"

/**
 * Middleware to capture the raw body for webhook signature verification
 */
export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf
    },
  })(req, res, next)
}

