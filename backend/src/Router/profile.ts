import { Router } from "express"
import { ProfileController } from "../controllers/ProfileController"
import { authenticate, type AuthenticatedRequest } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { createProfileZSchema, updateProfileZSchema } from "../utils/schema/Profile"

const router = Router()
router.post(
  "/",
  authenticate,
  validate(createProfileZSchema),
  ProfileController.create
)
router.get("/", authenticate, ProfileController.get)
router.get("/list-all", authenticate, ProfileController.list)
router.put(
  "/:userId",
  authenticate,
  validate(updateProfileZSchema),
  ProfileController.update
)
router.delete("/:userId", authenticate, ProfileController.delete)

export default router

