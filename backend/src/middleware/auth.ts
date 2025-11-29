import type { Request, Response, NextFunction } from "express"
import { verify } from "../utils/jwt"
import { badRequest } from "../utils/http"

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number
    emailId: string
  }
}


export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return badRequest(res, "Missing or invalid authorization header")
    }

    const token = authHeader.split(" ")[1]
    if (!token) return badRequest(res, "Token not provided")

    const decoded = verify(token) as { userId: number; emailId: string }

    if (!decoded || !decoded.userId) {
      return badRequest(res, "Invalid or expired token")
    }

    req.user = {
      userId: decoded.userId,
      emailId: decoded.emailId,
    }
    next()
  } catch (err) {
    console.error("[AUTH ERROR]", err)
    return badRequest(res, "Authentication failed")
  }
}
