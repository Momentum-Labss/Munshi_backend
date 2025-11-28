import type { Request, Response } from "express"
import { AuthService } from "../services/authService"
import { ok, badRequest } from "../utils/http"
import { sign } from "../utils/jwt"
import type z from "zod"
import type { authZSchema, verifyZSchema } from "../utils/schema/Auth"



type SignupReq = Request<{}, {}, z.infer<typeof authZSchema>>
type VerifyReq = Request<{}, {}, z.infer<typeof verifyZSchema>>


export const AuthController = {
  async signup(req: SignupReq, res: Response) {
    try {
      const { email } = req.body
      const result = await AuthService.signup(email)
      return ok(res, result)
    } catch (err: any) {
      return badRequest(res, err.message)
    }
  },

  async signupVerify(req: VerifyReq, res: Response) {
    try {
      const { tempId, otp } = req.body
      const user = await AuthService.signupVerify(tempId, otp)
      const token = sign({ userId: user.id, emailId: user.emailId })
      return ok(res, { token })
    } catch (err: any) {
      return badRequest(res, err.message)
    }
  },

  async signin(req : SignupReq, res: Response) {
    try {
      const { email } = req.body
      const result = await AuthService.signin(email)
      return ok(res, result)
    } catch (err: any) {
      return badRequest(res, err.message)
    }
  },

  async signinVerify(req: VerifyReq, res: Response) {
    try {
      const { tempId, otp } = req.body
      const user = await AuthService.signinVerify(tempId, otp)
      const token = sign({ userId: user.id, emailId: user.emailId })
      return ok(res, { token })
    } catch (err: any) {
      return badRequest(res, err.message)
    }
  }
}
