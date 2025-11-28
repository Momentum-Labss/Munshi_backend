import type { Request, Response } from "express"
import { ProfileService } from "../services/ProfileService"
import { ok, badRequest, serverError } from "../utils/http"
import type { AuthenticatedRequest } from "../middleware/auth"

export const ProfileController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.body.userId // from JWT middleware or body
      const data = req.body
      const profile = await ProfileService.createProfile(userId, data)
      return ok(res, profile)
    } catch (err: any) {
      console.error(err)
      return badRequest(res, err.message || "Failed to create profile")
    }
  },

  async get(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = Number(req.params.userId)
      const profile = await ProfileService.getProfile(userId)
      return ok(res, profile)
    } catch (err: any) {
      return badRequest(res, err.message)
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = Number(req.params.userId)
      const profile = await ProfileService.updateProfile(userId, req.body)
      return ok(res, profile)
    } catch (err: any) {
      return badRequest(res, err.message)
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = Number(req.params.userId)
      const result = await ProfileService.deleteProfile(userId)
      return ok(res, result)
    } catch (err: any) {
      return badRequest(res, err.message)
    }
  },

  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const profiles = await ProfileService.listAllProfiles()
      return ok(res, profiles as any)
    } catch (err: any) {
      return serverError(res)
    }
  }
}
