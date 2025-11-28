import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { salesController } from "../controllers/salesController";
import { validate } from "../middleware/validate";
import { CreateTransactionSchema } from "../utils/schema/Sale";

const router =  Router()
router.get("/get-suggestion", authenticate, salesController.getSuggestion)
router.post("/transaction", authenticate, validate(CreateTransactionSchema), salesController.createTransaction)

export default router

