import { Router } from "express"
import { AuthController } from "../controllers/authController"
import { validate } from "../middleware/validate"
import { authZSchema, verifyZSchema } from "../utils/schema/Auth"

const router = Router()

// Signup

router.post("/signup", validate(authZSchema), AuthController.signup)
router.post("/signup/verify", validate(verifyZSchema), AuthController.signupVerify)

// Signin
router.post("/signin", validate(authZSchema), AuthController.signin)
router.post("/signin/verify", validate(verifyZSchema), AuthController.signinVerify)

export default router
