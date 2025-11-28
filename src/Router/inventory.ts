import { Router } from "express";
import { inventoryController } from "../controllers/inventoryController";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/inventory?page=1&limit=10&search=rice&type=LOOSE&lowStock=true
router.get("/", authenticate, inventoryController.listProducts);

// Payload: { "command": "50 maggi add karo" }
router.post("/voice-parse", authenticate, inventoryController.voiceParse);

// STEP 2: Confirm & Execute (Updates DB)
// Payload: { "items": [ { "rawName": "maggi", "quantity": 50, ... } ] }
router.post("/voice-confirm", authenticate, inventoryController.voiceConfirm);

export default router;