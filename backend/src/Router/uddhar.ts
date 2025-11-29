import { Router } from "express";
import { udhaarController } from "../controllers/uddharController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { CreateCustomerSchema } from "../utils/schema/uddhar";

const router = Router();

router.post("/customer", authenticate, validate(CreateCustomerSchema), udhaarController.addCustomer);

// GET /api/v1/udhaar/customers?page=1&search=ramesh
// GET /api/v1/udhaar/customers?type=debtors (Gets list of people who owe money)
router.get("/customers",authenticate,  udhaarController.getCustomers);

export default router;